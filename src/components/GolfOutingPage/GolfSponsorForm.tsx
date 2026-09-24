"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import PublicCheckout from "@/components/checkout/PublicCheckout";
import type { GolfOutingPublic, GolfPackagePublic } from "@/services/getGolfOutingPublic";
import {
  defaultFoursomeTeamName,
  formatCents,
  isValidEmail,
  packageAccent,
  sortSponsorshipPackages,
} from "./golfOutingDisplay";

type Player = { first_name: string; last_name: string; email: string };

const emptyPlayers = (): Player[] => [
  { first_name: "", last_name: "", email: "" },
  { first_name: "", last_name: "", email: "" },
  { first_name: "", last_name: "", email: "" },
  { first_name: "", last_name: "", email: "" },
];

export default function GolfSponsorForm({
  event,
  packages,
  initialPackageId,
}: {
  event: GolfOutingPublic;
  packages: GolfPackagePublic[];
  initialPackageId?: number;
}) {
  const available = useMemo(
    () =>
      sortSponsorshipPackages(
        packages.filter((pkg) => (pkg.remaining_qty != null ? Number(pkg.remaining_qty) : Number(pkg.inventory ?? 0)) > 0)
      ),
    [packages]
  );
  const [packageId, setPackageId] = useState(
    initialPackageId && available.some((pkg) => pkg.sponsorship_type_id === initialPackageId)
      ? initialPackageId
      : available[0]?.sponsorship_type_id || 0
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [logo, setLogo] = useState("");
  const [players, setPlayers] = useState<Player[]>(emptyPlayers);
  const [teamName, setTeamName] = useState("");
  const [teamTouched, setTeamTouched] = useState(false);
  const [holding, setHolding] = useState(false);
  const [pending, setPending] = useState<{ order_id: number; total_cents: number } | null>(null);
  const selected = available.find((pkg) => pkg.sponsorship_type_id === Number(packageId));
  const contactEmailValid = isValidEmail(email);
  const foursomeValid =
    !selected?.includes_foursome ||
    players.every((player) => player.first_name.trim() && player.last_name.trim() && isValidEmail(player.email));
  const canContinue = Boolean(name.trim() && contactEmailValid && foursomeValid);
  const resolvedTeamName =
    teamTouched && teamName.trim()
      ? teamName.trim()
      : defaultFoursomeTeamName(players[0]?.first_name, players[0]?.last_name);

  async function continueCheckout() {
    if (!canContinue || holding) return;
    setHolding(true);
    try {
      const response = await fetch("/api/golf/sponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.event_id,
          package_id: Number(packageId),
          sponsor_name: name.trim(),
          contact_email: email.trim(),
          logo_url: logo.trim() || undefined,
          public_display_YN: 1,
          team_name: selected?.includes_foursome ? resolvedTeamName : undefined,
          players: selected?.includes_foursome ? players : [],
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Could not reserve sponsorship");
      }
      setPending({
        order_id: Number(data.order_id),
        total_cents: Number(data.total_cents || selected?.unit_price_cents || 0),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reserve sponsorship");
    } finally {
      setHolding(false);
    }
  }

  if (available.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#1C315F]/20 bg-[#f9faf8] p-8 text-center">
        <h2 className="text-2xl font-bold text-[#1C315F]">
          {packages.length === 0 ? "Packages coming soon" : "Packages sold out"}
        </h2>
        <p className="mt-2 text-[#1C315F]/70">
          {packages.length === 0
            ? "Sponsorship packages for this outing have not been published yet."
            : "Every published sponsorship package is currently sold out."}
          {event.contact_email ? ` Contact ${event.contact_email} for details.` : ""}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1C315F]">Choose a package</h2>
          <p className="mt-1 text-sm text-[#1C315F]/70">
            Support {event.university_name} and appear on the public outing page.
          </p>
        </div>
        {available.map((pkg) => {
          const selectedPkg = Number(packageId) === pkg.sponsorship_type_id;
          const accent = packageAccent(pkg.sponsorship_name);
          return (
            <button
              key={pkg.sponsorship_type_id}
              type="button"
              onClick={() => {
                setPackageId(pkg.sponsorship_type_id);
                setPending(null);
              }}
              className={`w-full rounded-2xl border bg-white p-6 text-left shadow-md transition duration-200 ${
                selectedPkg ? "ring-2 ring-offset-2" : "hover:-translate-y-0.5 hover:shadow-lg"
              }`}
              style={selectedPkg ? { borderColor: accent, boxShadow: `0 0 0 1px ${accent}` } : undefined}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
                    {pkg.sponsorship_name}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-[#1C315F]">{formatCents(pkg.unit_price_cents)}</p>
                </div>
                <span
                  className={`mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    selectedPkg ? "border-transparent text-white" : "border-[#1C315F]/30"
                  }`}
                  style={selectedPkg ? { backgroundColor: accent } : undefined}
                >
                  {selectedPkg ? "✓" : ""}
                </span>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-[#1C315F]/80">
                {pkg.includes_foursome ? <li>Includes a foursome</li> : null}
                {pkg.includes_teebox_signage ? <li>Tee-box signage</li> : null}
                {pkg.includes_longest_drive ? <li>Longest drive contest</li> : null}
                {pkg.includes_closest_to_pin ? <li>Closest to the pin contest</li> : null}
                {pkg.includes_public_logo ? <li>Logo on the public outing page</li> : null}
                {pkg.remaining_qty != null || pkg.inventory != null ? (
                  <li>{pkg.remaining_qty ?? pkg.inventory} available</li>
                ) : null}
              </ul>
              {pkg.description_html && (
                <div
                  className="prose mt-3 max-w-none text-sm text-[#1C315F]/70"
                  dangerouslySetInnerHTML={{ __html: pkg.description_html }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="h-fit rounded-2xl bg-white p-6 shadow-xl md:p-8">
        <h2 className="text-2xl font-bold text-[#1C315F]">Sponsor details</h2>
        <p className="mt-1 text-sm text-[#1C315F]/70">
          Checkout as a guest with PayPal, a debit or credit card, or Venmo.
        </p>
        <div className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-[#1C315F]">
            Organization or name
            <input
              className="mt-1 w-full rounded-lg border border-[#1C315F]/20 p-3 font-normal outline-none focus:border-[#1C315F]"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setPending(null);
              }}
            />
          </label>
          <label className="block text-sm font-semibold text-[#1C315F]">
            Contact email
            <input
              type="email"
              autoComplete="email"
              className={`mt-1 w-full rounded-lg border p-3 font-normal outline-none focus:border-[#1C315F] ${
                email.trim() && !contactEmailValid ? "border-[#ED3237]" : "border-[#1C315F]/20"
              }`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setPending(null);
              }}
            />
            {email.trim() && !contactEmailValid && (
              <p className="mt-1 text-xs font-normal text-[#ED3237]">Enter a valid email address.</p>
            )}
          </label>
          {!!selected?.includes_public_logo && (
            <label className="block text-sm font-semibold text-[#1C315F]">
              Logo URL
              <input
                className="mt-1 w-full rounded-lg border border-[#1C315F]/20 p-3 font-normal outline-none focus:border-[#1C315F]"
                placeholder="https://"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
              />
            </label>
          )}
          {!!selected?.includes_foursome && (
            <div className="space-y-3 rounded-xl border border-[#1C315F]/15 p-4">
              <p className="font-semibold text-[#1C315F]">Included foursome</p>
              <label className="block text-sm font-semibold text-[#1C315F]">
                Team name
                <input
                  className="mt-1 w-full rounded-lg border border-[#1C315F]/20 p-2.5 font-normal outline-none focus:border-[#1C315F]"
                  value={resolvedTeamName}
                  maxLength={120}
                  onChange={(e) => {
                    setTeamName(e.target.value.slice(0, 120));
                    setTeamTouched(true);
                    setPending(null);
                  }}
                />
              </label>
              {players.map((player, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-3">
                  <input
                    className="rounded-lg border border-[#1C315F]/20 p-2.5"
                    placeholder="First"
                    value={player.first_name}
                    onChange={(e) =>
                      setPlayers((prev) =>
                        prev.map((row, i) => (i === index ? { ...row, first_name: e.target.value } : row))
                      )
                    }
                  />
                  <input
                    className="rounded-lg border border-[#1C315F]/20 p-2.5"
                    placeholder="Last"
                    value={player.last_name}
                    onChange={(e) =>
                      setPlayers((prev) =>
                        prev.map((row, i) => (i === index ? { ...row, last_name: e.target.value } : row))
                      )
                    }
                  />
                  <div>
                    <input
                      type="email"
                      autoComplete="email"
                      className={`w-full rounded-lg border p-2.5 ${
                        player.email.trim() && !isValidEmail(player.email)
                          ? "border-[#ED3237]"
                          : "border-[#1C315F]/20"
                      }`}
                      placeholder="Email"
                      value={player.email}
                      onChange={(e) =>
                        setPlayers((prev) =>
                          prev.map((row, i) => (i === index ? { ...row, email: e.target.value } : row))
                        )
                      }
                    />
                    {player.email.trim() && !isValidEmail(player.email) && (
                      <p className="mt-1 text-xs text-[#ED3237]">Enter a valid email.</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="rounded-xl bg-[#f9faf8] p-4 text-[#1C315F]">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#1C315F]/60">Selected</p>
            <p className="mt-1 text-lg font-bold">{selected?.sponsorship_name}</p>
            <p className="text-2xl font-bold text-[#ED3237]">{formatCents(selected?.unit_price_cents)}</p>
          </div>
          {!pending ? (
            <button
              type="button"
              disabled={!canContinue || holding}
              onClick={continueCheckout}
              className="w-full rounded-full bg-[#ED3237] px-4 py-3 font-semibold text-white transition duration-200 hover:bg-[#1C315F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {holding ? "Reserving..." : "Continue to checkout"}
            </button>
          ) : (
            <PublicCheckout
              amount={pending.total_cents}
              purchaserEmail={email.trim()}
              purchaserName={name.trim()}
              successTitle="Sponsorship paid"
              successNote={
                selected?.includes_teebox_signage
                  ? "Your hole will be assigned by the outing committee."
                  : undefined
              }
              golfData={{
                order_id: pending.order_id,
                event_id: event.event_id,
                event_name: event.event_name,
                university_name: event.university_name,
                category: "SPONSORSHIP",
                amount: pending.total_cents,
              }}
              onSuccess={async () => {
                toast.success("Sponsorship paid");
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
