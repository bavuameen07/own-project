"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import {
  hasErrors,
  validateVacancyForm,
  type FormErrors,
  type VacancyFormValues,
} from "@/lib/validation";

const EMPTY_VALUES: VacancyFormValues = {
  title: "",
  description: "",
  openings: "1",
  salary: "",
  jobType: "",
  location: "",
};

const JOB_TYPE_SUGGESTIONS = [
  "Full Time",
  "Part Time",
  "Contract",
  "Internship",
  "Freelance",
];

export function VacancyForm() {
  const router = useRouter();
  const [values, setValues] = useState<VacancyFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FormErrors<VacancyFormValues>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  function update<K extends keyof VacancyFormValues>(
    key: K,
    value: VacancyFormValues[K],
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

    const nextErrors = validateVacancyForm(values);
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
          action: "addVacancy",
          title: values.title.trim(),
          description: values.description.trim(),
          openings: Number(values.openings),
          salary: values.salary.trim(),
          jobType: values.jobType.trim(),
          location: values.location.trim(),
        }),
      });

      let payload: {
        success?: boolean;
        message?: string;
        data?: { vacancyId?: string | null };
      } | null = null;

      try {
        payload = (await response.json());
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.success) {
        setServerError(
          payload?.message ?? "Could not create the vacancy. Please try again.",
        );
        return;
      }

      setCreatedId(payload.data?.vacancyId ?? null);
      router.refresh();
    } catch {
      setServerError(
        "Unable to reach the recruitment service. Please check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (createdId) {
    return (
      <div className="card animate-fade-up p-7 sm:p-9">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-success/25 bg-success-soft text-success">
          <CheckIcon className="h-6 w-6" />
        </span>
        <h2 className="mt-5 text-xl font-semibold tracking-tight text-ink">
          Vacancy created successfully.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          The new position is now part of the recruitment sheet and will appear
          on the public jobs page once it is set to Open.
        </p>

        <dl className="mt-6 flex flex-wrap gap-6 border-t border-line pt-5 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">
              Vacancy ID
            </dt>
            <dd className="mt-1 font-mono text-base font-semibold text-ink">
              {createdId ?? "Assigned by the backend"}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">
              Job title
            </dt>
            <dd className="mt-1 font-medium text-ink">{values.title}</dd>
          </div>
        </dl>

        <div className="mt-7 flex flex-wrap gap-3">
          <ButtonLink href="/admin/vacancies">
            View Vacancies
            <ArrowRightIcon className="h-4 w-4" />
          </ButtonLink>
          <Button
            variant="secondary"
            onClick={() => {
              setCreatedId(null);
              setValues(EMPTY_VALUES);
            }}
          >
            Add another vacancy
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="title" className="field-label">
            Job Title <span className="text-danger">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className="field-input"
            placeholder="e.g. Digital Marketer"
            value={values.title}
            onChange={(event) => update("title", event.target.value)}
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={errors.title ? "title-error" : undefined}
            disabled={submitting}
            required
          />
          {errors.title ? (
            <span id="title-error" className="field-error">
              {errors.title}
            </span>
          ) : null}
        </div>

        <div>
          <label htmlFor="openings" className="field-label">
            Openings <span className="text-danger">*</span>
          </label>
          <input
            id="openings"
            name="openings"
            type="number"
            min={1}
            step={1}
            inputMode="numeric"
            className="field-input"
            value={values.openings}
            onChange={(event) => update("openings", event.target.value)}
            aria-invalid={errors.openings ? true : undefined}
            aria-describedby={errors.openings ? "openings-error" : undefined}
            disabled={submitting}
            required
          />
          {errors.openings ? (
            <span id="openings-error" className="field-error">
              {errors.openings}
            </span>
          ) : null}
        </div>

        <div>
          <label htmlFor="jobType" className="field-label">
            Job Type
          </label>
          <input
            id="jobType"
            name="jobType"
            type="text"
            list="job-type-suggestions"
            className="field-input"
            placeholder="e.g. Full Time"
            value={values.jobType}
            onChange={(event) => update("jobType", event.target.value)}
            disabled={submitting}
          />
          <datalist id="job-type-suggestions">
            {JOB_TYPE_SUGGESTIONS.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="salary" className="field-label">
            Salary
          </label>
          <input
            id="salary"
            name="salary"
            type="text"
            className="field-input"
            placeholder="e.g. 25000 - 35000"
            value={values.salary}
            onChange={(event) => update("salary", event.target.value)}
            aria-invalid={errors.salary ? true : undefined}
            aria-describedby={
              errors.salary ? "salary-error" : "salary-hint"
            }
            disabled={submitting}
          />
          {errors.salary ? (
            <span id="salary-error" className="field-error">
              {errors.salary}
            </span>
          ) : (
            <span id="salary-hint" className="field-hint">
              Optional — leave blank if not disclosed.
            </span>
          )}
        </div>

        <div>
          <label htmlFor="location" className="field-label">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            className="field-input"
            placeholder="e.g. Kozhikode"
            value={values.location}
            onChange={(event) => update("location", event.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="description" className="field-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={6}
            className="field-input resize-y"
            placeholder="Responsibilities, requirements and anything a candidate should know."
            value={values.description}
            onChange={(event) => update("description", event.target.value)}
            disabled={submitting}
          />
          <span className="field-hint">Optional — plain text, one paragraph per line.</span>
        </div>
      </div>

      {serverError ? (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          {serverError}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <Button type="submit" disabled={submitting} className="sm:w-auto" fullWidth>
          {submitting ? "Creating…" : "Create Vacancy"}
        </Button>
        <ButtonLink href="/admin/vacancies" variant="ghost" size="md">
          Cancel
        </ButtonLink>
      </div>
    </form>
  );
}
