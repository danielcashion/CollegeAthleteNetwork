"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import GolfPaymentReceipt from "@/components/checkout/GolfPaymentReceipt";
import PublicCheckout from "@/components/checkout/PublicCheckout";
import type { GolfOutingPublic, GolfPackagePublic } from "@/services/getGolfOutingPublic";
import {
  defaultFoursomeTeamName,
  formatCents,
  isValidEmail,
  packageAccent,
  sortSponsorshipPackages,
} from "./golfOutingDisplay";
import GolfSponsorLogoField from "./GolfSponsorLogoField";

type Player = { first_name: string; last_name: string; email: string };

type CartItem = {
  id: string;
  package_id: number;
  sponsorship_name: string;
  unit_price_cents: number;
  sponsor_name: string;
  contact_email: string;
  logo_url?: string;
  team_name?: string;
  players: Player[];
  includes_teebox_signage?: number;
};

const emptyPlayers = (): Player[] => [
  { first_name: "", last_name: "", email: "" },
  { first_name: "", last_name: "", email: "" },
  { first_name: "", last_name: "", email: "" },
  { first_name: "", last_name: "", email: "" },
];

function cartStorageKey(eventId: string) {
  return `golf-sponsor-cart:${eventId}`;
}

function remainingOf(pkg: GolfPackagePublic) {
  return pkg.remaining_qty != null ? Number(pkg.remaining_qty) : Number(pkg.inventory ?? 0);
}

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-[#1C315F]/15 bg-[#fbfbfa] px-3.5 py-2.5 text-sm text-[#1C315F] outline-none transition placeholder:text-[#1C315F]/35 focus:border-[#1C315F] focus:bg-white focus:ring-2 focus:ring-[#1C315F]/10";

function packageIncludes(pkg: GolfPackagePublic) {
  return [
    pkg.includes_foursome ? "Included foursome" : null,
    pkg.includes_teebox_signage ? "Tee-box signage" : null,
    pkg.includes_longest_drive ? "Longest drive" : null,
    pkg.includes_closest_to_pin ? "Closest to the pin" : null,
    pkg.includes_public_logo ? "Logo on the public outing page" : null,
  ].filter(Boolean) as string[];
}

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
    () => sortSponsorshipPackages(packages.filter((pkg) => remainingOf(pkg) > 0)),
    [packages]
  );
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = sessionStorage.getItem(cartStorageKey(event.event_id));
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [modalPkg, setModalPkg] = useState<GolfPackagePublic | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [logo, setLogo] = useState("");
  const [players, setPlayers] = useState<Player[]>(emptyPlayers);
  const [teamName, setTeamName] = useState("");
  const [teamTouched, setTeamTouched] = useState(false);
  const [holding, setHolding] = useState(false);
  const [pending, setPending] = useState<{ order_id: number; total_cents: number } | null>(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    sessionStorage.setItem(cartStorageKey(event.event_id), JSON.stringify(cart));
  }, [cart, event.event_id]);

  useEffect(() => {
    if (!initialPackageId) return;
    const pkg = available.find((row) => row.sponsorship_type_id === initialPackageId);
    if (pkg) openModal(pkg);
    // only on first published package deep-link
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPackageId]);

  useEffect(() => {
    if (!modalPkg) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setModalPkg(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [modalPkg]);

  const cartCountByPackage = useMemo(() => {
    const counts = new Map<number, number>();
    cart.forEach((item) => counts.set(item.package_id, (counts.get(item.package_id) || 0) + 1));
    return counts;
  }, [cart]);
  const cartTotal = cart.reduce((sum, item) => sum + item.unit_price_cents, 0);
  const contactEmailValid = isValidEmail(email);
  const foursomeValid =
    !modalPkg?.includes_foursome ||
    players.every((player) => player.first_name.trim() && player.last_name.trim() && isValidEmail(player.email));
  const canAdd = Boolean(modalPkg && name.trim() && contactEmailValid && foursomeValid);
  const resolvedTeamName =
    teamTouched && teamName.trim()
      ? teamName.trim()
      : defaultFoursomeTeamName(players[0]?.first_name, players[0]?.last_name);
  const purchaser = cart[0];

  function openModal(pkg: GolfPackagePublic) {
    const inCart = cartCountByPackage.get(pkg.sponsorship_type_id) || 0;
    if (inCart >= remainingOf(pkg)) {
      toast.error(`${pkg.sponsorship_name} has no more available spots`);
      return;
    }
    const last = cart[cart.length - 1];
    setModalPkg(pkg);
    setName(last?.sponsor_name || "");
    setEmail(last?.contact_email || "");
    setLogo("");
    setPlayers(emptyPlayers());
    setTeamName("");
    setTeamTouched(false);
  }

  function addToCart() {
    if (!modalPkg || !canAdd) return;
    const inCart = cartCountByPackage.get(modalPkg.sponsorship_type_id) || 0;
    if (inCart >= remainingOf(modalPkg)) {
      toast.error(`${modalPkg.sponsorship_name} has no more available spots`);
      return;
    }
    setCart((prev) => [
      ...prev,
      {
        id: `${modalPkg.sponsorship_type_id}-${Date.now()}-${prev.length}`,
        package_id: modalPkg.sponsorship_type_id,
        sponsorship_name: modalPkg.sponsorship_name,
        unit_price_cents: modalPkg.unit_price_cents,
        sponsor_name: name.trim(),
        contact_email: email.trim(),
        logo_url: logo.trim() || undefined,
        team_name: modalPkg.includes_foursome ? resolvedTeamName : undefined,
        players: modalPkg.includes_foursome ? players : [],
        includes_teebox_signage: modalPkg.includes_teebox_signage,
      },
    ]);
    setModalPkg(null);
    toast.success(`${modalPkg.sponsorship_name} added to cart`);
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((item) => item.id !== id));
    setPending(null);
  }

  async function checkout() {
    if (!cart.length || holding) return;
    setHolding(true);
    try {
      const response = await fetch("/api/golf/sponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: event.event_id,
          purchaser_name: purchaser?.sponsor_name,
          purchaser_email: purchaser?.contact_email,
          items: cart.map((item) => ({
            package_id: item.package_id,
            sponsor_name: item.sponsor_name,
            contact_email: item.contact_email,
            logo_url: item.logo_url,
            team_name: item.team_name,
            players: item.players,
            public_display_YN: 1,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || "Could not reserve sponsorships");
      }
      setPending({
        order_id: Number(data.order_id),
        total_cents: Number(data.total_cents || cartTotal),
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not reserve sponsorships");
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

  if (paid && pending) {
    return (
      <div className="mx-auto max-w-lg">
        <GolfPaymentReceipt
          title="Sponsorship confirmed"
          eventName={event.event_name}
          universityName={event.university_name}
          orderId={pending.order_id}
          amountCents={pending.total_cents}
          email={purchaser?.contact_email}
          note={`${cart.length} sponsorship${cart.length === 1 ? "" : "s"} on this order.${
            cart.some((item) => item.includes_teebox_signage)
              ? " Hole assignments will be made by the outing committee."
              : ""
          }`}
          outingHref={`/golf-outing/${event.public_url_slug}`}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1C315F]">Choose a package</h2>
          <p className="mt-1 text-sm text-[#1C315F]/70">
            Add one or more sponsorships, then check out with PayPal, Venmo, or a card.
          </p>
        </div>
        {available.map((pkg) => {
          const inCart = cartCountByPackage.get(pkg.sponsorship_type_id) || 0;
          const remaining = Math.max(0, remainingOf(pkg) - inCart);
          const accent = packageAccent(pkg.sponsorship_name);
          return (
            <button
              key={pkg.sponsorship_type_id}
              type="button"
              disabled={remaining <= 0 || Boolean(pending)}
              onClick={() => openModal(pkg)}
              className="w-full rounded-2xl border bg-white p-6 text-left shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
                    {pkg.sponsorship_name}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-[#1C315F]">{formatCents(pkg.unit_price_cents)}</p>
                </div>
                <span className="rounded-full bg-[#f9faf8] px-3 py-1 text-xs font-semibold text-[#1C315F]">
                  {remaining} available
                </span>
              </div>
              <ul className="mt-4 space-y-1.5 text-sm text-[#1C315F]/80">
                {pkg.includes_foursome ? <li>Includes a foursome</li> : null}
                {pkg.includes_teebox_signage ? <li>Tee-box signage</li> : null}
                {pkg.includes_longest_drive ? <li>Longest drive contest</li> : null}
                {pkg.includes_closest_to_pin ? <li>Closest to the pin contest</li> : null}
                {pkg.includes_public_logo ? <li>Logo on the public outing page</li> : null}
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

      <aside className="h-fit rounded-2xl bg-white p-6 shadow-xl md:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-[#1C315F]">{pending ? "Checkout" : "Cart"}</h2>
          <span className="rounded-full bg-[#1C315F] px-2.5 py-0.5 text-xs font-semibold text-white">{cart.length}</span>
        </div>
        <p className="mt-1 text-sm text-[#1C315F]/70">
          {pending
            ? "Pay the full cart with PayPal, Venmo, or a debit or credit card."
            : "Add packages from the left. Details are collected before each item is added."}
        </p>

        {cart.length === 0 ? (
          <p className="mt-6 rounded-xl bg-[#f9faf8] p-4 text-sm text-[#1C315F]/70">Your cart is empty.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {cart.map((item) => (
              <li key={item.id} className="rounded-xl border border-[#1C315F]/10 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#1C315F]">{item.sponsorship_name}</p>
                    <p className="text-sm text-[#1C315F]/70">{item.sponsor_name}</p>
                  </div>
                  <p className="font-bold text-[#ED3237]">{formatCents(item.unit_price_cents)}</p>
                </div>
                {!pending ? (
                  <button
                    type="button"
                    className="mt-2 text-xs font-semibold text-[#ED3237] underline"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex items-center justify-between text-[#1C315F]">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#1C315F]/60">Subtotal</p>
          <p className="text-2xl font-bold text-[#ED3237]">{formatCents(cartTotal)}</p>
        </div>

        {!pending ? (
          <button
            type="button"
            disabled={!cart.length || holding}
            onClick={checkout}
            className="mt-5 w-full rounded-full bg-[#ED3237] px-4 py-3 font-semibold text-white transition duration-200 hover:bg-[#1C315F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {holding ? "Reserving..." : "Checkout"}
          </button>
        ) : (
          <div className="mt-5">
            <PublicCheckout
              amount={pending.total_cents}
              purchaserEmail={purchaser?.contact_email || ""}
              purchaserName={purchaser?.sponsor_name}
              successTitle="Sponsorship confirmed"
              successNote={`${cart.length} sponsorship${cart.length === 1 ? "" : "s"} on this order.`}
              golfData={{
                order_id: pending.order_id,
                event_id: event.event_id,
                event_name: event.event_name,
                university_name: event.university_name,
                outing_slug: event.public_url_slug,
                category: "SPONSORSHIP",
                amount: pending.total_cents,
              }}
              onSuccess={async () => {
                sessionStorage.removeItem(cartStorageKey(event.event_id));
                setPaid(true);
                toast.success("Sponsorship paid");
              }}
            />
          </div>
        )}
      </aside>

      {modalPkg ? (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-[#0B1B3A]/55 p-4 backdrop-blur-sm sm:items-center"
          onClick={() => setModalPkg(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sponsor-modal-title"
            className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ${
              modalPkg.includes_foursome ? "max-w-2xl" : "max-w-lg"
            }`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative shrink-0 overflow-hidden bg-[#1C315F] px-6 py-5">
              <span
                className="absolute inset-y-0 left-0 w-1.5"
                style={{ backgroundColor: packageAccent(modalPkg.sponsorship_name) }}
                aria-hidden="true"
              />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C9A227]">Add to cart</p>
                  <h3 id="sponsor-modal-title" className="mt-1 text-xl font-bold text-white">
                    {modalPkg.sponsorship_name} sponsorship
                  </h3>
                  <p className="mt-1 text-sm text-white/70">
                    {formatCents(modalPkg.unit_price_cents)}
                    {" · "}
                    {Math.max(
                      0,
                      remainingOf(modalPkg) - (cartCountByPackage.get(modalPkg.sponsorship_type_id) || 0)
                    )}{" "}
                    remaining
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalPkg(null)}
                  className="rounded-lg p-1 text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-5 overflow-y-auto px-6 py-5">
              {packageIncludes(modalPkg).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {packageIncludes(modalPkg).map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[#1C315F]/10 bg-[#f9faf8] px-3 py-1 text-xs font-semibold text-[#1C315F]"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1C315F]/55">
                    Organization or name
                  </span>
                  <input
                    className={fieldClass}
                    autoFocus
                    placeholder="Company or sponsor name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1C315F]/55">
                    Contact email
                  </span>
                  <input
                    type="email"
                    autoComplete="email"
                    className={`${fieldClass} ${email.trim() && !contactEmailValid ? "border-[#ED3237] focus:border-[#ED3237] focus:ring-[#ED3237]/15" : ""}`}
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {email.trim() && !contactEmailValid && (
                    <p className="mt-1 text-xs text-[#ED3237]">Enter a valid email address.</p>
                  )}
                </label>
              </div>

              {!!modalPkg.includes_public_logo && (
                <GolfSponsorLogoField
                  value={logo}
                  eventId={event.event_id}
                  onChange={setLogo}
                />
              )}

              {!!modalPkg.includes_foursome && (
                <div className="space-y-4 rounded-xl border border-[#1C315F]/10 bg-[#f9faf8] p-4">
                  <div>
                    <p className="text-sm font-bold text-[#1C315F]">Included foursome</p>
                    <p className="mt-0.5 text-xs text-[#1C315F]/60">Enter first name, last name, and email for all four golfers.</p>
                  </div>
                  <label className="block">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#1C315F]/55">
                      Team name
                    </span>
                    <input
                      className={`${fieldClass} bg-white`}
                      value={resolvedTeamName}
                      maxLength={120}
                      onChange={(e) => {
                        setTeamName(e.target.value.slice(0, 120));
                        setTeamTouched(true);
                      }}
                    />
                  </label>
                  <div className="space-y-3">
                    {players.map((player, index) => (
                      <div key={index} className="rounded-xl border border-[#1C315F]/10 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1C315F]/50">
                          Golfer {index + 1}
                        </p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_1.35fr]">
                          <label className="block">
                            <span className="text-xs font-medium text-[#1C315F]/70">First name</span>
                            <input
                              className={`${fieldClass} bg-[#fbfbfa]`}
                              value={player.first_name}
                              onChange={(e) =>
                                setPlayers((prev) =>
                                  prev.map((row, i) => (i === index ? { ...row, first_name: e.target.value } : row))
                                )
                              }
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs font-medium text-[#1C315F]/70">Last name</span>
                            <input
                              className={`${fieldClass} bg-[#fbfbfa]`}
                              value={player.last_name}
                              onChange={(e) =>
                                setPlayers((prev) =>
                                  prev.map((row, i) => (i === index ? { ...row, last_name: e.target.value } : row))
                                )
                              }
                            />
                          </label>
                          <label className="block">
                            <span className="text-xs font-medium text-[#1C315F]/70">Email</span>
                            <input
                              type="email"
                              autoComplete="email"
                              className={`${fieldClass} bg-[#fbfbfa] ${
                                player.email.trim() && !isValidEmail(player.email)
                                  ? "border-[#ED3237] focus:border-[#ED3237] focus:ring-[#ED3237]/15"
                                  : ""
                              }`}
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
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#1C315F]/8 bg-[#f9faf8] px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="rounded-full border border-[#1C315F]/15 px-5 py-2.5 text-sm font-semibold text-[#1C315F] transition hover:bg-white"
                onClick={() => setModalPkg(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!canAdd}
                onClick={addToCart}
                className="rounded-full bg-[#ED3237] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1C315F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
