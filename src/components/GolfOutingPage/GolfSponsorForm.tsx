"use client";

import { useMemo, useState } from "react";
import {
  formatCents,
  isValidEmail,
  membersGolfCheckoutUrl,
  packageAccent,
} from "./golfOutingDisplay";
import type { GolfOutingPublic, GolfPackagePublic } from "@/services/getGolfOutingPublic";

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
  const sorted = useMemo(
    () => [...packages].sort((a, b) => (a.sort_order ?? 100) - (b.sort_order ?? 100)),
    [packages]
  );
  const [packageId, setPackageId] = useState(
    initialPackageId && sorted.some((pkg) => pkg.sponsorship_type_id === initialPackageId)
      ? initialPackageId
      : sorted[0]?.sponsorship_type_id || 0
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [logo, setLogo] = useState("");
  const [players, setPlayers] = useState<Player[]>(emptyPlayers);
  const selected = sorted.find((pkg) => pkg.sponsorship_type_id === Number(packageId));
  const contactEmailValid = isValidEmail(email);
  const foursomeValid =
    !selected?.includes_foursome ||
    players.every((player) => player.first_name.trim() && player.last_name.trim() && isValidEmail(player.email));
  const canContinue = Boolean(name.trim() && contactEmailValid && foursomeValid);

  function continueCheckout() {
    if (!canContinue) return;
    window.location.href = membersGolfCheckoutUrl(event.public_url_slug, "sponsor", {
      package: packageId,
      name: name.trim(),
      email: email.trim(),
      logo: logo.trim() || undefined,
    });
  }

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#1C315F]/20 bg-[#f9faf8] p-8 text-center">
        <h2 className="text-2xl font-bold text-[#1C315F]">Packages coming soon</h2>
        <p className="mt-2 text-[#1C315F]/70">
          Sponsorship packages for this outing have not been published yet.
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
        {sorted.map((pkg) => {
          const selectedPkg = Number(packageId) === pkg.sponsorship_type_id;
          const accent = packageAccent(pkg.sponsorship_name);
          return (
            <button
              key={pkg.sponsorship_type_id}
              type="button"
              onClick={() => setPackageId(pkg.sponsorship_type_id)}
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
                {pkg.includes_public_logo ? <li>Logo on the public outing page</li> : null}
                {pkg.inventory != null ? <li>{pkg.inventory} available</li> : null}
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
          Checkout is completed on the members site so your payment is tied to your account.
        </p>
        <div className="mt-6 space-y-4">
          <label className="block text-sm font-semibold text-[#1C315F]">
            Organization or name
            <input
              className="mt-1 w-full rounded-lg border border-[#1C315F]/20 p-3 font-normal outline-none focus:border-[#1C315F]"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
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
          <button
            type="button"
            disabled={!canContinue}
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
