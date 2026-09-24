import Link from "next/link";
import { Flag, Handshake, Megaphone, Users } from "lucide-react";
import GolfBudgetWorkbook from "@/components/GolfOutingPage/GolfBudgetWorkbook";

export const metadata = {
  title: "Golf Outings for Athletic Departments",
  description:
    "Golf outings raise money, gather alumni and sponsors, and show an athletic department as a convener — not only a fundraiser.",
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

export default function GolfOutingsMarketingPage() {
  return (
    <div className="min-h-screen bg-[#f9faf8]">
      <section className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] pb-20 pt-28 text-white">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
            Athletic department events
          </p>
          <h1 className="mx-auto mb-4 max-w-4xl text-4xl font-bold md:text-5xl">
            A golf outing is how a department funds the year — and who it gathers
          </h1>
          <p className="mx-auto max-w-3xl text-lg md:text-xl text-white/90">
            The money matters. So does the picture: alumni, sponsors, and the local community
            standing with the program. We help athletic departments host that day with a private
            event page, registration, sponsorships, and a silent auction.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/contact-us"
              className="rounded-full bg-white px-6 py-3 text-lg font-semibold text-[#1C315F] transition duration-200 hover:bg-[#1C315F] hover:text-white"
            >
              Talk to our team
            </Link>
            <a
              href="#budget-model"
              className="rounded-full border border-white px-6 py-3 text-lg font-semibold text-white transition duration-200 hover:bg-white hover:text-[#ED3237]"
            >
              Open the budget model
            </a>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-[#1C315F] md:text-4xl">More than a fundraiser</h2>
          <p className="mt-4 text-lg text-[#1C315F]/75">
            Athletic departments already know a golf outing can close a budget gap. The departments
            that get more from the day treat it as a public gathering — proof the program can convene
            people who care about the athletes.
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
              That is why we do not list every outing in a public directory. Each event has a private
              link from the slug the athletic department creates. They share it with golfers,
              sponsors, and bidders — not with the open web.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0B1B3A] p-8 text-white shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E8D48B]">What we host</p>
            <ul className="mt-5 space-y-4 text-white/85">
              <li>
                <span className="font-semibold text-white">Registration and sponsorships</span>
                <p className="mt-1 text-sm">Tickets, packages, foursomes, and hole signage in one checkout.</p>
              </li>
              <li>
                <span className="font-semibold text-white">Silent auction on the event page</span>
                <p className="mt-1 text-sm">Bids stay on the public outing page. No detour to another site.</p>
              </li>
              <li>
                <span className="font-semibold text-white">Receipts and sponsor recognition</span>
                <p className="mt-1 text-sm">Payment confirmation by email and logos on the outing page.</p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <GolfBudgetWorkbook />

      <section className="bg-[#1C315F] py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">Plan the day like it will be remembered</h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">
            Start with the budget model, then talk with us about a private outing page your
            department can send to golfers and sponsors.
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
