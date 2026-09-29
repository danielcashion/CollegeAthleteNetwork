"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const topics = [
  "Account access",
  "School network",
  "Billing",
  "Website issue",
  "Other",
] as const;

const fieldClass =
  "w-full rounded-lg border border-[#d5dbe6] bg-[#f8fafc] px-3.5 py-3 text-[#1C315F] outline-none transition placeholder:text-[#8b97a8] focus:border-[#1C315F] focus:bg-white focus:ring-2 focus:ring-[#1C315F]/15";

export default function SupportForm({ initialTopic }: { initialTopic?: string }) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const startingTopic = topics.includes(initialTopic as (typeof topics)[number])
    ? (initialTopic as (typeof topics)[number])
    : "Account access";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [topic, setTopic] = useState<(typeof topics)[number]>(startingTopic);

  useEffect(() => {
    if (topics.includes(initialTopic as (typeof topics)[number])) {
      setTopic(initialTopic as (typeof topics)[number]);
    }
  }, [initialTopic]);
  const [question, setQuestion] = useState("");
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !question.trim()) {
      setError("Name, email, and question are required.");
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (!RECAPTCHA_SITE_KEY) {
      setError("The form is not configured yet. Email support@collegeathletenetwork.org instead.");
      return;
    }
    if (!recaptchaToken) {
      setError("Complete the reCAPTCHA check before sending.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          organization,
          topic,
          question,
          recaptchaToken,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to send your question.");
      }
      setSent(true);
      setName("");
      setEmail("");
      setOrganization("");
      setQuestion("");
      setTopic("Account access");
      setRecaptchaToken(null);
      recaptchaRef.current?.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send your question.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-[#d7e3d4] bg-[#f4f8f2] px-6 py-8" role="status">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#3d6b32]">
          Received
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-[#1C315F]">Your question is with our team</h2>
        <p className="mt-3 max-w-xl leading-7 text-[#2a384c]">
          We will reply to the email address you provided. If the question is about a
          specific school, include that name if you have not already.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-6 rounded-lg border border-[#1C315F] px-4 py-2 text-sm font-semibold text-[#1C315F] transition hover:bg-[#1C315F] hover:text-white"
        >
          Send another question
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-[#1C315F]">Topic</legend>
        <div className="flex flex-wrap gap-2">
          {topics.map((item) => {
            const selected = topic === item;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={selected}
                onClick={() => setTopic(item)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                  selected
                    ? "border-[#1C315F] bg-[#1C315F] text-white"
                    : "border-[#d5dbe6] bg-white text-[#1C315F] hover:border-[#1C315F]"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="support-name" className="mb-1.5 block text-sm font-semibold text-[#1C315F]">
            Name
          </label>
          <input
            id="support-name"
            name="name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="support-email" className="mb-1.5 block text-sm font-semibold text-[#1C315F]">
            Email
          </label>
          <input
            id="support-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@university.edu"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="support-organization" className="mb-1.5 block text-sm font-semibold text-[#1C315F]">
          School or organization <span className="font-normal text-[#5c6b82]">(optional)</span>
        </label>
        <input
          id="support-organization"
          name="organization"
          autoComplete="organization"
          value={organization}
          onChange={(event) => setOrganization(event.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="support-question" className="mb-1.5 block text-sm font-semibold text-[#1C315F]">
          Question
        </label>
        <textarea
          id="support-question"
          name="question"
          required
          rows={6}
          placeholder="Describe what you need and any school, account, or page involved."
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          className={fieldClass}
        />
      </div>

      {RECAPTCHA_SITE_KEY ? (
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={setRecaptchaToken}
          onExpired={() => setRecaptchaToken(null)}
          onErrored={() => {
            setRecaptchaToken(null);
            setError("reCAPTCHA verification failed. Please try again.");
          }}
        />
      ) : (
        <p className="rounded-lg border border-dashed border-[#cbd5e1] bg-[#f8fafc] px-4 py-3 text-sm text-[#5c6b82]">
          reCAPTCHA is not configured in this environment.
        </p>
      )}

      {error ? (
        <p className="rounded-lg border border-[#f0c9cb] bg-[#fdf6f6] px-4 py-3 text-sm font-medium text-[#9d1f24]" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-[#e6ebf2] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#5c6b82]">We reply to the email address on this form.</p>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-[#1C315F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#152648] disabled:cursor-not-allowed disabled:bg-[#94a3b8]"
        >
          {loading ? "Sending…" : "Send question"}
        </button>
      </div>
    </form>
  );
}
