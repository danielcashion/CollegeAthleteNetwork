"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import PayPalProvider from "@/providers/PaypalProvider";
import GolfPayPalButton from "./GolfPayPalButton";
import type { GolfOutingPublic, GolfTicketPublic } from "@/services/getGolfOutingPublic";

type Player = { first_name: string; last_name: string; email: string };

export default function GolfRegisterForm({
  event,
  tickets,
}: {
  event: GolfOutingPublic;
  tickets: GolfTicketPublic[];
}) {
  const [ticketId, setTicketId] = useState(tickets[0]?.ticket_type_id || 0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [players, setPlayers] = useState<Player[]>([{ first_name: "", last_name: "", email: "" }]);
  const [pending, setPending] = useState<{ order_id: number; total_cents: number } | null>(null);
  const ticket = tickets.find((t) => t.ticket_type_id === Number(ticketId));
  const teamTicket = /four|team/i.test(ticket?.type_name || "");
  const playerSlots = useMemo(() => (teamTicket ? 4 : 1), [teamTicket]);

  function updatePlayer(index: number, key: keyof Player, value: string) {
    setPlayers((prev) => {
      const next = [...prev];
      while (next.length < playerSlots) next.push({ first_name: "", last_name: "", email: "" });
      next[index] = { ...next[index], [key]: value };
      return next.slice(0, playerSlots);
    });
  }

  async function hold() {
    const roster = (teamTicket ? players.slice(0, 4) : players.slice(0, 1)).map((player, index) =>
      index === 0 && !player.first_name
        ? { first_name: name.split(" ")[0] || name, last_name: name.split(" ").slice(1).join(" "), email }
        : player
    );
    const res = await fetch("/api/golf/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: event.event_id,
        ticket_type_id: Number(ticketId),
        purchaser_name: name,
        purchaser_email: email,
        purchaser_phone: phone,
        players: roster,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Could not reserve");
      return;
    }
    setPending({ order_id: data.order_id, total_cents: data.total_cents || ticket?.unit_price_cents || 0 });
  }

  if (event.event_status !== "PUBLISHED") {
    return <p className="text-[#1c315f]">Registration is closed for this outing.</p>;
  }
  if (tickets.length === 0) {
    return <p className="text-[#1c315f]">No tickets are available yet.</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-3">
      <select className="w-full rounded border p-3" value={ticketId} onChange={(e) => setTicketId(Number(e.target.value))}>
        {tickets.map((t) => (
          <option key={t.ticket_type_id} value={t.ticket_type_id}>
            {t.type_name} · ${(t.unit_price_cents / 100).toFixed(0)}
          </option>
        ))}
      </select>
      <input className="w-full rounded border p-3" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="w-full rounded border p-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded border p-3" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      {teamTicket && (
        <div className="space-y-2 rounded border p-3">
          <p className="font-medium">Foursome players</p>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="grid grid-cols-3 gap-2">
              <input className="rounded border p-2" placeholder="First" value={players[index]?.first_name || ""} onChange={(e) => updatePlayer(index, "first_name", e.target.value)} />
              <input className="rounded border p-2" placeholder="Last" value={players[index]?.last_name || ""} onChange={(e) => updatePlayer(index, "last_name", e.target.value)} />
              <input className="rounded border p-2" placeholder="Email" value={players[index]?.email || ""} onChange={(e) => updatePlayer(index, "email", e.target.value)} />
            </div>
          ))}
        </div>
      )}
      {!pending ? (
        <button className="w-full rounded-full bg-[#ED3237] px-4 py-3 font-semibold text-white" onClick={hold}>
          Continue to payment
        </button>
      ) : (
        <PayPalProvider>
          <GolfPayPalButton
            amount={pending.total_cents}
            golfData={{
              order_id: pending.order_id,
              event_id: event.event_id,
              event_name: event.event_name,
              university_name: event.university_name,
              category: "REGISTRATION",
              amount: pending.total_cents,
              purchaser_email: email,
              purchaser_name: name,
            }}
            onSuccess={async () => toast.success("Registration paid")}
            onError={() => toast.error("Payment failed")}
          />
        </PayPalProvider>
      )}
    </div>
  );
}
