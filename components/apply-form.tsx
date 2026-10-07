"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  hasErrors,
  validateApplyForm,
  type ApplyFormValues,
  type FormErrors,
} from "@/lib/validation";

const EMPTY_VALUES: ApplyFormValues = {
  fullName: "",
  phone: "",
  email: "",
  experience: "",
  resumeLink: "",
  message: "",
};

interface ApplyResponse {
  success?: boolean;
  message?: string;
  data?: { candidateId?: string | null };
}

interface ApplyFormProps {
  vacancyId: string;
  vacancyTitle: string;
}

export function ApplyForm({ vacancyId, vacancyTitle }: ApplyFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<ApplyFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FormErrors<ApplyFormValues>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof ApplyFormValues>(
    key: K,
    value: ApplyFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setServerError(null);

    const nextErrors = validateApplyForm(values);
    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      const firstField = Object.keys(nextErrors)[0];
      document.getElementById(firstField)?.focus();
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch("/api/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "applyCandidate",
          vacancyId,
          fullName: values.fullName.trim(),
          phone: values.phone.trim(),
          email: values.email.trim(),
          experience: values.experience.trim(),
          resumeLink: values.resumeLink.trim(),
          message: values.message.trim(),
        }),
      });

      let payload: ApplyResponse | null = null;

      try {
        payload = (await response.json()) as ApplyResponse;
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success) {
        setServerError(
          payload?.message ?? "We could not submit your application. Please try again.",
        );
        return;
      }

      const query = new URLSearchParams({ vacancyId, vacancyTitle });
      const candidateId = payload.data?.candidateId;
      if (candidateId) query.set("candidateId", candidateId);

      router.push(`/application-success?${query.toString()}`);
    } catch {
      setServerError(
        "We could not reach the recruitment service. Please check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="field-label">
            Full Name <span className="text-danger">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            className="field-input"
            placeholder="Your full name"
            value={values.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            aria-invalid={errors.fullName ? true : undefined}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            disabled={submitting}
            required
          />
          {errors.fullName ? (
            <span id="fullName-error" className="field-error">
              {errors.fullName}
            </span>
          ) : null}
        </div>

        <div>
          <label htmlFor="phone" className="field-label">
            Phone <span className="text-danger">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            className="field-input"
            placeholder="Your contact number"
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? "phone-error" : undefined}
            disabled={submitting}
            required
          />
          {errors.phone ? (
            <span id="phone-error" className="field-error">
              {errors.phone}
            </span>
          ) : null}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="field-label">
          Email <span className="text-danger">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          className="field-input"
          placeholder="you@example.com"
          value={values.email}
          onChange={(event) => update("email", event.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "email-error" : undefined}
          disabled={submitting}
          required
        />
        {errors.email ? (
          <span id="email-error" className="field-error">
            {errors.email}
          </span>
        ) : null}
      </div>

      <div>
        <label htmlFor="experience" className="field-label">
          Experience
        </label>
        <input
          id="experience"
          name="experience"
          type="text"
          className="field-input"
          placeholder="e.g. 2 years in digital marketing"
          value={values.experience}
          onChange={(event) => update("experience", event.target.value)}
          aria-describedby="experience-hint"
          disabled={submitting}
        />
        <span id="experience-hint" className="field-hint">
          Optional — a short summary is enough.
        </span>
      </div>

      <div>
        <label htmlFor="resumeLink" className="field-label">
          Resume Link
        </label>
        <input
          id="resumeLink"
          name="resumeLink"
          type="url"
          inputMode="url"
          className="field-input"
          placeholder="https://link-to-your-resume"
          value={values.resumeLink}
          onChange={(event) => update("resumeLink", event.target.value)}
          aria-invalid={errors.resumeLink ? true : undefined}
          aria-describedby={
            errors.resumeLink ? "resumeLink-error" : "resumeLink-hint"
          }
          disabled={submitting}
        />
        {errors.resumeLink ? (
          <span id="resumeLink-error" className="field-error">
            {errors.resumeLink}
          </span>
        ) : (
          <span id="resumeLink-hint" className="field-hint">
            Optional — link to a Google Drive, Dropbox or personal portfolio file.
          </span>
        )}
      </div>

      <div>
        <label htmlFor="message" className="field-label">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="field-input resize-y"
          placeholder="Tell us why you are a great fit for this role."
          value={values.message}
          onChange={(event) => update("message", event.target.value)}
          disabled={submitting}
        />
        <span className="field-hint">Optional.</span>
      </div>

      {serverError ? (
        <div
          role="alert"
          className="rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {serverError}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
        <Button type="submit" size="lg" disabled={submitting} fullWidth className="sm:w-auto">
          {submitting ? "Submitting…" : "Submit Application"}
        </Button>
        <p className="text-xs text-ink-faint">
          Applying for {vacancyTitle} — your details go straight to the hiring team.
        </p>
      </div>
    </form>
  );
}
