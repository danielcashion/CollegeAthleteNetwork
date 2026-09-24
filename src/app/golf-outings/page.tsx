import Link from "next/link";
import { CalendarDays, CreditCard, Flag, Gavel, Handshake, Megaphone, Ticket, Users } from "lucide-react";
import GolfAdminScreenshotCarousel from "@/components/GolfOutingPage/GolfAdminScreenshotCarousel";
import GolfBudgetWorkbook from "@/components/GolfOutingPage/GolfBudgetWorkbook";

export const metadata = {
  title: "Golf Outing Software for Athletic Departments",
  description:
    "The College Athlete Network provides the software athletic departments use to create, run, and settle golf outings — registration, sponsorships, auction, and payments in one product.",
};

const pillars = [
  {
    icon: Flag,
    title: "A real source of funds",
    copy: "Registration, sponsorships, auctions, and dinner guests turn one afternoon into operating support the department can plan around — if the budget is honest about costs.",
  },
  {
    icon: Users,
    title: "People in the same place",
    copy: "Alumni, parents, coaches, local companies, and current student-athletes share a fairway instead of another email ask. Relationships that start on the course show up again as mentors, jobs, and gifts.",
  },
  {
    icon: Megaphone,
    title: "Better optics for the department",
    copy: "A well-run outing says the athletic department brings people together. Sponsors see their logos. Guests see a program that hosts, not only solicits. That story travels farther than a pledge form.",
  },
  {
    icon: Handshake,
    title: "A day that compounds",
    copy: "The round is the invitation. The follow-through is a public event page, receipts, a silent auction, and a sponsor wall that keeps the department visible after the last putt.",
  },
];

const product = [
  {
    icon: CalendarDays,
    title: "Create the outing in admin",
    copy: "Athletic department staff name the event, set the date and venue, and get a private slug to share. No public directory.",
  },
  {
    icon: Ticket,
    title: "Registration and tickets",
    copy: "Individual and foursome tickets, windows, and golfer details — collected before checkout.",
  },
  {
    icon: Handshake,
    title: "Sponsorship packages",
    copy: "Gold, silver, bronze, hole signs, and contests. Inventory and logos stay in one cart.",
  },
  {
    icon: Gavel,
    title: "Silent auction",
    copy: "Items, photos, and bids on the same event page. Guests do not leave your outing to bid.",
  },
  {
    icon: CreditCard,
    title: "Payments and receipts",
    copy: "PayPal, Venmo, and cards. Confirmation emails go out when the payment clears.",
  },
  {
    icon: Users,
    title: "Event day",
    copy: "Foursomes, pairing sheets, and check-in so the staff is not running the day from a spreadsheet.",
  },
];

export default function GolfOutingsMarketingPage() {
  return (
    <div className="min-h-screen bg-[#f9faf8]">
      <section className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] pb-20 pt-28 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
            Software for university athletic departments
          </p>
          <h1 className="mx-auto mb-4 max-w-4xl text-4xl font-bold md:text-5xl">
            We provide the system that runs your golf outing
          </h1>
          <p className="mx-auto max-w-3xl text-lg md:text-xl text-white/90">
            The College Athlete Network is the product athletic department clients use to create the
            event, take registration and sponsorships, run the silent auction, and collect payment —
            then send guests a private page instead of a stack of forms.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/contact-us"
              className="rounded-full bg-white px-6 py-3 text-lg font-semibold text-[#1C315F] transition duration-200 hover:bg-[#1C315F] hover:text-white"
            >
              Talk to our team
            </Link>
            <a
              href="#product"
              className="rounded-full border border-white px-6 py-3 text-lg font-semibold text-white transition duration-200 hover:bg-white hover:text-[#ED3237]"
            >
              See the product
            </a>
          </div>
        </div>
      </section>

      <section id="product" className="container mx-auto px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
            Athletic department admin
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[#1C315F] md:text-4xl">
            This is the software staff use to host the day
          </h2>
          <p className="mt-4 text-lg text-[#1C315F]/75">
            Not a playbook. The same members admin athletic departments use to create the outing and
            run Event Day — foursomes, check-in, sponsor holes, and the guest page in one product.
          </p>
          <Link
            href="/contact-us"
            className="mt-6 inline-block rounded-full bg-[#1C315F] px-6 py-3 font-semibold text-white transition hover:bg-[#ED3237]"
          >
            Ask about department access
          </Link>
        </div>
        <div className="mt-10">
          <GolfAdminScreenshotCarousel />
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

      <section className="container mx-auto px-4 pb-16 md:pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-[#1C315F] md:text-4xl">Why departments host the day</h2>
          <p className="mt-4 text-lg text-[#1C315F]/75">
            Athletic departments already know a golf outing can close a budget gap. The departments
            that get more from the day treat it as a public gathering — and they need software that
            can carry registration, money, and recognition without a patchwork of tools.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {pillars.map((pillar) => (
            <article key={pillar.title} className="rounded-2xl bg-white p-6 shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1C315F] text-white">
                <pillar.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-[#1C315F]">{pillar.title}</h3>
              <p className="mt-2 text-[#1C315F]/75">{pillar.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto grid items-center gap-10 px-4 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C9A227]">The optics</p>
            <h2 className="mt-2 text-3xl font-bold text-[#1C315F] md:text-4xl">
              Show the department as a host, not only an ask
            </h2>
            <p className="mt-4 text-lg text-[#1C315F]/75">
              Donors already hear from the annual fund. A golf outing changes the frame: the
              department is organizing a day people want to attend. Sponsors get a visible place on
              the course and the event page. Guests leave with a story they can retell.
            </p>
            <p className="mt-4 text-lg text-[#1C315F]/75">
              Our software keeps that story on a page the department controls. Each outing has a
              private link from the slug staff create in admin. They share it with golfers, sponsors,
              and bidders — not with the open web.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0B1B3A] p-8 text-white shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E8D48B]">
              What the product covers
            </p>
            <ul className="mt-5 space-y-4 text-white/85">
              <li>
                <span className="font-semibold text-white">Admin setup</span>
                <p className="mt-1 text-sm">Event details, tickets, packages, auction items, and publish.</p>
              </li>
              <li>
                <span className="font-semibold text-white">Guest checkout</span>
                <p className="mt-1 text-sm">Registration, sponsorships, and bids on one outing page.</p>
              </li>
              <li>
                <span className="font-semibold text-white">Money and follow-through</span>
                <p className="mt-1 text-sm">PayPal, Venmo, cards, receipts, and sponsor logos after payment.</p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <GolfBudgetWorkbook />

      <section className="bg-[#1C315F] py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Give the department one system for the day</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            Start with the budget model, then talk with us about putting golf outing software in
            your athletic department&apos;s admin.
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
