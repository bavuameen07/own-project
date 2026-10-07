import { cache } from "react";

import { getGoogleScriptUrl } from "@/lib/env";
import type {
  Candidate,
  RecruitmentGroup,
  Vacancy,
  VacancyWithCandidates,
} from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Errors                                                                      */
/* -------------------------------------------------------------------------- */

export type ApiErrorKind =
  | "config"
  | "timeout"
  | "network"
  | "http"
  | "parse"
  | "api"
  | "notFound";

const ERROR_MESSAGES: Record<Exclude<ApiErrorKind, "api" | "notFound">, string> = {
  config:
    "The recruitment service is not configured correctly. Please contact the site administrator.",
  timeout: "The recruitment service took too long to respond. Please try again.",
  network:
    "Unable to reach the recruitment service. Please check your connection and try again.",
  http: "The recruitment service returned an unexpected response. Please try again.",
  parse: "The recruitment service returned an unexpected response. Please try again.",
};

export class RecruitmentApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly httpStatus?: number;

  constructor(message: string, kind: ApiErrorKind, httpStatus?: number) {
    super(message);
    this.name = "RecruitmentApiError";
    this.kind = kind;
    this.httpStatus = httpStatus;
  }

  /** Safe, user-facing message. Never contains stack traces or backend details. */
  get userMessage(): string {
    if (this.kind === "notFound") {
      return "We could not find the record you are looking for.";
    }
    if (this.kind === "api") {
      return this.message;
    }
    return ERROR_MESSAGES[this.kind];
  }
}

export function isNotFound(error: unknown): boolean {
  return error instanceof RecruitmentApiError && error.kind === "notFound";
}

/** Builds a safe message from any thrown value. */
export function toUserMessage(error: unknown, fallback: string): string {
  if (error instanceof RecruitmentApiError) return error.userMessage;
  return fallback;
}

/* -------------------------------------------------------------------------- */
/* Low level transport                                                         */
/* -------------------------------------------------------------------------- */

const GET_TIMEOUT_MS = 20_000;
const POST_TIMEOUT_MS = 30_000;

function buildUrl(action: string, params: Record<string, string>): URL {
  let url: URL;
  try {
    url = new URL(getGoogleScriptUrl());
  } catch {
    throw new RecruitmentApiError(
      "Missing or invalid GOOGLE_SCRIPT_URL environment variable.",
      "config",
    );
  }
  url.searchParams.set("action", action);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url;
}

function toRequestError(error: unknown): RecruitmentApiError {
  if (error instanceof RecruitmentApiError) return error;
  if (error instanceof Error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      return new RecruitmentApiError("Request timed out.", "timeout");
    }
    if (error instanceof TypeError) {
      return new RecruitmentApiError("Network request failed.", "network");
    }
    return new RecruitmentApiError("Request failed.", "network");
  }
  return new RecruitmentApiError("Request failed.", "network");
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!response.ok) {
    throw new RecruitmentApiError(
      `Request failed with status ${response.status}.`,
      "http",
      response.status,
    );
  }

  const trimmed = text.trim();
  if (!trimmed) {
    throw new RecruitmentApiError("Empty response.", "parse");
  }

  try {
    return JSON.parse(trimmed) as unknown;
  } catch {
    throw new RecruitmentApiError("Invalid JSON response.", "parse");
  }
}

/**
 * Short-lived server-side cache for read actions.
 *
 * Google Apps Script responses regularly take 1–4s (and much longer when the
 * script is cold). Caching successful GETs for a few seconds makes navigating
 * between admin pages feel instant, while `clearRecruitmentCache()` (called
 * after every mutation and by the Refresh button) guarantees fresh data on
 * demand. In-flight requests are shared so concurrent renders only ever make
 * one upstream call.
 */
const READ_TTL_MS = 15_000;

interface CacheEntry {
  expires: number;
  value: unknown;
}

const readCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<unknown>>();

export function clearRecruitmentCache(): void {
  readCache.clear();
}

async function cachedGet(
  key: string,
  load: () => Promise<unknown>,
): Promise<unknown> {
  const hit = readCache.get(key);
  if (hit && hit.expires > Date.now()) return hit.value;

  const pending = inFlight.get(key);
  if (pending) return pending;

  const promise = load()
    .then((value) => {
      readCache.set(key, { expires: Date.now() + READ_TTL_MS, value });
      inFlight.delete(key);
      return value;
    })
    .catch((error: unknown) => {
      inFlight.delete(key);
      throw error;
    });

  inFlight.set(key, promise);
  return promise;
}

async function callGet(
  action: string,
  params: Record<string, string> = {},
): Promise<unknown> {
  const url = buildUrl(action, params);
  const key = url.toString();

  return cachedGet(key, async () => {
    let response: Response;
    try {
      response = await fetch(key, {
        method: "GET",
        redirect: "follow",
        cache: "no-store",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(GET_TIMEOUT_MS),
      });
    } catch (error) {
      throw toRequestError(error);
    }
    return readBody(response);
  });
}

async function callPost(
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const url = buildUrl(String(payload.action ?? ""), {});

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: "POST",
      // `text/plain` avoids the CORS preflight that Google Apps Script cannot answer.
      headers: { "Content-Type": "text/plain;charset=utf-8", Accept: "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(POST_TIMEOUT_MS),
    });
  } catch (error) {
    throw toRequestError(error);
  }

  const parsed = await readBody(response);
  const object = asObject(parsed);

  if (object.usage) {
    // The API answers unknown actions with its usage payload.
    throw new RecruitmentApiError(
      "The recruitment service did not recognise that request.",
      "api",
    );
  }

  if (object.success === false) {
    const message =
      readString(object, "error") ??
      readString(object, "message") ??
      "The request could not be completed.";
    throw new RecruitmentApiError(message, "api");
  }

  return object;
}

/* -------------------------------------------------------------------------- */
/* Response shaping helpers                                                    */
/* -------------------------------------------------------------------------- */

function asObject(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new RecruitmentApiError("Unexpected response.", "parse");
  }
  return value as Record<string, unknown>;
}

function readString(
  source: unknown,
  ...keys: string[]
): string | undefined {
  if (typeof source !== "object" || source === null) return undefined;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim() !== "") return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return undefined;
}

function readNumber(source: unknown, ...keys: string[]): number {
  if (typeof source !== "object" || source === null) return 0;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function assertSuccess(object: Record<string, unknown>): void {
  if (object.usage) {
    throw new RecruitmentApiError(
      "The recruitment service did not recognise that request.",
      "api",
    );
  }
  if (object.success === false) {
    const message =
      readString(object, "error") ??
      readString(object, "message") ??
      "The request could not be completed.";
    if (/not\s*found/i.test(message)) {
      throw new RecruitmentApiError(message, "notFound");
    }
    throw new RecruitmentApiError(message, "api");
  }
}

function unwrapList<T>(
  payload: unknown,
  keys: string[],
  map: (raw: unknown) => T,
): T[] {
  const object = asObject(payload);
  assertSuccess(object);
  for (const key of keys) {
    const value = object[key];
    if (Array.isArray(value)) return value.map(map);
  }
  throw new RecruitmentApiError("Unexpected response.", "parse");
}

function unwrapSingle<T>(
  payload: unknown,
  keys: string[],
  map: (raw: unknown) => T,
): T {
  const object = asObject(payload);
  assertSuccess(object);
  for (const key of keys) {
    const value = object[key];
    if (value && typeof value === "object") return map(value);
    if (Array.isArray(value) && value.length > 0) return map(value[0]);
  }
  throw new RecruitmentApiError("Unexpected response.", "parse");
}

function toVacancy(raw: unknown): Vacancy {
  const object = asObject(raw);
  return {
    VacancyID: readString(object, "VacancyID", "vacancyId", "id") ?? "",
    Title: readString(object, "Title", "title") ?? "",
    Description: readString(object, "Description", "description") ?? "",
    Openings: readNumber(object, "Openings", "openings"),
    Status: readString(object, "Status", "status") ?? "",
    CreatedAt: readString(object, "CreatedAt", "createdAt") ?? "",
    Salary: readString(object, "Salary", "salary") ?? "",
    JobType: readString(object, "JobType", "jobType") ?? "",
    Location: readString(object, "Location", "location") ?? "",
  };
}

function toCandidate(raw: unknown): Candidate {
  const object = asObject(raw);
  return {
    CandidateID: readString(object, "CandidateID", "candidateId", "id") ?? "",
    VacancyID: readString(object, "VacancyID", "vacancyId") ?? "",
    VacancyTitle: readString(object, "VacancyTitle", "vacancyTitle") ?? "",
    FullName: readString(object, "FullName", "fullName", "name") ?? "",
    Phone: readString(object, "Phone", "phone") ?? "",
    Email: readString(object, "Email", "email") ?? "",
    Experience: readString(object, "Experience", "experience") ?? "",
    ResumeLink: readString(object, "ResumeLink", "resumeLink") ?? "",
    Message: readString(object, "Message", "message") ?? "",
    Status: readString(object, "Status", "status") ?? "New",
    WhatsAppSent: readString(object, "WhatsAppSent", "whatsappSent") ?? "No",
  };
}

function toVacancyWithCandidates(raw: unknown): VacancyWithCandidates {
  const object = asObject(raw);
  const vacancy = toVacancy(object);
  const rawCandidates = Array.isArray(object.Candidates)
    ? object.Candidates
    : Array.isArray(object.candidates)
      ? object.candidates
      : [];
  const candidates = rawCandidates.map(toCandidate);
  return {
    ...vacancy,
    CandidateCount: readNumber(object, "CandidateCount", "candidateCount") ||
      candidates.length,
    Candidates: candidates,
  };
}

function toRecruitmentGroup(raw: unknown): RecruitmentGroup {
  const grouped = toVacancyWithCandidates(raw);
  return {
    vacancy: {
      VacancyID: grouped.VacancyID,
      Title: grouped.Title,
      Description: grouped.Description,
      Openings: grouped.Openings,
      Status: grouped.Status,
      CreatedAt: grouped.CreatedAt,
      Salary: grouped.Salary,
      JobType: grouped.JobType,
      Location: grouped.Location,
    },
    candidates: grouped.Candidates,
    candidateCount: grouped.CandidateCount || grouped.Candidates.length,
  };
}

/* -------------------------------------------------------------------------- */
/* Read actions (GET)                                                          */
/* -------------------------------------------------------------------------- */

/**
 * The grouped list payload already contains every vacancy and every candidate,
 * so detail reads are answered from it while it is still fresh instead of
 * paying for another Apps Script round trip (typically 1–4s).
 */
function peekCachedList(): Record<string, unknown>[] | null {
  try {
    const hit = readCache.get(buildUrl("getRecruitmentList", {}).toString());
    if (!hit || hit.expires <= Date.now()) return null;
    const object = asObject(hit.value);
    for (const key of ["data", "vacancies"]) {
      const value = object[key];
      if (Array.isArray(value)) {
        return value.filter(
          (item): item is Record<string, unknown> =>
            typeof item === "object" && item !== null && !Array.isArray(item),
        );
      }
    }
    return null;
  } catch {
    return null;
  }
}

function sameId(source: unknown, id: string, keys: string[]): boolean {
  const value = readString(source, ...keys);
  return value !== undefined && value.toLowerCase() === id.toLowerCase();
}

function vacancyFromCachedList(vacancyId: string): Record<string, unknown> | null {
  const list = peekCachedList();
  if (!list) return null;
  return (
    list.find((item) => sameId(item, vacancyId, ["VacancyID", "vacancyId", "id"])) ??
    null
  );
}

export const getVacancies = cache(async function getVacancies(): Promise<
  Vacancy[]
> {
  const payload = await callGet("getVacancies");
  return unwrapList(payload, ["vacancies", "data"], toVacancy);
});

export const getOpenVacancies = cache(async function getOpenVacancies(): Promise<
  Vacancy[]
> {
  const payload = await callGet("getOpenVacancies");
  return unwrapList(payload, ["vacancies", "data"], toVacancy);
});

export const getVacancy = cache(async function getVacancy(
  vacancyId: string,
): Promise<Vacancy> {
  const id = vacancyId.trim();
  if (!id) {
    throw new RecruitmentApiError("Vacancy not found.", "notFound");
  }

  const fromList = vacancyFromCachedList(id);
  if (fromList) return toVacancy(fromList);

  const payload = await callGet("getVacancy", { vacancyId: id });
  return unwrapSingle(payload, ["vacancy", "data"], toVacancy);
});

export const getCandidates = cache(async function getCandidates(): Promise<
  Candidate[]
> {
  const payload = await callGet("getCandidates");
  return unwrapList(payload, ["candidates", "data"], toCandidate);
});

export const getCandidatesByVacancy = cache(
  async function getCandidatesByVacancy(vacancyId: string): Promise<Candidate[]> {
    const id = vacancyId.trim();
    if (!id) return [];

    const group = vacancyFromCachedList(id);
    if (group && Array.isArray(group.Candidates)) {
      return group.Candidates.map(toCandidate);
    }

    const payload = await callGet("getCandidatesByVacancy", { vacancyId: id });
    return unwrapList(payload, ["candidates", "data"], toCandidate);
  },
);

export const getCandidate = cache(async function getCandidate(
  candidateId: string,
): Promise<Candidate> {
  const id = candidateId.trim();
  if (!id) {
    throw new RecruitmentApiError("Candidate not found.", "notFound");
  }

  const cachedList = peekCachedList();
  if (cachedList) {
    for (const vacancy of cachedList) {
      const rawCandidates = vacancy.Candidates;
      if (!Array.isArray(rawCandidates)) continue;
      const match = rawCandidates.find((item) =>
        sameId(item, id, ["CandidateID", "candidateId", "id"]),
      );
      if (match) return toCandidate(match);
    }
  }

  const payload = await callGet("getCandidate", { candidateId: id });
  return unwrapSingle(payload, ["candidate", "data"], toCandidate);
});

export const getRecruitmentList = cache(async function getRecruitmentList(): Promise<
  RecruitmentGroup[]
> {
  const payload = await callGet("getRecruitmentList");
  return unwrapList(payload, ["data", "vacancies"], toRecruitmentGroup);
});

export const getApiVersion = cache(async function getApiVersion(): Promise<string> {
  const payload = await callGet("version");
  const object = asObject(payload);
  return readString(object, "version") ?? "unknown";
});

/* -------------------------------------------------------------------------- */
/* Write actions (POST)                                                        */
/* -------------------------------------------------------------------------- */

export interface AddVacancyInput {
  title: string;
  description?: string;
  openings: number;
  salary?: string;
  jobType?: string;
  location?: string;
}

export interface AddVacancyResult {
  vacancyId?: string;
  message: string;
}

export interface ApplyCandidateInput {
  vacancyId: string;
  fullName: string;
  phone: string;
  email: string;
  experience?: string;
  resumeLink?: string;
  message?: string;
}

export interface ApplyCandidateResult {
  candidateId?: string;
  message: string;
}

export interface StatusUpdateInput {
  candidateId: string;
  status: string;
}

export interface WhatsAppUpdateInput {
  candidateId: string;
  whatsappSent: string;
}

export interface SimpleUpdateResult {
  message: string;
}

function extractId(
  response: Record<string, unknown>,
  keys: string[],
): string | undefined {
  return (
    readString(response, ...keys) ??
    readString(response.candidate, ...keys) ??
    readString(response.vacancy, ...keys) ??
    readString(response.data, ...keys) ??
    readString(response.result, ...keys)
  );
}

export async function addVacancy(
  input: AddVacancyInput,
): Promise<AddVacancyResult> {
  const response = await callPost({
    action: "addVacancy",
    title: input.title,
    description: input.description ?? "",
    openings: input.openings,
    salary: input.salary ?? "",
    jobType: input.jobType ?? "",
    location: input.location ?? "",
  });

  return {
    vacancyId: extractId(response, ["vacancyId", "VacancyID", "id"]),
    message:
      readString(response, "message") ?? "Vacancy created successfully.",
  };
}

export async function applyCandidate(
  input: ApplyCandidateInput,
): Promise<ApplyCandidateResult> {
  const response = await callPost({
    action: "applyCandidate",
    vacancyId: input.vacancyId,
    fullName: input.fullName,
    phone: input.phone,
    email: input.email,
    experience: input.experience ?? "",
    resumeLink: input.resumeLink ?? "",
    message: input.message ?? "",
  });

  return {
    candidateId: extractId(response, ["candidateId", "CandidateID", "id"]),
    message: readString(response, "message") ?? "Application submitted.",
  };
}

export async function updateCandidateStatus(
  input: StatusUpdateInput,
): Promise<SimpleUpdateResult> {
  const response = await callPost({
    action: "updateCandidateStatus",
    candidateId: input.candidateId,
    status: input.status,
  });
  return { message: readString(response, "message") ?? "Status updated." };
}

export async function updateWhatsAppStatus(
  input: WhatsAppUpdateInput,
): Promise<SimpleUpdateResult> {
  const response = await callPost({
    action: "updateWhatsAppStatus",
    candidateId: input.candidateId,
    whatsappSent: input.whatsappSent,
  });
  return {
    message: readString(response, "message") ?? "WhatsApp status updated.",
  };
}
