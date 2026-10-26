"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { BadgeCheck, GraduationCap, Linkedin, Medal } from "lucide-react";
import {
  confirmIdentity,
  confirmLinkedInProfile,
  declineIdentity,
  lookupLinkedIn,
  rejectStoredProfile,
} from "../actions";
import { isLinkedInProfileInput, linkedInProfileKey, publicLinkedInLabel, publicLinkedInUrl } from "@/lib/claim/linkedinDisplay";
import { canLookupLinkedInProfile, recordLinkedInLookup } from "@/lib/claim/lookupLimit";
import type { AthleteForClaim, LinkedInProfile, RenidlyRows } from "@/lib/claim/types";
import { canRefreshLinkedIn, recordLinkedInRefresh } from "@/lib/claim/refreshLimit";
import {
  Avatar,
  ClaimShell,
  primaryButtonClass,
  PrivacyNote,
  LinkedInPanel,
  ProfileRefresh,
  ProfileCard,
  InvalidLinkedInUrlModal,
  LastNameWarningModal,
  RefreshLimitModal,
  RetrievingModal,
  secondaryButtonClass,
  StatusPanel,
  Stepper,
} from "../ui";

type Flow =
  | { name: "identity"; error: string | null }
  | { name: "linkedin"; mode: "stored" }
  | { name: "linkedin"; mode: "form"; draft: string; error: string | null }
  | { name: "linkedin"; mode: "preview"; draft: string; profile: LinkedInProfile; rows: RenidlyRows; simulated: boolean; lastNameMatches: boolean; error: string | null }
  | { name: "done"; linkedinUrl: string; notice: string | null }
  | { name: "already" }
  | { name: "invalid" };

function initialFlow(): Flow {
  return { name: "identity", error: null };
}

function defaultLinkedIn(
  athlete: AthleteForClaim,
  storedProfile: LinkedInProfile | null,
): Extract<Flow, { name: "linkedin" }> {
  if (!athlete.linkedinVerified) {
    return { name: "linkedin", mode: "form", draft: athlete.linkedinUrl || "", error: null };
  }
  return storedProfile
    ? { name: "linkedin", mode: "stored" }
    : { name: "linkedin", mode: "form", draft: "", error: null };
}

function stepIndex(flow: Flow): 0 | 1 | 2 {
  if (flow.name === "done" || flow.name === "already") return 2;
  if (flow.name === "linkedin") return 1;
  return 0;
}

function nameToken(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function lastToken(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

function renidlyFirst(rows: RenidlyRows, fullName: string): string {
  const first = nameToken(rows.profile.first_name);
  if (first) return first;
  return fullName.trim().split(/\s+/).filter(Boolean)[0] || "";
}

function renidlyLast(rows: RenidlyRows, fullName: string): string {
  const last = nameToken(rows.profile.last_name);
  if (last) return last;
  return lastToken(fullName);
}

function handleUrl(...candidates: Array<string | null | undefined>): string | null {
  for (const candidate of candidates) {
    const url = publicLinkedInUrl(candidate);
    if (url) return url;
  }
  return null;
}

export function ConfirmFlow({
  token,
  athlete,
  storedProfile,
  profileNotice,
}: {
  token: string;
  athlete: AthleteForClaim;
  storedProfile: LinkedInProfile | null;
  profileNotice: string | null;
}) {
  const [flow, setFlow] = useState<Flow>(() => initialFlow());
  const lastLinkedIn = useRef<Extract<Flow, { name: "linkedin" }>>(defaultLinkedIn(athlete, storedProfile));
  if (flow.name === "linkedin") lastLinkedIn.current = flow;
  const [busy, setBusy] = useState(false);
  const [retrieving, setRetrieving] = useState(false);
  const [refreshLimited, setRefreshLimited] = useState(false);
  const [invalidLinkedInUrl, setInvalidLinkedInUrl] = useState(false);
  const [lookupLimited, setLookupLimited] = useState(false);
  const [nameWarningOpen, setNameWarningOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [live, setLive] = useState("Confirm whether this athlete record is you.");

  const welcome = athlete.firstName ? `Welcome, ${athlete.firstName}` : "Welcome";
  const linkedinLabel = publicLinkedInLabel(athlete.linkedinUrl);

  async function onConfirmIdentity() {
    setBusy(true);
    setLive("Saving your answer.");
    try {
      const result = await confirmIdentity(token);
      if (!result.ok) {
        if (result.code === "invalid_link") {
          setFlow({ name: "invalid" });
          setLive("This link isn't valid.");
          return;
        }
        setFlow({ name: "identity", error: result.message });
        setLive(result.message);
        return;
      }
      if (!athlete.linkedinVerified) {
        setFlow({ name: "linkedin", mode: "form", draft: athlete.linkedinUrl || "", error: null });
        setLive("Identity confirmed. Add your LinkedIn profile URL so we can match the last name.");
        return;
      }
      if (storedProfile) {
        setFlow({ name: "linkedin", mode: "stored" });
        setLive("Identity confirmed. Review the LinkedIn profile we have on file.");
        return;
      }
      setFlow({ name: "linkedin", mode: "form", draft: "", error: null });
      setLive("Identity confirmed. Add your LinkedIn profile URL.");
    } catch {
      const message = "We couldn't save that just now. Please try again.";
      setFlow({ name: "identity", error: message });
      setLive(message);
    } finally {
      setBusy(false);
    }
  }

  async function onDecline() {
    setBusy(true);
    setLive("Saving your answer.");
    try {
      const result = await declineIdentity(token);
      if (!result.ok) {
        if (result.code === "invalid_link") {
          setFlow({ name: "invalid" });
          setLive("This link isn't valid.");
          return;
        }
        setFlow({ name: "identity", error: result.message });
        setLive(result.message);
        return;
      }
      setBanner(null);
      setFlow({ name: "linkedin", mode: "form", draft: "", error: null });
      setLive("Paste your LinkedIn profile URL.");
    } catch {
      const message = "We couldn't save that just now. Please try again.";
      setFlow({ name: "identity", error: message });
      setLive(message);
    } finally {
      setBusy(false);
    }
  }

  async function onRejectStored() {
    setBusy(true);
    try {
      const result = await rejectStoredProfile(token);
      if (!result.ok) {
        setBanner(result.message);
        setLive(result.message);
        if (result.code === "invalid_link") setFlow({ name: "invalid" });
        return;
      }
      setBanner(null);
      setFlow({ name: "linkedin", mode: "form", draft: "", error: null });
      setLive("Paste the LinkedIn profile URL you'd like us to use.");
    } catch {
      const message = "We couldn't save that just now. Please try again.";
      setBanner(message);
      setLive(message);
    } finally {
      setBusy(false);
    }
  }

  function reportLookupError(draft: string, message: string) {
    setLive(message);
    if (flow.name === "linkedin" && flow.mode === "form") {
      setFlow({ name: "linkedin", mode: "form", draft, error: message });
      return;
    }
    setBanner(message);
  }

  async function onLookup(draft: string): Promise<boolean> {
    const trimmed = draft.trim();
    if (!trimmed) {
      reportLookupError(draft, "Enter a LinkedIn profile URL to continue.");
      return false;
    }
    if (!isLinkedInProfileInput(trimmed)) {
      setInvalidLinkedInUrl(true);
      setLive("This needs to be a valid LinkedIn URL.");
      return false;
    }
    setRetrieving(true);
    setBanner(null);
    setLive("Retrieving your LinkedIn profile.");
    try {
      const result = await lookupLinkedIn(token, trimmed);
      if (!result.ok) {
        if (result.code === "invalid_link") {
          setFlow({ name: "invalid" });
          setLive("This link isn't valid.");
          return false;
        }
        reportLookupError(trimmed, result.message);
        return false;
      }
      setNameWarningOpen(!result.lastNameMatches);
      setFlow({
        name: "linkedin",
        mode: "preview",
        draft: trimmed,
        profile: result.profile,
        rows: result.rows,
        simulated: result.simulated,
        lastNameMatches: result.lastNameMatches,
        error: null,
      });
      setLive(
        result.lastNameMatches
          ? `Found a profile for ${result.profile.fullName}. The last name matches. Confirm it to verify this record.`
          : "There seems to be something off. The last name on this LinkedIn profile is not close to this athlete record.",
      );
      return true;
    } catch {
      reportLookupError(trimmed, "We couldn't look that up just now. Please try again in a moment.");
      return false;
    } finally {
      setRetrieving(false);
    }
  }

  async function onRefresh(url: string) {
    if (!canRefreshLinkedIn(token)) {
      setRefreshLimited(true);
      setLive("You have exceeded the limit of how many data refreshes you are allowed.");
      return;
    }
    const refreshed = await onLookup(url);
    if (refreshed) recordLinkedInRefresh(token);
  }

  function showClaimToast(kind: "success" | "error", message: string) {
  toast[kind](message, {
    duration: 8000,
    style: {
      background: "#ffffff",
      color: "#1C315F",
      border: "1px solid rgba(28,49,95,0.12)",
      borderRadius: "16px",
      boxShadow: "0 18px 40px rgba(28,49,95,0.16)",
      padding: "14px 16px",
      maxWidth: "28rem",
      fontSize: "14px",
      lineHeight: "1.45",
    },
    iconTheme: {
      primary: kind === "success" ? "#1C315F" : "#9D1F24",
      secondary: "#ffffff",
    },
  });
}

async function onConfirmProfile(profileUrl: string, rows?: RenidlyRows) {
    setBusy(true);
    setLive("Saving your LinkedIn profile.");
    try {
      const result = await confirmLinkedInProfile(token, profileUrl, rows);
      if (!result.ok) {
        setBanner(result.message);
        setLive(result.message);
        showClaimToast("error", result.message);
        if (result.code === "invalid_link") {
          setFlow({ name: "invalid" });
          return;
        }
        if (flow.name === "linkedin" && flow.mode === "preview") {
          setFlow({ ...flow, error: result.message });
        }
        return;
      }
      setBanner(null);
      setFlow({ name: "done", linkedinUrl: result.claim.linkedinUrl || profileUrl, notice: result.notice || null });
      setLive(result.notice || "You're confirmed. We saved your LinkedIn profile.");
      if (result.notice) showClaimToast("success", result.notice);
    } catch {
      const message = "We couldn't save that profile. Please try again.";
      setBanner(message);
      setLive(message);
      showClaimToast("error", message);
    } finally {
      setBusy(false);
    }
  }

  function showIdentity() {
    setBanner(null);
    setFlow({ name: "identity", error: null });
    setLive("Confirm whether this athlete record is you.");
  }

  function showLinkedIn() {
    setBanner(null);
    const next = lastLinkedIn.current;
    setFlow(next);
    setLive(
      next.mode === "stored"
        ? "Review the LinkedIn profile we have on file."
        : next.mode === "preview"
          ? `Found a profile for ${next.profile.fullName}. Confirm it or try a different URL.`
          : "Add your LinkedIn profile URL.",
    );
  }

  const recordHeadline =
    storedProfile && athlete.linkedinVerified
      ? storedProfile.headline ||
        [storedProfile.currentTitle, storedProfile.currentCompany].filter(Boolean).join(" · ") ||
        null
      : null;

  return (
    <ClaimShell>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {live}
      </p>
      {flow.name === "identity" ? (
        <header className="mb-4">
          <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-[2rem]">{welcome}</h1>
          <p className="mt-1.5 text-base leading-6 text-[#3E4E6B]">
            Confirm this record so we can keep your profile accurate. It takes about a minute.
          </p>
        </header>
      ) : null}

      {flow.name === "invalid" ? null : (
        <Stepper
          current={stepIndex(flow)}
          onSelect={(step) => {
            if (step === 0) showIdentity();
            else showLinkedIn();
          }}
        />
      )}
      {banner && flow.name !== "invalid" ? (
        <p role="alert" className="mb-4 rounded-xl bg-[#FDECEC] px-4 py-3 text-sm font-medium text-[#9D1F24]">
          {banner}
        </p>
      ) : null}

      <div key={flow.name === "linkedin" ? `linkedin-${flow.mode}` : flow.name} className="motion-safe:animate-fadeIn">
        {flow.name === "identity" ? (
          <section className="overflow-hidden rounded-3xl border border-[#1C315F]/10 bg-white shadow-[0_20px_50px_rgba(28,49,95,0.08)]" aria-busy={busy}>
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1C315F] via-[#1C315F] to-[#2B4B8C] px-5 py-4 text-white sm:px-7">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/[0.06]" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-28 right-28 h-44 w-44 rounded-full bg-[#ED3237]/[0.12]" aria-hidden="true" />
              <div className="relative flex items-center gap-4 sm:gap-5">
                <Avatar name={athlete.fullName} src={athlete.photoUrl} size="lg" alt="" />
                <div className="min-w-0 flex-1">
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ED3237]" aria-hidden="true" />
                    Athlete record
                  </p>
                  <h2 className="mt-1 truncate text-2xl font-semibold tracking-tight sm:text-[1.7rem]">{athlete.fullName}</h2>
                  {recordHeadline ? <p className="mt-0.5 line-clamp-1 text-sm text-white/75">{recordHeadline}</p> : null}
                </div>
                {athlete.schoolLogoUrl && !logoFailed ? (
                  <img
                    src={athlete.schoolLogoUrl}
                    alt={athlete.school ? `${athlete.school} logo` : "University logo"}
                    width={72}
                    height={72}
                    className="hidden h-[72px] w-[72px] shrink-0 rounded-2xl bg-white object-contain p-2 shadow-[0_10px_24px_rgba(0,0,0,0.18)] sm:block"
                    onError={() => setLogoFailed(true)}
                  />
                ) : null}
              </div>
            </div>
            <div className="px-5 pb-5 pt-4 sm:px-7">
              <dl className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {athlete.school ? (
                  <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#1C315F]/10 bg-[#F8F9FC] px-4 py-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#1C315F] ring-1 ring-[#1C315F]/10">
                      <GraduationCap className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 text-left">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5C6A82]">University</dt>
                      <dd className="truncate text-[15px] font-semibold text-[#1C315F]" title={athlete.school}>
                        {athlete.school}
                      </dd>
                    </div>
                  </div>
                ) : null}
                {athlete.sport ? (
                  <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#1C315F]/10 bg-[#F8F9FC] px-4 py-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#1C315F] ring-1 ring-[#1C315F]/10">
                      <Medal className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 text-left">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5C6A82]">Sport</dt>
                      <dd className="truncate text-[15px] font-semibold text-[#1C315F]" title={athlete.sport}>
                        {athlete.sport}
                      </dd>
                    </div>
                  </div>
                ) : null}
                {linkedinLabel && athlete.linkedinUrl ? (
                  <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#1C315F]/10 bg-[#F8F9FC] px-4 py-2.5 sm:col-span-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#1C315F] ring-1 ring-[#1C315F]/10">
                      <Linkedin className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1 text-left">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5C6A82]">LinkedIn</dt>
                      <dd className="truncate text-[15px] font-semibold text-[#1C315F]">
                        <a
                          href={athlete.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          referrerPolicy="no-referrer"
                          className="underline decoration-[#1C315F]/30 underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1C315F] focus-visible:ring-offset-2"
                        >
                          {linkedinLabel}
                        </a>
                      </dd>
                    </div>
                    {athlete.linkedinVerified ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#1C315F] px-2.5 py-1 text-xs font-semibold text-white">
                        <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        Verified
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </dl>
              {flow.error ? (
                <p role="alert" className="mt-4 text-sm font-medium text-[#9D1F24]">
                  {flow.error}
                </p>
              ) : null}
              {!athlete.linkedinVerified ? (
                <p className="mt-4 text-sm leading-6 text-[#3E4E6B]">
                  We still need your LinkedIn profile. After you confirm this is you, paste your profile URL. We can
                  verify the record when the last name matches.
                </p>
              ) : null}
              <div className="mt-4 border-t border-[#1C315F]/10 pt-4">
                <p className="text-center text-base font-semibold text-[#1C315F] sm:text-left">Is this you?</p>
                <div className="mt-2.5 grid gap-3 sm:grid-cols-[1.5fr_1fr]">
                  <button type="button" className={primaryButtonClass} onClick={onConfirmIdentity} disabled={busy}>
                    {athlete.linkedinVerified ? "Yes, that's me. Confirm details..." : "Yes, that's me. Add my LinkedIn"}
                  </button>
                  <button type="button" className={secondaryButtonClass} onClick={onDecline} disabled={busy}>
                    No, this is not me.
                  </button>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {flow.name === "linkedin" && flow.mode === "stored" && storedProfile ? (
          <LinkedInPanel
            kicker="LinkedIn profile on file"
            title="Is this your profile?"
            busy={busy || retrieving}
            howToEdit
            profileUrl={handleUrl(athlete.linkedinUrl, storedProfile.profileUrl)}
            refresh={
              <ProfileRefresh
                disabled={busy || retrieving || !storedProfile.profileUrl}
                onRefresh={() => void onRefresh(storedProfile.profileUrl)}
              />
            }
          >
            <ProfileCard profile={storedProfile} hideUrl />
            <div className="mt-4 grid gap-3 border-t border-[#1C315F]/10 pt-4 sm:grid-cols-2">
              <button
                type="button"
                className={primaryButtonClass}
                disabled={busy || retrieving}
                onClick={() => onConfirmProfile(storedProfile.profileUrl)}
              >
                Yes, this is my profile
              </button>
              <button type="button" className={secondaryButtonClass} disabled={busy || retrieving} onClick={onRejectStored}>
                This isn&apos;t right — update it
              </button>
            </div>
            <div className="mt-3">
              <PrivacyNote />
            </div>
          </LinkedInPanel>
        ) : null}

        {flow.name === "linkedin" && flow.mode === "form" ? (
          <LinkedInPanel kicker="LinkedIn profile" title="Paste your profile URL" busy={retrieving}>
            <p id="linkedin-help" className="text-sm leading-6 text-[#3E4E6B]">
              {athlete.linkedinVerified
                ? "Open LinkedIn, go to your profile, and copy the URL from the address bar. Paste it below."
                : "Open LinkedIn, go to your profile, and copy the URL from the address bar. We'll pull the profile and continue only when the last name matches this record."}
            </p>
            {profileNotice ? <p className="mt-3 text-sm leading-6 text-[#3E4E6B]">{profileNotice}</p> : null}
            <form
              className="mt-5"
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                if (busy || retrieving) return;
                const draft = flow.draft.trim();
                if (!draft) {
                  setFlow({ name: "linkedin", mode: "form", draft: flow.draft, error: "Paste your LinkedIn profile URL to continue." });
                  setLive("Paste your LinkedIn profile URL to continue.");
                  return;
                }
                const profileKey = linkedInProfileKey(draft);
                if (!profileKey) {
                  setInvalidLinkedInUrl(true);
                  setLive("This needs to be a valid LinkedIn URL.");
                  return;
                }
                if (!canLookupLinkedInProfile(token, profileKey)) {
                  setLookupLimited(true);
                  setLive("You have exceeded the limit of how many different LinkedIn profiles you can look up.");
                  return;
                }
                void onLookup(draft).then((found) => {
                  if (found) recordLinkedInLookup(token, profileKey);
                });
              }}
            >
              <label htmlFor="linkedin-url" className="text-sm font-semibold text-[#1C315F]">
                LinkedIn profile URL
              </label>
              <input
                id="linkedin-url"
                name="linkedinUrl"
                type="text"
                inputMode="url"
                autoComplete="url"
                spellCheck={false}
                required
                placeholder="https://www.linkedin.com/in/your-name"
                value={flow.draft}
                disabled={retrieving}
                aria-invalid={Boolean(flow.error)}
                aria-describedby={flow.error ? "linkedin-help linkedin-error" : "linkedin-help"}
                onChange={(event) => {
                  setFlow({ name: "linkedin", mode: "form", draft: event.target.value, error: null });
                }}
                className="mt-2 w-full rounded-xl border border-[#1C315F]/15 bg-white px-4 py-3.5 text-base text-[#1C315F] outline-none ring-[#1C315F] placeholder:text-[#5C6A82] focus:border-[#1C315F] focus:ring-2 disabled:bg-[#F4F6FB]"
              />
              {flow.error ? (
                <p id="linkedin-error" role="alert" className="mt-2 text-sm font-medium text-[#9D1F24]">
                  {flow.error}
                </p>
              ) : null}
              <div className="mt-4">
                <button type="submit" className={primaryButtonClass} disabled={retrieving}>
                  Find my profile
                </button>
              </div>
            </form>
            <div className="mt-5">
              <PrivacyNote />
            </div>
          </LinkedInPanel>
        ) : null}

        {flow.name === "linkedin" && flow.mode === "preview" ? (
          <LinkedInPanel
            kicker="LinkedIn profile"
            title="Does this look right?"
            busy={busy || retrieving}
            howToEdit
            profileUrl={handleUrl(flow.draft, flow.profile.profileUrl, athlete.linkedinUrl)}
            refresh={
              <ProfileRefresh
                disabled={busy || retrieving || !flow.profile.profileUrl}
                onRefresh={() => void onRefresh(flow.profile.profileUrl)}
              />
            }
          >
            <ProfileCard profile={flow.profile} simulated={flow.simulated} hideUrl />
            {!athlete.linkedinVerified && flow.lastNameMatches ? (
              <p className="mt-4 rounded-xl bg-[#F4F6FB] px-4 py-3 text-sm leading-6 text-[#1C315F]">
                The last name matches this athlete record. Confirm to save the profile and mark the LinkedIn URL verified.
              </p>
            ) : null}
            {flow.error ? (
              <p role="alert" className="mt-4 text-sm font-medium text-[#9D1F24]">
                {flow.error}
              </p>
            ) : null}
            <div
              className={`mt-4 grid gap-3 border-t border-[#1C315F]/10 pt-4 ${
                athlete.linkedinVerified || flow.lastNameMatches ? "sm:grid-cols-2" : ""
              }`}
            >
              {athlete.linkedinVerified || flow.lastNameMatches ? (
                <button
                  type="button"
                  className={primaryButtonClass}
                  disabled={busy || retrieving}
                  onClick={() => onConfirmProfile(flow.profile.profileUrl, flow.rows)}
                >
                  {athlete.linkedinVerified ? "Confirm and Save" : "Confirm and verify"}
                </button>
              ) : null}
              <button
                type="button"
                className={secondaryButtonClass}
                disabled={busy || retrieving}
                onClick={() => {
                  setFlow({ name: "linkedin", mode: "form", draft: flow.draft, error: null });
                  setLive("Try a different LinkedIn URL.");
                }}
              >
                Enter a different URL
              </button>
            </div>
            <div className="mt-3">
              <PrivacyNote />
            </div>
          </LinkedInPanel>
        ) : null}

        {flow.name === "done" ? (
          <StatusPanel title="You're confirmed">
            <p>Thanks, {athlete.firstName || athlete.fullName}. We saved your confirmation.</p>
            {flow.notice ? <p>{flow.notice}</p> : null}
            <ul className="space-y-2 text-[#1C315F]">
              <li>
                <span className="text-[#5C6A82]">Athlete · </span>
                {athlete.fullName}
                {athlete.school ? `, ${athlete.school}` : ""}
                {athlete.sport ? `, ${athlete.sport}` : ""}
              </li>
              {publicLinkedInLabel(flow.linkedinUrl) ? (
                <li className="break-all">
                  <span className="text-[#5C6A82]">LinkedIn · </span>
                  {publicLinkedInLabel(flow.linkedinUrl)}
                </li>
              ) : null}
            </ul>
            <a href="https://members.collegeathletenetwork.org" className={primaryButtonClass}>
              Login to The College Athlete Network
            </a>
          </StatusPanel>
        ) : null}

        {flow.name === "already" ? (
          <StatusPanel title="You're all set">
            <p>We already have your confirmation{athlete.firstName ? `, ${athlete.firstName}` : ""}.</p>
            {publicLinkedInLabel(athlete.claim.linkedinUrl) ? (
              <p className="break-all text-[#1C315F]">
                <span className="text-[#5C6A82]">LinkedIn · </span>
                {publicLinkedInLabel(athlete.claim.linkedinUrl)}
              </p>
            ) : null}
            <div className="flex flex-col gap-3">
              <button type="button" className={secondaryButtonClass} onClick={showIdentity}>
                Review my record
              </button>
              <button
                type="button"
                className={primaryButtonClass}
                onClick={() => {
                  setFlow({ name: "linkedin", mode: "form", draft: "", error: null });
                  setLive("Paste an updated LinkedIn profile URL.");
                }}
              >
                Update my LinkedIn
              </button>
              <Link href="/" className={secondaryButtonClass}>
                Go to The College Athlete Network
              </Link>
            </div>
          </StatusPanel>
        ) : null}

        {flow.name === "invalid" ? (
          <StatusPanel title="This link isn't valid">
            <p>If you opened this from an email, contact us and we&apos;ll send a fresh link.</p>
            <a href="mailto:admin@collegeathletenetwork.org" className={primaryButtonClass}>
              Contact us
            </a>
          </StatusPanel>
        ) : null}
      </div>
      <RetrievingModal open={retrieving} />
      <InvalidLinkedInUrlModal open={invalidLinkedInUrl} onClose={() => setInvalidLinkedInUrl(false)} />
      <LastNameWarningModal
        open={nameWarningOpen}
        athleteFirst={athlete.firstName}
        athleteLast={lastToken(athlete.fullName)}
        linkedInFirst={flow.name === "linkedin" && flow.mode === "preview" ? renidlyFirst(flow.rows, flow.profile.fullName) : ""}
        linkedInLast={flow.name === "linkedin" && flow.mode === "preview" ? renidlyLast(flow.rows, flow.profile.fullName) : ""}
        onProceed={() => {
          setNameWarningOpen(false);
          setLive("Review this LinkedIn profile, then confirm it if it is yours.");
        }}
        onBack={() => {
          setNameWarningOpen(false);
          if (flow.name === "linkedin" && flow.mode === "preview") {
            setFlow({ name: "linkedin", mode: "form", draft: flow.draft, error: null });
          }
          setLive("Try a different LinkedIn URL.");
        }}
      />
      <RefreshLimitModal open={refreshLimited} onClose={() => setRefreshLimited(false)} />
      <RefreshLimitModal
        open={lookupLimited}
        onClose={() => setLookupLimited(false)}
        label="lookup"
        title="Profile lookup limit reached"
        message="You have exceeded the limit of how many different LinkedIn profiles you can look up. Please contact support if you need help."
      />
    </ClaimShell>
  );
}
