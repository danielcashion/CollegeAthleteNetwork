import { NextRequest } from "next/server";
import { doorOrganizer, loadEventById } from "./events";
import { assertDoorEvent, readDoorPass } from "./session";

export async function openDoor(request: NextRequest, eventId: string) {
  const pass = await readDoorPass(request);
  assertDoorEvent(pass, eventId);
  const { event } = await loadEventById(eventId);
  return { organizer: doorOrganizer(pass.memberId, event), event };
}
