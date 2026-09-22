"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import PayPalProvider from "@/providers/PaypalProvider";
import GolfPayPalButton from "./GolfPayPalButton";
import type { GolfOutingPublic, GolfPackagePublic } from "@/services/getGolfOutingPublic";

export default function GolfSponsorForm({
  event,
  packages,
}: {
  event: GolfOutingPublic;
  packages: GolfPackagePublic[];
}) {
  const [packageId, setPackageId] = useState(packages[0]?.sponsorship_type_id || 0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [logo, setLogo] = useState("");
  const [players, setPlayers] = useState([
    { first_name: "", last_name: "", email: "" },
    { first_name: "", last_name: "", email: "" },
    { first_name: "", last_name: "", email: "" },
    { first_name: "", last_name: "", email: "" },
  ]);
  const [pending, setPending] = useState<{ order_id: number; total_cents: number } | null>(null);
  const selected = packages.find((pkg) => pkg.sponsorship_type_id === Number(packageId));

  async function hold() {
    const res = await fetch("/api/golf/sponsor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: event.event_id,
        package_id: Number(packageId),
        sponsor_name: name,
        contact_email: email,
        logo_url: logo,
        public_display_YN: 1,
        players: selected?.includes_foursome ? players.filter((p) => p.first_name) : [],
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Could not reserve package");
      return;
    }
    setPending({ order_id: data.order_id, total_cents: data.total_cents || selected?.unit_price_cents || 0 });
  }

  if (packages.length === 0) {
    return <p className="text-[#1c315f]">No sponsorship packages are available.</p>;
  }

  return (
    <div className="mx-auto max-w-lg space-y-3">
      {packages.map((pkg) => (
        <label key={pkg.sponsorship_type_id} className="block rounded border p-4">
          <input
            type="radio"
            name="pkg"
            checked={Number(packageId) === pkg.sponsorship_type_id}
            onChange={() => setPackageId(pkg.sponsorship_type_id)}
          />
          <b className="ml-2">{pkg.sponsorship_name}</b> · ${(pkg.unit_price_cents / 100).toFixed(0)}
          <div className="mt-1 text-sm text-gray-600">
            {pkg.includes_foursome ? "Foursome · " : ""}
            {pkg.includes_teebox_signage ? "Tee-box signage · " : ""}
            {pkg.includes_public_logo ? "Public logo" : ""}
          </div>
          {pkg.description_html && <div className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: pkg.description_html }} />}
        </label>
      ))}
      <input className="w-full rounded border p-3" placeholder="Organization or name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="w-full rounded border p-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded border p-3" placeholder="Logo URL" value={logo} onChange={(e) => setLogo(e.target.value)} />
      {!!selected?.includes_foursome && (
        <div className="space-y-2 rounded border p-3">
          <p className="font-medium">Included foursome</p>
          {players.map((player, index) => (
            <div key={index} className="grid grid-cols-3 gap-2">
              <input className="rounded border p-2" placeholder="First" value={player.first_name} onChange={(e) => setPlayers((prev) => prev.map((row, i) => i === index ? { ...row, first_name: e.target.value } : row))} />
              <input className="rounded border p-2" placeholder="Last" value={player.last_name} onChange={(e) => setPlayers((prev) => prev.map((row, i) => i === index ? { ...row, last_name: e.target.value } : row))} />
              <input className="rounded border p-2" placeholder="Email" value={player.email} onChange={(e) => setPlayers((prev) => prev.map((row, i) => i === index ? { ...row, email: e.target.value } : row))} />
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
              category: "SPONSORSHIP",
              amount: pending.total_cents,
              purchaser_email: email,
              purchaser_name: name,
            }}
            onSuccess={async () => { toast.success("Sponsorship paid"); }}
            onError={() => toast.error("Payment failed")}
          />
        </PayPalProvider>
      )}
    </div>
  );
}
