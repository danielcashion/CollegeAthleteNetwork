"use client";

import { useMemo, useState } from "react";
import { formatCents, membersGolfCheckoutUrl } from "./golfOutingDisplay";
import type { GolfOutingPublic, GolfTicketPublic } from "@/services/getGolfOutingPublic";

type Player = { first_name: string; last_name: string; email: string };

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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [players, setPlayers] = useState<Player[]>([{ first_name: "", last_name: "", email: "" }]);
  const ticket = active.find((row) => row.ticket_type_id === Number(ticketId));
  const teamTicket = /four|team/i.test(ticket?.type_name || "") || event.registration_type === "TEAM";
  const slots = teamTicket ? 4 : 1;

  function updatePlayer(index: number, key: keyof Player, value: string) {
    setPlayers((prev) => {
      const next = [...prev];
      while (next.length < slots) next.push({ first_name: "", last_name: "", email: "" });
      next[index] = { ...next[index], [key]: value };
      return next.slice(0, slots);
    });
  }

  function continueCheckout() {
    if (!name.trim() || !email.trim()) return;
    window.location.href = membersGolfCheckoutUrl(event.public_url_slug, "register", {
      ticket: ticketId,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
    });
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

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1C315F]">Choose a ticket</h2>
          <p className="mt-1 text-sm text-[#1C315F]/70">
            {event.remaining_spots != null
              ? `${event.remaining_spots} spots remaining`
              : "Select an individual or foursome ticket."}
          </p>
        </div>
        {active.map((row) => {
          const selectedTicket = Number(ticketId) === row.ticket_type_id;
          return (
            <button
              key={row.ticket_type_id}
              type="button"
              onClick={() => setTicketId(row.ticket_type_id)}
              className={`w-full rounded-2xl border bg-white p-6 text-left shadow-md transition duration-200 ${
                selectedTicket
                  ? "border-[#1C315F] ring-2 ring-[#1C315F] ring-offset-2"
                  : "border-transparent hover:-translate-y-0.5 hover:shadow-lg"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-bold text-[#1C315F]">{row.type_name}</p>
                  <p className="mt-1 text-3xl font-bold text-[#ED3237]">{formatCents(row.unit_price_cents)}</p>
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

      <div className="h-fit rounded-2xl bg-white p-6 shadow-xl md:p-8">
        <h2 className="text-2xl font-bold text-[#1C315F]">Golfer details</h2>
        <p className="mt-1 text-sm text-[#1C315F]/70">
          Checkout is completed on the members site so your registration is tied to your account.
        </p>
        <div className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-[#1C315F]">
            Full name
            <input
              className="mt-1 w-full rounded-lg border border-[#1C315F]/20 p-3 font-normal outline-none focus:border-[#1C315F]"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold text-[#1C315F]">
            Email
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-[#1C315F]/20 p-3 font-normal outline-none focus:border-[#1C315F]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold text-[#1C315F]">
            Phone
            <input
              className="mt-1 w-full rounded-lg border border-[#1C315F]/20 p-3 font-normal outline-none focus:border-[#1C315F]"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>
          {teamTicket && (
            <div className="space-y-3 rounded-xl border border-[#1C315F]/15 p-4">
              <p className="font-semibold text-[#1C315F]">Foursome players</p>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-3">
                  <input
                    className="rounded-lg border border-[#1C315F]/20 p-2.5"
                    placeholder="First"
                    value={players[index]?.first_name || ""}
                    onChange={(e) => updatePlayer(index, "first_name", e.target.value)}
                  />
                  <input
                    className="rounded-lg border border-[#1C315F]/20 p-2.5"
                    placeholder="Last"
                    value={players[index]?.last_name || ""}
                    onChange={(e) => updatePlayer(index, "last_name", e.target.value)}
                  />
                  <input
                    className="rounded-lg border border-[#1C315F]/20 p-2.5"
                    placeholder="Email"
                    value={players[index]?.email || ""}
                    onChange={(e) => updatePlayer(index, "email", e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="rounded-xl bg-[#f9faf8] p-4 text-[#1C315F]">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1C315F]/60">Selected</p>
            <p className="mt-1 text-lg font-bold">{ticket?.type_name}</p>
            <p className="text-2xl font-bold text-[#ED3237]">{formatCents(ticket?.unit_price_cents)}</p>
          </div>
          <button
            type="button"
            disabled={!name.trim() || !email.trim()}
            onClick={continueCheckout}
            className="w-full rounded-full bg-[#ED3237] px-4 py-3 font-semibold text-white transition duration-200 hover:bg-[#1C315F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue to checkout
          </button>
          <p className="text-center text-xs text-[#1C315F]/60">
            You will sign in on members.collegeathletenetwork.org to complete payment.
          </p>
        </div>
      </div>
    </div>
  );
}
