import Link from "next/link";
import { CalendarDays, CreditCard, Handshake, Ticket, Users } from "lucide-react";

export const metadata = {
  title: "Networking Event Software for Athletic Departments",
  description:
    "College Athlete Network helps athletic departments host networking dinners with public registration, ticketing, and sponsorships.",
};

const product = [
  {
    icon: CalendarDays,
    title: "Admins create the event",
    copy: "Staff name the dinner, set the date and venue, and publish a private link. There is no public directory of events.",
  },
  {
    icon: Ticket,
    title: "Guest registration",
    copy: "Sell individual tickets. Guests check out with PayPal, a card, or Venmo and each person receives a ticket id for check-in.",
  },
  {
    icon: Handshake,
    title: "Sponsorship packages",
    copy: "Title sponsor, cocktail hour, and student-athlete sponsorships. You set the price and how many are available.",
  },
  {
    icon: CreditCard,
    title: "Payments and receipts",
    copy: "PayPal, Venmo, and credit cards, with confirmation emails and tax receipts after payment.",
  },
  {
    icon: Users,
    title: "A roster you can check in",
    copy: "Every registrant is stored with a unique ticket id so a later check-in app can scan a QR code or Apple Wallet pass.",
  },
];

export default function NetworkingEventsMarketingPage() {
  return (
    <div className="min-h-screen bg-[#f9faf8]">
      <section className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] pb-20 pt-28 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
            Software for university athletic departments
          </p>
          <h1 className="mx-auto mb-4 max-w-4xl text-4xl font-bold md:text-5xl">
            Host the season kickoff dinner in one system
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-white/90 md:text-xl">
            Create the event, take public registrations, and sell title, cocktail-hour, and student-athlete sponsorships.
            Guests get a private link. Staff keep the roster.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/contact-us"
              className="rounded-full bg-white px-6 py-3 text-lg font-semibold text-[#1C315F] transition duration-200 hover:bg-[#1C315F] hover:text-white"
            >
              Talk to our team
            </Link>
            <Link
              href="/golf-outings"
              className="rounded-full border border-white px-6 py-3 text-lg font-semibold text-white transition duration-200 hover:bg-white hover:text-[#ED3237]"
            >
              Looking for golf outings?
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C9A227]">Athletic department admins</p>
          <h2 className="mt-2 text-3xl font-bold text-[#1C315F] md:text-4xl">
            Registration and sponsorships for the dinners you already host
          </h2>
          <p className="mt-4 text-lg text-[#1C315F]/75">
            A networking event is a private page your staff share with alumni, parents, and sponsors. It is not listed on the open web.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {product.map((item) => (
            <article key={item.title} className="rounded-2xl bg-white p-5 shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1C315F] text-white">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#1C315F]">{item.title}</h3>
              <p className="mt-2 text-sm text-[#1C315F]/70">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#1C315F] py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Give the department one page for the dinner</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            Talk with us about putting networking event registration in your athletic department&apos;s admin.
          </p>
          <Link
            href="/contact-us"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-lg font-semibold text-[#1C315F] transition hover:bg-[#ED3237] hover:text-white"
          >
            Request a conversation
          </Link>
        </div>
      </section>
    </div>
  );
}
