"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import GolfPaymentReceipt from "@/components/checkout/GolfPaymentReceipt";
import PublicCheckout from "@/components/checkout/PublicCheckout";
import type { GolfOutingPublic, GolfTicketPublic } from "@/services/getGolfOutingPublic";
import {
  attendeesPerTicket,
  defaultFoursomeTeamName,
  formatCents,
  isValidEmail,
} from "./golfOutingDisplay";

type Attendee = { first_name: string; last_name: string; email: string; phone: string };

const emptyAttendee = (): Attendee => ({ first_name: "", last_name: "", email: "", phone: "" });

function ensureAttendees(list: Attendee[], count: number) {
  const next = list.slice(0, count);
  while (next.length < count) next.push(emptyAttendee());
  return next;
}

export default function GolfRegisterForm({
  event,
  tickets,
  initialTicketId,
}: {
  event: GolfOutingPublic;
  tickets: GolfTicketPublic[];
  initialTicketId?: number;
}) {
  const active = useMemo(
    () => [...tickets].sort((a, b) => (a.sort_order ?? 100) - (b.sort_order ?? 100)),
    [tickets]
  );
  const [ticketId, setTicketId] = useState(
    initialTicketId && active.some((ticket) => ticket.ticket_type_id === initialTicketId)
      ? initialTicketId
      : active[0]?.ticket_type_id || 0
  );
  const [quantity, setQuantity] = useState(1);
  const [attendees, setAttendees] = useState<Attendee[]>([emptyAttendee()]);
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [teamTouched, setTeamTouched] = useState<boolean[]>([]);
  const [holding, setHolding] = useState(false);
  const [pending, setPending] = useState<{ order_id: number; total_cents: number } | null>(null);
  const [paid, setPaid] = useState(false);
  const ticket = active.find((row) => row.ticket_type_id === Number(ticketId));
  const perTicket = attendeesPerTicket(ticket?.type_name);
  const slots = perTicket * quantity;
  const maxQuantity = Math.min(ticket?.inventory && ticket.inventory > 0 ? ticket.inventory : 10, 10);
  const roster = ensureAttendees(attendees, slots);
  const totalCents = (ticket?.unit_price_cents || 0) * quantity;
  const allComplete = roster.every(
    (person) => person.first_name.trim() && person.last_name.trim() && isValidEmail(person.email)
  );
  const primary = roster[0];
  const foursomeCount = perTicket === 4 ? quantity : 0;
  const resolvedTeamNames = Array.from({ length: foursomeCount }, (_, index) =>
    teamTouched[index] && teamNames[index]?.trim()
      ? teamNames[index].trim()
      : defaultFoursomeTeamName(primary.first_name, primary.last_name, index, foursomeCount)
  );

  function selectTicket(id: number) {
    setTicketId(id);
    setQuantity(1);
    setPending(null);
    const nextTicket = active.find((row) => row.ticket_type_id === id);
    setAttendees((prev) => ensureAttendees(prev, attendeesPerTicket(nextTicket?.type_name)));
    setTeamNames([]);
    setTeamTouched([]);
  }

  function changeQuantity(next: number) {
    const value = Math.min(maxQuantity, Math.max(1, next));
    setQuantity(value);
    setPending(null);
    setAttendees((prev) => ensureAttendees(prev, attendeesPerTicket(ticket?.type_name) * value));
    setTeamNames((prev) => prev.slice(0, value));
    setTeamTouched((prev) => prev.slice(0, value));
  }

  function updateAttendee(index: number, key: keyof Attendee, value: string) {
    setAttendees((prev) => {
      const next = ensureAttendees(prev, slots);
      next[index] = { ...next[index], [key]: value };
      return next;
    });
    setPending(null);
  }

  async function continueCheckout() {
    if (!allComplete || holding) return;
    setHolding(true);
    try {
      const response = await fetch("/api/golf/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.event_id,
          ticket_type_id: Number(ticketId),
          purchaser_name: `${primary.first_name.trim()} ${primary.last_name.trim()}`.trim(),
          purchaser_email: primary.email.trim(),
          purchaser_phone: primary.phone.trim() || undefined,
          quantity,
          team_names: resolvedTeamNames,
          players: roster,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Could not reserve registration");
      }
      setPending({
        order_id: Number(data.order_id),
        total_cents: Number(data.total_cents || totalCents),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reserve registration");
    } finally {
      setHolding(false);
    }
  }

  if (event.event_status !== "PUBLISHED") {
    return (
      <div className="rounded-2xl border border-dashed border-[#1C315F]/20 bg-[#f9faf8] p-8 text-center">
        <h2 className="text-2xl font-bold text-[#1C315F]">Registration is closed</h2>
        <p className="mt-2 text-[#1C315F]/70">This outing is no longer accepting new golfers.</p>
      </div>
    );
  }

  if (active.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#1C315F]/20 bg-[#f9faf8] p-8 text-center">
        <h2 className="text-2xl font-bold text-[#1C315F]">Tickets coming soon</h2>
        <p className="mt-2 text-[#1C315F]/70">
          Registration options have not been published yet.
          {event.contact_email ? ` Contact ${event.contact_email} for details.` : ""}
        </p>
      </div>
    );
  }

  const rosterSummary =
    perTicket === 4
      ? `This registers ${quantity} ${quantity === 1 ? "foursome" : "foursomes"} (${slots} people).`
      : ticket?.type_name?.toLowerCase().includes("dinner")
        ? `This registers ${slots} dinner ${slots === 1 ? "guest" : "guests"}.`
        : `This registers ${slots} ${slots === 1 ? "person" : "people"}.`;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1C315F]">Choose a ticket</h2>
          <p className="mt-1 text-sm text-[#1C315F]/70">
            {event.remaining_spots != null
              ? `${event.remaining_spots} spots remaining`
              : "Select a ticket, then add everyone you are registering."}
          </p>
        </div>
        {active.map((row) => {
          const selectedTicket = Number(ticketId) === row.ticket_type_id;
          return (
            <button
              key={row.ticket_type_id}
              type="button"
              onClick={() => selectTicket(row.ticket_type_id)}
              className={`w-full rounded-2xl border bg-white p-4 text-left shadow-md transition duration-200 ${
                selectedTicket
                  ? "border-[#1C315F] ring-2 ring-[#1C315F] ring-offset-2"
                  : "border-transparent hover:-translate-y-0.5 hover:shadow-lg"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-bold text-[#1C315F]">{row.type_name}</p>
                  <p className="mt-1 text-2xl font-bold text-[#ED3237]">{formatCents(row.unit_price_cents)}</p>
                </div>
                <span
                  className={`mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    selectedTicket ? "border-[#1C315F] bg-[#1C315F] text-white" : "border-[#1C315F]/30"
                  }`}
                >
                  {selectedTicket ? "✓" : ""}
                </span>
              </div>
              {row.inventory != null && (
                <p className="mt-2 text-sm text-[#1C315F]/70">{row.inventory} available</p>
              )}
              {row.description_html && (
                <div
                  className="prose mt-3 max-w-none text-sm text-[#1C315F]/70"
                  dangerouslySetInnerHTML={{ __html: row.description_html }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className={`h-fit ${paid ? "" : "rounded-2xl bg-white p-6 shadow-xl md:p-8"}`}>
        {paid && pending ? (
          <GolfPaymentReceipt
            title="Registration confirmed"
            eventName={event.event_name}
            universityName={event.university_name}
            orderId={pending.order_id}
            amountCents={pending.total_cents}
            email={primary.email.trim()}
            outingHref={`/golf-outing/${event.public_url_slug}`}
          />
        ) : (
          <>
        <h2 className="text-2xl font-bold text-[#1C315F]">{pending ? "Checkout" : "Who is attending?"}</h2>
        <p className="mt-1 text-sm text-[#1C315F]/70">
          {pending
            ? "Pay with PayPal, Venmo, or a debit or credit card."
            : "Add a ticket quantity, then enter first name, last name, email, and phone for each person."}
        </p>

        {!pending ? (
        <>
        <div className="mt-6 rounded-xl border border-[#1C315F]/15 p-4">
          <p className="text-sm font-semibold text-[#1C315F]">How many {ticket?.type_name} tickets?</p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#1C315F]/20 text-xl font-semibold text-[#1C315F] hover:bg-[#f3f4f2] disabled:opacity-40"
              disabled={quantity <= 1}
              onClick={() => changeQuantity(quantity - 1)}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="min-w-8 text-center text-xl font-bold text-[#1C315F]">{quantity}</span>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#1C315F]/20 text-xl font-semibold text-[#1C315F] hover:bg-[#f3f4f2] disabled:opacity-40"
              disabled={quantity >= maxQuantity}
              onClick={() => changeQuantity(quantity + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <p className="mt-2 text-sm text-[#1C315F]/70">{rosterSummary}</p>
        </div>

        <div className="mt-6 space-y-4">
          {perTicket === 4
            ? Array.from({ length: quantity }, (_, groupIndex) => (
                <div key={groupIndex} className="space-y-3 rounded-xl border border-[#1C315F]/15 p-4">
                  <p className="text-sm font-semibold text-[#1C315F]">
                    {quantity > 1 ? `Foursome ${groupIndex + 1}` : "Foursome"}
                  </p>
                  <label className="block text-sm font-semibold text-[#1C315F]">
                    Team name
                    <input
                      className="mt-1 w-full rounded-lg border border-[#1C315F]/20 p-3 font-normal outline-none focus:border-[#1C315F]"
                      value={resolvedTeamNames[groupIndex] || ""}
                      maxLength={120}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 120);
                        setTeamNames((prev) => {
                          const next = [...prev];
                          next[groupIndex] = value;
                          return next;
                        });
                        setTeamTouched((prev) => {
                          const next = [...prev];
                          next[groupIndex] = true;
                          return next;
                        });
                        setPending(null);
                      }}
                    />
                  </label>
                  {roster.slice(groupIndex * 4, groupIndex * 4 + 4).map((person, offset) => {
                    const index = groupIndex * 4 + offset;
                    return (
                      <div key={index} className="rounded-lg bg-[#f9faf8] p-3">
                        <p className="mb-3 text-sm font-semibold text-[#1C315F]">
                          {index === 0 ? "Person 1 · primary contact" : `Person ${index + 1}`}
                        </p>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,0.9fr)]">
                          <label className="block text-sm font-semibold text-[#1C315F]">
                            First name
                            <input
                              className="mt-1 w-full rounded-lg border border-[#1C315F]/20 p-3 font-normal outline-none focus:border-[#1C315F]"
                              value={person.first_name}
                              onChange={(e) => updateAttendee(index, "first_name", e.target.value)}
                            />
                          </label>
                          <label className="block text-sm font-semibold text-[#1C315F]">
                            Last name
                            <input
                              className="mt-1 w-full rounded-lg border border-[#1C315F]/20 p-3 font-normal outline-none focus:border-[#1C315F]"
                              value={person.last_name}
                              onChange={(e) => updateAttendee(index, "last_name", e.target.value)}
                            />
                          </label>
                          <label className="block text-sm font-semibold text-[#1C315F]">
                            Email
                            <input
                              type="email"
                              autoComplete="email"
                              className={`mt-1 w-full rounded-lg border p-3 font-normal outline-none focus:border-[#1C315F] ${
                                person.email.trim() && !isValidEmail(person.email)
                                  ? "border-[#ED3237]"
                                  : "border-[#1C315F]/20"
                              }`}
                              value={person.email}
                              onChange={(e) => updateAttendee(index, "email", e.target.value)}
                            />
                            {person.email.trim() && !isValidEmail(person.email) && (
                              <p className="mt-1 text-xs font-normal text-[#ED3237]">Enter a valid email address.</p>
                            )}
                          </label>
                          <label className="block text-sm font-semibold text-[#1C315F]">
                            Phone
                            <input
                              className="mt-1 w-full rounded-lg border border-[#1C315F]/20 p-3 font-normal outline-none focus:border-[#1C315F]"
                              value={person.phone}
                              onChange={(e) => updateAttendee(index, "phone", e.target.value)}
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            : roster.map((person, index) => (
                <div key={index} className="rounded-xl border border-[#1C315F]/15 p-4">
                  <p className="mb-3 text-sm font-semibold text-[#1C315F]">
                    {index === 0 ? "Person 1 · primary contact" : `Person ${index + 1}`}
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)_minmax(0,0.9fr)]">
                    <label className="block text-sm font-semibold text-[#1C315F]">
                      First name
                      <input
                        className="mt-1 w-full rounded-lg border border-[#1C315F]/20 p-3 font-normal outline-none focus:border-[#1C315F]"
                        value={person.first_name}
                        onChange={(e) => updateAttendee(index, "first_name", e.target.value)}
                      />
                    </label>
                    <label className="block text-sm font-semibold text-[#1C315F]">
                      Last name
                      <input
                        className="mt-1 w-full rounded-lg border border-[#1C315F]/20 p-3 font-normal outline-none focus:border-[#1C315F]"
                        value={person.last_name}
                        onChange={(e) => updateAttendee(index, "last_name", e.target.value)}
                      />
                    </label>
                    <label className="block text-sm font-semibold text-[#1C315F]">
                      Email
                      <input
                        type="email"
                        autoComplete="email"
                        className={`mt-1 w-full rounded-lg border p-3 font-normal outline-none focus:border-[#1C315F] ${
                          person.email.trim() && !isValidEmail(person.email)
                            ? "border-[#ED3237]"
                            : "border-[#1C315F]/20"
                        }`}
                        value={person.email}
                        onChange={(e) => updateAttendee(index, "email", e.target.value)}
                      />
                      {person.email.trim() && !isValidEmail(person.email) && (
                        <p className="mt-1 text-xs font-normal text-[#ED3237]">Enter a valid email address.</p>
                      )}
                    </label>
                    <label className="block text-sm font-semibold text-[#1C315F]">
                      Phone
                      <input
                        className="mt-1 w-full rounded-lg border border-[#1C315F]/20 p-3 font-normal outline-none focus:border-[#1C315F]"
                        value={person.phone}
                        onChange={(e) => updateAttendee(index, "phone", e.target.value)}
                      />
                    </label>
                  </div>
                </div>
              ))}
        </div>
        </>
        ) : null}

        <div className="mt-6 rounded-xl bg-[#f9faf8] p-4 text-[#1C315F]">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1C315F]/60">Selected</p>
          <p className="mt-1 text-lg font-bold">
            {quantity} × {ticket?.type_name}
          </p>
          <p className="text-2xl font-bold text-[#ED3237]">{formatCents(totalCents)}</p>
        </div>
        {!pending ? (
          <button
            type="button"
            disabled={!allComplete || holding}
            onClick={continueCheckout}
            className="mt-4 w-full rounded-full bg-[#ED3237] px-4 py-3 font-semibold text-white transition duration-200 hover:bg-[#1C315F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {holding ? "Reserving..." : "Continue to checkout"}
          </button>
        ) : (
          <div className="mt-4">
            <PublicCheckout
              amount={pending.total_cents}
              purchaserEmail={primary.email.trim()}
              purchaserName={`${primary.first_name.trim()} ${primary.last_name.trim()}`.trim()}
              successTitle="Registration paid"
              golfData={{
                order_id: pending.order_id,
                event_id: event.event_id,
                event_name: event.event_name,
                university_name: event.university_name,
                outing_slug: event.public_url_slug,
                category: "REGISTRATION",
                amount: pending.total_cents,
              }}
              onSuccess={async () => {
                setPaid(true);
                toast.success("Registration paid");
              }}
            />
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
