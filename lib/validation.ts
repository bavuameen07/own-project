/**
 * Shared, framework-independent form validation.
 * Used by the browser forms and reused by the server route handlers so the
 * same rules apply on both sides.
 */

export interface ApplyFormValues {
  fullName: string;
  phone: string;
  email: string;
  experience: string;
  resumeLink: string;
  message: string;
}

export interface VacancyFormValues {
  title: string;
  description: string;
  openings: string;
  salary: string;
  jobType: string;
  location: string;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}

export function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return false;
  }
  return parsed.protocol === "http:" || parsed.protocol === "https:";
}

export function validateApplyForm(
  values: ApplyFormValues,
): FormErrors<ApplyFormValues> {
  const errors: FormErrors<ApplyFormValues> = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Please enter your full name.";
  } else if (values.fullName.trim().length < 2) {
    errors.fullName = "Please enter a valid full name.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Please enter your phone number.";
  } else if (!isValidPhone(values.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (values.resumeLink.trim() && !isValidHttpUrl(values.resumeLink)) {
    errors.resumeLink =
      "Please enter a valid link starting with http:// or https://";
  }

  return errors;
}

export function validateVacancyForm(
  values: VacancyFormValues,
): FormErrors<VacancyFormValues> {
  const errors: FormErrors<VacancyFormValues> = {};

  if (!values.title.trim()) {
    errors.title = "Please enter a job title.";
  }

  const openings = Number(values.openings);
  if (!values.openings.trim()) {
    errors.openings = "Please enter the number of openings.";
  } else if (!Number.isInteger(openings) || openings < 1) {
    errors.openings = "Openings must be a whole number of 1 or more.";
  }

  if (values.salary.trim().length > 100) {
    errors.salary = "Salary is too long.";
  }

  return errors;
}

export function hasErrors<T>(errors: FormErrors<T>): boolean {
  return Object.keys(errors).length > 0;
}
