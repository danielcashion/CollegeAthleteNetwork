import { CheckCircle2, Smartphone } from "lucide-react";
import AppStoreDownloadBadge, { CAN_EVENTS_APP_STORE_URL } from "./AppStoreDownloadBadge";
import CanEventsScreenshotCarousel from "./CanEventsScreenshotCarousel";

const mobileCapabilities = [
  "Guest check-in from the registration list — golfers, dinner guests, and walk-ups.",
  "Integrated electronic payment on site; no third-party card reader app required.",
  "Starting hole assignments for golf and table assignments for dinners and galas.",
  "Real-time view of who paid, who arrived, and what is still open on auction items.",
  "Professional receipts and audit-friendly records when the event ends.",
];

export default function CanEventsAppSection() {
  return (
    <section
      id="can-events-app"
      className="border-y border-[#1C315F]/8 bg-white py-12 md:py-14"
      aria-labelledby="can-events-heading"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#ED3237] text-white">
            <Smartphone className="h-6 w-6" aria-hidden />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
            Event day on mobile
          </p>
          <h2 id="can-events-heading" className="mt-2 text-3xl font-bold text-[#1C315F] md:text-4xl">
            CAN Events — The mobile app for Event Admins
          </h2>
          <p className="mt-4 text-lg text-[#1C315F]/75">
            Your web admin builds the outing;{" "}
            <a
              href={CAN_EVENTS_APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#ED3237] underline underline-offset-2"
            >
              CAN Events
            </a>{" "}
            carries the same completeness and polish on the course or at the venue. Event planners
            run check-in, payments, and assignments from their phone — integrated with The College
            Athlete Network, not a patchwork of spreadsheets and Square.
          </p>
          <div className="mt-6 flex flex-col items-center gap-1.5">
            <AppStoreDownloadBadge />
            <p className="text-xs text-[#1C315F]/55">iPhone · Free · Built for event day staff</p>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-4xl">
          <CanEventsScreenshotCarousel />
        </div>

        <ul className="mx-auto mt-6 grid max-w-4xl gap-2 sm:grid-cols-2">
          {mobileCapabilities.map((item) => (
            <li
              key={item}
              className="flex gap-2.5 rounded-lg border border-[#1C315F]/10 bg-white px-3 py-2.5 text-left text-sm text-[#1C315F]/85"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#ED3237]" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
