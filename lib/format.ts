/** Small formatting helpers shared across public and admin screens. */

export function formatDate(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(trimmed)
    ? trimmed.replace(" ", "T")
    : trimmed;

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(trimmed)
    ? trimmed.replace(" ", "T")
    : trimmed;

  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function pluralize(
  count: number,
  singular: string,
  plural = `${singular}s`,
): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function truncate(value: string, max = 140): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

/** Normalises a phone number into a WhatsApp-compatible digits-only value. */
export function toWhatsAppNumber(phone: string, defaultCountryCode = "91"): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `${defaultCountryCode}${digits}`;
  return digits;
}
