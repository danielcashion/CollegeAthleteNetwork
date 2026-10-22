"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Linkedin } from "lucide-react";
import { publicLinkedInLabel, publicLinkedInUrl } from "@/lib/claim/linkedinDisplay";
import type { LinkedInProfile, ProfileBadge } from "@/lib/claim/types";

export const primaryButtonClass =
  "inline-flex w-full items-center justify-center rounded-xl bg-[#1C315F] px-4 py-3.5 text-base font-semibold text-white transition hover:bg-[#152648] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C315F] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex w-full items-center justify-center rounded-xl border border-[#1C315F]/15 bg-white px-4 py-3.5 text-base font-semibold text-[#1C315F] transition hover:bg-[#F4F6FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C315F] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export function ClaimShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[680px] px-4 pb-16 pt-5 text-[#1C315F] sm:px-6 sm:pb-20">
      {children}
    </div>
  );
}

const STEPS = ["Identity", "LinkedIn", "Done"] as const;

export function Stepper({
  current,
  onSelect,
}: {
  current: 0 | 1 | 2;
  onSelect?: (step: 0 | 1) => void;
}) {
  return (
    <ol aria-label="Progress" className="mb-4 grid grid-cols-3 gap-2">
      {STEPS.map((label, index) => {
        const active = index === current;
        const open = index < 2 && onSelect ? () => onSelect(index as 0 | 1) : null;
        const body = (
          <>
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  active ? "bg-[#1C315F] text-white" : "bg-white text-[#5C6A82] ring-1 ring-[#1C315F]/15"
                }`}
                aria-hidden="true"
              >
                {active && index === 2 ? "✓" : index + 1}
              </span>
              <span className={`truncate text-sm font-semibold ${active || open ? "text-[#1C315F]" : "text-[#5C6A82]"}`}>
                {label}
              </span>
            </div>
            <div
              className={`mt-2 h-1 rounded-full ${active ? "bg-[#1C315F]" : "bg-[#1C315F]/10"}`}
              aria-hidden="true"
            />
          </>
        );
        return (
          <li key={label} className="min-w-0" aria-current={active ? "step" : undefined}>
            {open ? (
              <button
                type="button"
                onClick={open}
                className="w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C315F] focus-visible:ring-offset-2"
              >
                {body}
              </button>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function Avatar({
  name,
  src,
  size = "md",
  alt = "",
  badge = null,
}: {
  name: string;
  src: string | null;
  size?: "md" | "lg" | "xl";
  alt?: string;
  badge?: ProfileBadge | null;
}) {
  const [failed, setFailed] = useState(false);
  const sizeClass =
    size === "xl" ? "h-28 w-28 text-3xl" : size === "lg" ? "h-[72px] w-[72px] text-xl" : "h-16 w-16 text-lg";
  const pixels = size === "xl" ? 112 : size === "lg" ? 72 : 64;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  const face =
    !src || failed ? (
      <span
        aria-hidden={alt ? undefined : true}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        className="flex h-full w-full items-center justify-center rounded-full bg-[#1C315F] font-semibold text-white"
      >
        {initials || "•"}
      </span>
    ) : (
      <img
        src={src}
        alt={alt}
        width={pixels}
        height={pixels}
        referrerPolicy="no-referrer"
        className="h-full w-full rounded-full object-cover"
        onError={() => setFailed(true)}
      />
    );

  const frame = badge === "hiring" ? "/images/Hiring.png" : badge === "openToWork" ? "/images/OpenToWork.png" : null;

  if (!frame) {
    return (
      <span
        className={`inline-flex shrink-0 overflow-hidden rounded-full shadow-[0_8px_24px_rgba(28,49,95,0.18)] ring-4 ring-white ${sizeClass}`}
      >
        {face}
      </span>
    );
  }

  return (
    <span className={`relative inline-flex shrink-0 ${sizeClass}`}>
      <span className="absolute inset-0 overflow-hidden rounded-full shadow-[0_8px_24px_rgba(28,49,95,0.18)]">{face}</span>
      <img src={frame} alt="" className="pointer-events-none absolute inset-0 h-full w-full" />
    </span>
  );
}

function Logo({ src }: { src: string | null }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <span className="h-10 w-10 shrink-0 rounded-lg bg-[#F4F6FB] ring-1 ring-[#1C315F]/10" aria-hidden="true" />;
  }
  return (
    <img
      src={src}
      alt=""
      width={40}
      height={40}
      referrerPolicy="no-referrer"
      className="h-10 w-10 shrink-0 rounded-lg bg-white object-contain p-1 ring-1 ring-[#1C315F]/10"
      onError={() => setFailed(true)}
    />
  );
}

function ProfileSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="min-w-0" aria-label={label}>
      <h4 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5C6A82]">{label}</h4>
      <ul className="mt-2 divide-y divide-[#1C315F]/10 overflow-hidden rounded-2xl border border-[#1C315F]/10 bg-[#F8F9FC]">
        {children}
      </ul>
    </section>
  );
}

function ProfileRow({ logoUrl, title, detail }: { logoUrl: string | null; title: string; detail: string }) {
  return (
    <li className="flex items-center gap-3 px-3 py-2">
      <Logo src={logoUrl} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-5 text-[#1C315F]" title={title}>
          {title}
        </p>
        {detail ? (
          <p className="truncate text-[13px] leading-5 text-[#5C6A82]" title={detail}>
            {detail}
          </p>
        ) : null}
      </div>
    </li>
  );
}

export function LinkedInPanel({
  kicker,
  title,
  description = null,
  children,
  busy = false,
  howToEdit = false,
  profileUrl = null,
  refresh = null,
}: {
  kicker: string;
  title: string;
  description?: string | null;
  children: ReactNode;
  busy?: boolean;
  howToEdit?: boolean;
  profileUrl?: string | null;
  refresh?: ReactNode;
}) {
  const [helpOpen, setHelpOpen] = useState(false);
  const toolbar = howToEdit || refresh;
  return (
    <section
      className="overflow-hidden rounded-3xl border border-[#1C315F]/10 bg-white shadow-[0_20px_50px_rgba(28,49,95,0.08)]"
      aria-busy={busy}
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1C315F] via-[#1C315F] to-[#2B4B8C] px-5 py-4 text-white sm:px-7">
        <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-white/[0.06]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-28 right-32 h-40 w-40 rounded-full bg-[#ED3237]/[0.12]" aria-hidden="true" />
        <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ED3237]" aria-hidden="true" />
              {kicker}
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-[1.4rem]">{title}</h2>
            {description ? <p className="mt-0.5 text-sm text-white/75">{description}</p> : null}
          </div>
          {toolbar ? (
            <div className="flex shrink-0 items-center gap-2">
              {refresh}
              {howToEdit ? (
                <button
                  type="button"
                  onClick={() => setHelpOpen(true)}
                  disabled={busy}
                  className="rounded-full border border-white/35 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C315F] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  How To Edit
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      <div className="px-5 pb-5 pt-4 sm:px-7">{children}</div>
      {howToEdit ? <HowToEditModal open={helpOpen} onClose={() => setHelpOpen(false)} profileUrl={profileUrl} /> : null}
    </section>
  );
}

export function HowToEditModal({
  open,
  onClose,
  profileUrl,
}: {
  open: boolean;
  onClose: () => void;
  profileUrl?: string | null;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const openUrl = publicLinkedInUrl(profileUrl);

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0E1A33]/55 px-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="linkedin-edit-title"
        aria-describedby="linkedin-edit-copy"
        tabIndex={-1}
        className="w-full max-w-md rounded-3xl bg-white px-8 py-10 text-left shadow-[0_30px_80px_rgba(14,26,51,0.28)] outline-none"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F6FB] text-[#1C315F]" aria-hidden="true">
          <Linkedin className="h-6 w-6" />
        </div>
        <p className="mt-6 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#5C6A82]">LinkedIn</p>
        <h2 id="linkedin-edit-title" className="mt-2 text-center text-xl font-semibold tracking-tight text-[#1C315F]">
          How to edit
        </h2>
        <p id="linkedin-edit-copy" className="mt-3 text-center text-sm leading-6 text-[#3E4E6B]">
          We keep this record matched to LinkedIn. Update your experience, education, headline, or photo on LinkedIn,
          then pull it here again.
        </p>
        <ol className="mt-6 space-y-4">
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1C315F] text-xs font-semibold text-white">
              1
            </span>
            <p className="pt-0.5 text-sm leading-6 text-[#1C315F]">
              Open LinkedIn and save the change on your profile.
            </p>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1C315F] text-xs font-semibold text-white">
              2
            </span>
            <p className="pt-0.5 text-sm leading-6 text-[#1C315F]">
              Return here and select Refresh. We will pull the latest profile so the two match.
            </p>
          </li>
        </ol>
        <div className="mt-8 flex flex-col gap-3">
          <button type="button" className={primaryButtonClass} onClick={onClose}>
            Got it
          </button>
          {openUrl ? (
            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              referrerPolicy="no-referrer"
              className={secondaryButtonClass}
            >
              Open my LinkedIn profile
            </a>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function sameName(left: string, right: string): boolean {
  const normalize = (value: string) =>
    value
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/g, "");
  const a = normalize(left);
  const b = normalize(right);
  return a.length > 0 && a === b;
}

function NamePair({
  label,
  athlete,
  linkedIn,
}: {
  label: string;
  athlete: string;
  linkedIn: string;
}) {
  const matches = sameName(athlete, linkedIn);
  const tone = matches ? "text-[#157A3C]" : "text-[#9D1F24]";
  return (
    <div className="border-t border-[#1C315F]/10 px-4 py-3 text-left">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#5C6A82]">{label}</p>
      <div className="mt-1 grid grid-cols-2 gap-3">
        <p className={`text-lg font-semibold leading-6 ${tone}`}>{athlete || "—"}</p>
        <p className={`text-lg font-semibold leading-6 ${tone}`}>{linkedIn || "—"}</p>
      </div>
    </div>
  );
}

export function LastNameWarningModal({
  open,
  onProceed,
  onBack,
  athleteFirst,
  athleteLast,
  linkedInFirst,
  linkedInLast,
}: {
  open: boolean;
  onProceed: () => void;
  onBack: () => void;
  athleteFirst: string;
  athleteLast: string;
  linkedInFirst: string;
  linkedInLast: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onBack();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onBack]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0E1A33]/55 px-4 backdrop-blur-[2px]">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="linkedin-name-warning-title"
        aria-describedby="linkedin-name-warning-copy"
        tabIndex={-1}
        className="w-full max-w-lg rounded-3xl bg-white px-8 py-10 text-center shadow-[0_30px_80px_rgba(14,26,51,0.28)] outline-none sm:px-10"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8A5A00]">Check this profile</p>
        <h2 id="linkedin-name-warning-title" className="mt-3 text-2xl font-semibold tracking-tight text-[#1C315F]">
          There seems to be something off
        </h2>
        <p id="linkedin-name-warning-copy" className="mt-4 text-base leading-7 text-[#3E4E6B]">
          The last name on this LinkedIn profile is not close to this athlete record.
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#1C315F]/10 text-left">
          <div className="grid grid-cols-2 gap-3 bg-[#F4F6FB] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1C315F]">Athlete record</p>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1C315F]">LinkedIn</p>
          </div>
          <NamePair label="First name" athlete={athleteFirst} linkedIn={linkedInFirst} />
          <NamePair label="Last name" athlete={athleteLast} linkedIn={linkedInLast} />
        </div>
        <div className="mt-8 flex flex-col gap-3">
          <button type="button" className={primaryButtonClass} onClick={onProceed}>
            Proceed Anyway
          </button>
          <button type="button" className={secondaryButtonClass} onClick={onBack}>
            Go Back
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function InvalidLinkedInUrlModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0E1A33]/55 px-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="linkedin-invalid-url-title"
        aria-describedby="linkedin-invalid-url-copy"
        tabIndex={-1}
        className="w-full max-w-md rounded-3xl bg-white px-8 py-10 text-center shadow-[0_30px_80px_rgba(14,26,51,0.28)] outline-none"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C6A82]">LinkedIn</p>
        <h2 id="linkedin-invalid-url-title" className="mt-2 text-xl font-semibold tracking-tight text-[#1C315F]">
          Valid LinkedIn URL required
        </h2>
        <p id="linkedin-invalid-url-copy" className="mt-3 text-sm leading-6 text-[#3E4E6B]">
          This needs to be a valid LinkedIn URL. Paste an address that starts with https://www.linkedin.com/in/ or
          www.linkedin.com/in/.
        </p>
        <div className="mt-8">
          <button type="button" className={primaryButtonClass} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function RefreshLimitModal({
  open,
  onClose,
  title = "Refresh limit reached",
  message = "You have exceeded the limit of how many data refreshes you are allowed. Please contact support if you need help.",
  label = "refresh",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  label?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0E1A33]/55 px-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`linkedin-${label}-limit-title`}
        aria-describedby={`linkedin-${label}-limit-copy`}
        tabIndex={-1}
        className="w-full max-w-md rounded-3xl bg-white px-8 py-10 text-center shadow-[0_30px_80px_rgba(14,26,51,0.28)] outline-none"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5C6A82]">LinkedIn</p>
        <h2 id={`linkedin-${label}-limit-title`} className="mt-2 text-xl font-semibold tracking-tight text-[#1C315F]">
          {title}
        </h2>
        <p id={`linkedin-${label}-limit-copy`} className="mt-3 text-sm leading-6 text-[#3E4E6B]">
          {message}
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <button type="button" className={primaryButtonClass} onClick={onClose}>
            Close
          </button>
          <a href="mailto:admin@collegeathletenetwork.org" className={secondaryButtonClass}>
            Contact support
          </a>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export function ProfileCard({
  profile,
  simulated = false,
  compact = false,
  hideUrl = false,
}: {
  profile: LinkedInProfile;
  simulated?: boolean;
  compact?: boolean;
  hideUrl?: boolean;
}) {
  const role = [profile.currentTitle, profile.currentCompany].filter(Boolean).join(" · ");
  const publicUrl = publicLinkedInUrl(profile.profileUrl);
  return (
    <article>
      {compact ? null : (
        <div className="flex items-center gap-4">
          <Avatar name={profile.fullName} src={profile.photoUrl} size="lg" badge={profile.badge} />
          <div className="min-w-0">
            <h3 className="truncate text-xl font-semibold tracking-tight">{profile.fullName}</h3>
            {profile.headline ? (
              <p className="mt-0.5 line-clamp-2 text-sm leading-5 text-[#3E4E6B]">{profile.headline}</p>
            ) : null}
            {role || profile.location ? (
              <p className="mt-0.5 truncate text-[13px] text-[#5C6A82]">
                {role ? <span className="font-semibold text-[#1C315F]">{role}</span> : null}
                {role && profile.location ? " · " : null}
                {profile.location}
              </p>
            ) : null}
          </div>
        </div>
      )}

      {compact ? (
        <div className="text-center">
          {profile.headline ? <p className="text-sm leading-5 text-[#3E4E6B]">{profile.headline}</p> : null}
          {role ? <p className="mt-1 text-sm font-medium text-[#1C315F]">{role}</p> : null}
          {profile.location ? <p className="mt-1 text-sm text-[#5C6A82]">{profile.location}</p> : null}
        </div>
      ) : null}

      {!compact && (profile.experience.length > 0 || profile.education.length > 0) ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {profile.experience.length > 0 ? (
            <ProfileSection label="Experience">
              {profile.experience.map((item) => (
                <ProfileRow
                  key={`${item.title}-${item.company}-${item.dateLabel}`}
                  logoUrl={item.logoUrl}
                  title={item.title}
                  detail={[item.company, item.dateLabel].filter(Boolean).join(" · ")}
                />
              ))}
            </ProfileSection>
          ) : null}
          {profile.education.length > 0 ? (
            <ProfileSection label="Education">
              {profile.education.map((item) => (
                <ProfileRow
                  key={`${item.school}-${item.detail}`}
                  logoUrl={item.logoUrl}
                  title={item.school}
                  detail={[item.detail, item.dateLabel].filter(Boolean).join(" · ")}
                />
              ))}
            </ProfileSection>
          ) : null}
        </div>
      ) : null}

      {publicUrl && !compact && !hideUrl ? (
        <p className="mt-4 truncate text-sm">
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            referrerPolicy="no-referrer"
            className="font-medium text-[#1C315F] underline decoration-[#1C315F]/30 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C315F] focus-visible:ring-offset-2"
          >
            {publicLinkedInLabel(publicUrl)}
          </a>
        </p>
      ) : null}

      {simulated ? (
        <p className="mt-4 text-sm leading-5 text-[#3E4E6B]">
          This is a sample preview so you can review the screen. Live profile lookup is connected in the next step.
        </p>
      ) : null}
    </article>
  );
}

export function ProfileRefresh({
  onRefresh,
  disabled,
}: {
  onRefresh: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={disabled}
      className="inline-flex shrink-0 items-center justify-center rounded-full border border-white bg-white px-3 py-1.5 text-xs font-semibold tracking-wide text-[#1C315F] transition hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1C315F] disabled:cursor-not-allowed disabled:opacity-60"
    >
      Refresh
    </button>
  );
}

export function RetrievingModal({ open }: { open: boolean }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    const blockKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Tab") event.preventDefault();
    };
    document.addEventListener("keydown", blockKeys);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", blockKeys);
      previous?.focus();
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#0E1A33]/55 px-4 backdrop-blur-[2px]">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="linkedin-retrieving-title"
        aria-describedby="linkedin-retrieving-copy"
        tabIndex={-1}
        className="w-full max-w-md rounded-3xl bg-white px-8 py-10 text-center shadow-[0_30px_80px_rgba(14,26,51,0.28)] outline-none"
      >
        <div className="relative mx-auto h-16 w-16" aria-hidden="true">
          <span className="absolute inset-0 rounded-full border-[3px] border-[#1C315F]/10" />
          <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[#1C315F]" />
          <span className="absolute inset-0 flex items-center justify-center text-[#1C315F]">
            <Linkedin className="h-5 w-5" />
          </span>
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[#5C6A82]">LinkedIn</p>
        <h2 id="linkedin-retrieving-title" className="mt-2 text-xl font-semibold tracking-tight text-[#1C315F]">
          Retrieving your profile
        </h2>
        <p id="linkedin-retrieving-copy" className="mt-3 text-sm leading-6 text-[#3E4E6B]">
          We&apos;re pulling the latest experience, education, and photo. This usually takes a few seconds.
        </p>
      </div>
    </div>,
    document.body,
  );
}

export function StatusPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-[#1C315F]/10 bg-white px-5 py-8 shadow-[0_20px_50px_rgba(28,49,95,0.08)] sm:px-8">
      <h1 className="text-[1.65rem] font-semibold leading-tight tracking-tight">{title}</h1>
      <div className="mt-3 space-y-4 text-base leading-7 text-[#3E4E6B]">{children}</div>
    </section>
  );
}

export function InvalidLink() {
  return (
    <ClaimShell>
      <StatusPanel title="This link isn't valid">
        <p>
          If you opened this from an email, contact us and we&apos;ll send a fresh link.
        </p>
        <a href="mailto:admin@collegeathletenetwork.org" className={primaryButtonClass}>
          Contact us
        </a>
      </StatusPanel>
    </ClaimShell>
  );
}

export function Unavailable({ retryHref }: { retryHref: string }) {
  return (
    <ClaimShell>
      <StatusPanel title="We couldn't open this page">
        <p>Something went wrong on our side. Please try again in a moment.</p>
        <div className="flex flex-col gap-3">
          <a href={retryHref} className={primaryButtonClass}>
            Try again
          </a>
          <a href="mailto:admin@collegeathletenetwork.org" className={secondaryButtonClass}>
            Contact us
          </a>
        </div>
      </StatusPanel>
    </ClaimShell>
  );
}

export function PrivacyNote() {
  return (
    <p className="text-center text-xs leading-5 text-[#5C6A82]">
      We only use LinkedIn to confirm your identity and keep your record accurate.{" "}
      <a
        href="/privacy-policy"
        className="font-semibold text-[#1C315F] underline decoration-[#1C315F]/30 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C315F] focus-visible:ring-offset-2"
      >
        Privacy policy
      </a>
    </p>
  );
}
