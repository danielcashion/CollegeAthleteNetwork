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

export function ClaimFlow({
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
  const [logoFailed, setLogoFailed] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [live, setLive] = useState("Confirm whether this athlete record is you.");

  const welcome = athlete.firstName ? `Welcome, ${athlete.firstName}` : "Welcome";
  const linkedinLabel = athlete.linkedinUrl?.replace(/^https?:\/\/(www\.)?/, "") || "";

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
      setFlow({
        name: "linkedin",
        mode: "preview",
        draft: result.profile.profileUrl,
        profile: result.profile,
        rows: result.rows,
        simulated: result.simulated,
        lastNameMatches: result.lastNameMatches,
        error: result.lastNameMatches ? null : "The last name on this LinkedIn profile doesn't match this athlete record. Paste your own profile URL.",
      });
      setLive(
        result.lastNameMatches
          ? `Found a profile for ${result.profile.fullName}. The last name matches. Confirm it to verify this record.`
          : "The last name on this LinkedIn profile doesn't match this athlete record.",
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

  const inProgress = flow.name === "identity" || flow.name === "linkedin";

  return (
    <ClaimShell>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {live}
      </p>
      {inProgress ? (
        <header className="mb-6">
          <h1 className="text-[1.85rem] font-semibold leading-tight tracking-tight sm:text-4xl">{welcome}</h1>
          <p className="mt-2 text-base leading-6 text-[#3E4E6B]">
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
            <div className="bg-[#1C315F] px-6 pb-20 pt-8 text-center text-white sm:px-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Athlete record</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Is this you?</h2>
            </div>
            <div className="-mt-14 px-5 pb-6 sm:px-8 sm:pb-8">
              <div className="flex flex-col items-center text-center">
                <div className="flex items-end justify-center gap-4">
                  {athlete.schoolLogoUrl && !logoFailed ? (
                    <img
                      src={athlete.schoolLogoUrl}
                      alt={athlete.school ? `${athlete.school} logo` : "University logo"}
                      width={128}
                      height={128}
                      className="h-32 w-32 rounded-3xl bg-white object-contain p-3 shadow-[0_12px_30px_rgba(28,49,95,0.18)] ring-4 ring-white"
                      onError={() => setLogoFailed(true)}
                    />
                  ) : null}
                  <Avatar name={athlete.fullName} src={athlete.photoUrl} size="xl" alt="" />
                </div>
                <p className="mt-4 text-2xl font-semibold tracking-tight text-[#1C315F]">{athlete.fullName}</p>
              </div>
              {storedProfile && athlete.linkedinVerified ? (
                <div className="mt-4 text-left">
                  <ProfileCard profile={storedProfile} compact />
                </div>
              ) : null}
              <dl className="mt-6 overflow-hidden rounded-2xl border border-[#1C315F]/10">
                {athlete.school ? (
                  <div className="flex items-center gap-3 border-b border-[#1C315F]/10 px-4 py-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4F6FB] text-[#1C315F]">
                      <GraduationCap className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 text-left">
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5C6A82]">University</dt>
                      <dd className="truncate text-base font-semibold text-[#1C315F]">{athlete.school}</dd>
                    </div>
                  </div>
                ) : null}
                {athlete.sport ? (
                  <div className="flex items-center gap-3 border-b border-[#1C315F]/10 px-4 py-3.5 last:border-b-0">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4F6FB] text-[#1C315F]">
                      <Medal className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 text-left">
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5C6A82]">Sport</dt>
                      <dd className="truncate text-base font-semibold text-[#1C315F]">{athlete.sport}</dd>
                    </div>
                  </div>
                ) : null}
                {athlete.linkedinUrl ? (
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4F6FB] text-[#1C315F]">
                      <Linkedin className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1 text-left">
                      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5C6A82]">LinkedIn</dt>
                      <dd className="truncate text-base font-semibold text-[#1C315F]">
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
              <div className="mt-6 flex flex-col gap-3">
                <button type="button" className={primaryButtonClass} onClick={onConfirmIdentity} disabled={busy}>
                  {athlete.linkedinVerified ? "Yes, that's me. Confirm details..." : "Yes, that's me. Add my LinkedIn"}
                </button>
                <button type="button" className={secondaryButtonClass} onClick={onDecline} disabled={busy}>
                  No, this is not me.
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {flow.name === "linkedin" && flow.mode === "stored" && storedProfile ? (
          <LinkedInPanel
            kicker="LinkedIn profile"
            title="Is this your profile?"
            busy={busy || retrieving}
            howToEdit
            profileUrl={storedProfile.profileUrl}
          >
            <p className="text-center text-sm leading-6 text-[#3E4E6B]">We already have this profile on file for you.</p>
            <div className="mt-6">
              <ProfileCard profile={storedProfile} hideUrl />
            </div>
            <ProfileRefresh
              profileUrl={storedProfile.profileUrl}
              disabled={busy || retrieving}
              onRefresh={() => void onRefresh(storedProfile.profileUrl)}
            />
            <div className="mt-6">
              <PrivacyNote />
            </div>
            <div className="mt-6 flex flex-col gap-3">
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
          </LinkedInPanel>
        ) : null}

        {flow.name === "linkedin" && flow.mode === "form" ? (
          <LinkedInPanel kicker="LinkedIn profile" title="Paste your profile URL" busy={retrieving}>
            <p id="linkedin-help" className="text-center text-sm leading-6 text-[#3E4E6B]">
              {athlete.linkedinVerified
                ? "Open LinkedIn, go to your profile, and copy the URL from the address bar. Paste it below."
                : "Open LinkedIn, go to your profile, and copy the URL from the address bar. We'll pull the profile and continue only when the last name matches this record."}
            </p>
            {profileNotice ? <p className="mt-3 text-sm leading-6 text-[#3E4E6B]">{profileNotice}</p> : null}
            <form
              className="mt-5"
              onSubmit={(event) => {
                event.preventDefault();
                if (busy || retrieving) return;
                const draft = flow.draft.trim();
                if (!draft) {
                  setFlow({ name: "linkedin", mode: "form", draft: flow.draft, error: "Paste your LinkedIn profile URL to continue." });
                  setLive("Paste your LinkedIn profile URL to continue.");
                  return;
                }
                void onLookup(draft);
              }}
            >
              <label htmlFor="linkedin-url" className="text-sm font-semibold text-[#1C315F]">
                LinkedIn profile URL
              </label>
              <input
                id="linkedin-url"
                name="linkedinUrl"
                type="url"
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
            profileUrl={flow.profile.profileUrl}
          >
            <ProfileCard profile={flow.profile} simulated={flow.simulated} hideUrl />
            {!athlete.linkedinVerified && flow.lastNameMatches ? (
              <p className="mt-4 rounded-xl bg-[#F4F6FB] px-4 py-3 text-sm leading-6 text-[#1C315F]">
                The last name matches this athlete record. Confirm to save the profile and mark the LinkedIn URL verified.
              </p>
            ) : null}
            {!athlete.linkedinVerified && !flow.lastNameMatches ? (
              <p role="alert" className="mt-4 text-sm font-medium text-[#9D1F24]">
                {flow.error || "The last name on this LinkedIn profile doesn't match this athlete record. Paste your own profile URL."}
              </p>
            ) : null}
            {athlete.linkedinVerified && flow.error ? (
              <p role="alert" className="mt-4 text-sm font-medium text-[#9D1F24]">
                {flow.error}
              </p>
            ) : null}
            <ProfileRefresh
              profileUrl={flow.profile.profileUrl}
              disabled={busy || retrieving}
              onRefresh={() => void onRefresh(flow.profile.profileUrl)}
            />
            <div className="mt-5">
              <PrivacyNote />
            </div>
            <div className="mt-6 flex flex-col gap-3">
              {athlete.linkedinVerified || flow.lastNameMatches ? (
                <button
                  type="button"
                  className={primaryButtonClass}
                  disabled={busy || retrieving}
                  onClick={() => onConfirmProfile(flow.profile.profileUrl, flow.rows)}
                >
                  {athlete.linkedinVerified ? "Confirm" : "Confirm and verify"}
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
              <li className="break-all">
                <span className="text-[#5C6A82]">LinkedIn · </span>
                {flow.linkedinUrl}
              </li>
            </ul>
            <Link href="/" className={primaryButtonClass}>
              Go to The College Athlete Network
            </Link>
          </StatusPanel>
        ) : null}

        {flow.name === "already" ? (
          <StatusPanel title="You're all set">
            <p>We already have your confirmation{athlete.firstName ? `, ${athlete.firstName}` : ""}.</p>
            {athlete.claim.linkedinUrl ? (
              <p className="break-all text-[#1C315F]">
                <span className="text-[#5C6A82]">LinkedIn · </span>
                {athlete.claim.linkedinUrl}
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
      <RefreshLimitModal open={refreshLimited} onClose={() => setRefreshLimited(false)} />
    </ClaimShell>
  );
}
