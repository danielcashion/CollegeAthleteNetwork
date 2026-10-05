import { Organizer, HttpError } from "./session";
import { apiGet, dateKey, dollarsToCents, sameSchool, todayKey } from "./upstream";

type CalendarRow = {
  event_id?: string;
  university_name?: string;
  event_type?: string;
  activity_type?: string;
  title?: string;
  event_name?: string;
  event_title?: string;
  start_date?: string;
  event_startdate?: string;
  start_time?: string | null;
  location?: string | null;
  venue_name?: string | null;
  cost?: number | string | null;
  event_cost?: number | string | null;
  golf_outing_YN?: number | boolean | string | null;
  is_active_YN?: number | boolean | string | null;
  member_id?: string | null;
};

type GolfEventRow = {
  event_id: string;
  university_name?: string;
  university_event_id?: string | null;
  product_type?: string;
  event_name?: string;
  event_date?: string;
  event_status?: string;
  venue_name?: string | null;
  created_by?: string | null;
  is_active_YN?: number | boolean | string | null;
};

export type DoorEvent = {
  id: string;
  title: string;
  eventType: string;
  startDate: string;
  startTime: string | null;
  location: string | null;
  costCents: number;
  managedGolf: boolean;
  golfEventId: string | null;
  universityName: string;
};

function active(value: CalendarRow["is_active_YN"]) {
  return value !== 0 && value !== "0" && value !== false;
}

function truthy(value: CalendarRow["golf_outing_YN"]) {
  return value === 1 || value === "1" || value === true;
}

function openGolf(outing: GolfEventRow) {
  return active(outing.is_active_YN) && outing.event_status !== "CANCELLED";
}

async function fromCalendar(wanted: string): Promise<{ event: DoorEvent; memberId: string } | null> {
  const rows = await apiGet<CalendarRow>("/university_events", { event_id: wanted });
  const row = rows.find((item) => String(item.event_id || "").toUpperCase() === wanted);
  if (!row?.event_id || !active(row.is_active_YN)) return null;

  const golfRows = await apiGet<GolfEventRow>("/golf_events", {
    university_name: row.university_name,
  }).catch(() => [] as GolfEventRow[]);
  const eventType = row.event_type || row.activity_type || "Event";
  const golf = golfRows.find((outing) => outing.university_event_id === row.event_id && openGolf(outing));
  const event: DoorEvent = {
    id: String(row.event_id),
    title: row.title || row.event_name || row.event_title || "Event",
    eventType,
    startDate: dateKey(row.start_date || row.event_startdate) || "",
    startTime: row.start_time || null,
    location: row.location || row.venue_name || null,
    costCents: dollarsToCents(row.cost ?? row.event_cost),
    managedGolf: Boolean(golf) || (eventType === "Golf_Outing" && truthy(row.golf_outing_YN) && Boolean(golf)),
    golfEventId: golf?.event_id || null,
    universityName: row.university_name || "",
  };
  return { event, memberId: row.member_id ? String(row.member_id) : "DOOR" };
}

function fromGolf(outing: GolfEventRow): { event: DoorEvent; memberId: string } {
  const networking = outing.product_type === "NETWORKING";
  return {
    event: {
      id: String(outing.event_id),
      title: outing.event_name || "Event",
      eventType: networking ? "Networking" : "Golf_Outing",
      startDate: dateKey(outing.event_date) || "",
      startTime: null,
      location: outing.venue_name || null,
      costCents: 0,
      managedGolf: true,
      golfEventId: String(outing.event_id),
      universityName: outing.university_name || "",
    },
    memberId: outing.created_by ? String(outing.created_by) : "DOOR",
  };
}

export async function loadEventById(eventId: string): Promise<{ event: DoorEvent; memberId: string }> {
  const wanted = eventId.trim().toUpperCase();
  const calendar = await fromCalendar(wanted);
  if (calendar) return calendar;

  const golfRows = await apiGet<GolfEventRow>("/golf_events", { event_id: wanted }).catch(() => [] as GolfEventRow[]);
  const golf = golfRows.find((outing) => String(outing.event_id || "").toUpperCase() === wanted && openGolf(outing));
  if (!golf) throw new HttpError("Event not found", 404);
  if (golf.university_event_id) {
    const linked = await fromCalendar(String(golf.university_event_id).toUpperCase());
    if (linked) return linked;
  }
  return fromGolf(golf);
}

export function doorOrganizer(memberId: string, event: DoorEvent): Organizer {
  return {
    id: memberId,
    email: "",
    member_id: memberId,
    athlete_id: null,
    university_affiliation: event.universityName,
    member_name: null,
    picture: null,
    onboarded_YN: 1,
    role: "door",
    partner_id: null,
    sport: null,
    subscription_type: null,
  };
}

export async function listTodayEvents(organizer: Organizer): Promise<DoorEvent[]> {
  const rows = await apiGet<CalendarRow>("/university_events", {
    university_name: organizer.university_affiliation,
  });
  const golfRows = await apiGet<GolfEventRow>("/golf_events", {
    university_name: organizer.university_affiliation,
  }).catch(() => [] as GolfEventRow[]);
  const today = todayKey();

  return rows
    .filter((row) => active(row.is_active_YN) && sameSchool(organizer.university_affiliation, row.university_name))
    .map((row) => {
      const startDate = dateKey(row.start_date || row.event_startdate) || "";
      const eventType = row.event_type || row.activity_type || "Event";
      const golf = golfRows.find(
        (outing) =>
          outing.university_event_id === row.event_id &&
          active(outing.is_active_YN) &&
          outing.event_status !== "CANCELLED"
      );
      return {
        id: String(row.event_id || ""),
        title: row.title || row.event_name || row.event_title || "Event",
        eventType,
        startDate,
        startTime: row.start_time || null,
        location: row.location || row.venue_name || null,
        costCents: dollarsToCents(row.cost ?? row.event_cost),
        managedGolf: Boolean(golf) || (eventType === "Golf_Outing" && truthy(row.golf_outing_YN) && Boolean(golf)),
        golfEventId: golf?.event_id || null,
        universityName: row.university_name || organizer.university_affiliation,
      } satisfies DoorEvent;
    })
    .filter((event) => event.id && event.startDate === today)
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getDoorEvent(organizer: Organizer, eventId: string) {
  const events = await listTodayEvents(organizer);
  const event = events.find((item) => item.id === eventId);
  if (!event) {
    const rows = await apiGet<CalendarRow>("/university_events", { event_id: eventId });
    const row = rows.find((item) => item.event_id === eventId);
    if (!row || !sameSchool(organizer.university_affiliation, row.university_name)) {
      throw new HttpError("Event not found", 404);
    }
    throw new HttpError("This event is not on today's door list", 404);
  }
  if (!sameSchool(organizer.university_affiliation, event.universityName)) {
    throw new HttpError("Forbidden", 403);
  }
  return event;
}
