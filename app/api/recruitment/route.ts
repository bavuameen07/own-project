import { NextResponse } from "next/server";

import { isAuthenticated } from "@/lib/auth";
import {
  addVacancy,
  applyCandidate,
  clearRecruitmentCache,
  RecruitmentApiError,
  updateCandidateStatus,
  updateWhatsAppStatus,
  type AddVacancyInput,
  type ApplyCandidateInput,
} from "@/lib/recruitment-api";
import {
  hasErrors,
  isValidHttpUrl,
  validateApplyForm,
  type ApplyFormValues,
} from "@/lib/validation";
import { CANDIDATE_STATUSES } from "@/lib/types";

export const runtime = "nodejs";

/**
 * Thin server-side façade over the Google Apps Script API.
 *
 * It stores nothing itself — it exists so that the Apps Script URL and admin
 * credentials stay server-side instead of being shipped to the browser.
 * Only the four mutating actions are exposed, and everything except the public
 * application form requires an authenticated admin session.
 */

type Action =
  | "addVacancy"
  | "applyCandidate"
  | "updateCandidateStatus"
  | "updateWhatsAppStatus";

const PUBLIC_ACTIONS = new Set<Action>(["applyCandidate"]);

function badRequest(message: string): NextResponse {
  return NextResponse.json({ success: false, message }, { status: 400 });
}

/** Success response that also drops any cached reads so the change shows up. */
function mutated(data: Record<string, unknown> = {}): NextResponse {
  clearRecruitmentCache();
  return NextResponse.json(
    { success: true, ...data },
    { status: 200 },
  );
}

function readPayload(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function text(source: Record<string, unknown>, key: string, max = 5000): string {
  const value = source[key];
  if (typeof value === "string") return value.trim().slice(0, max);
  if (typeof value === "number") return String(value);
  return "";
}

function validateApply(
  data: Record<string, unknown>,
): { errors: Record<string, string>; values: ApplyFormValues } {
  const values: ApplyFormValues = {
    fullName: text(data, "fullName", 200),
    phone: text(data, "phone", 40),
    email: text(data, "email", 320),
    experience: text(data, "experience", 200),
    resumeLink: text(data, "resumeLink", 2000),
    message: text(data, "message", 4000),
  };

  const errors: Record<string, string> = {};
  if (values.resumeLink && !isValidHttpUrl(values.resumeLink)) {
    errors.resumeLink = "Resume link must start with http:// or https://";
  }
  Object.assign(errors, validateApplyForm(values));

  return { errors, values };
}

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return badRequest("Invalid request body.");
  }

  const body = readPayload(payload);
  const action = text(body, "action", 60) as Action;

  const allowed: Action[] = [
    "addVacancy",
    "applyCandidate",
    "updateCandidateStatus",
    "updateWhatsAppStatus",
  ];
  if (!allowed.includes(action)) {
    return badRequest("Unsupported action.");
  }

  if (!PUBLIC_ACTIONS.has(action) && !(await isAuthenticated())) {
    return NextResponse.json(
      { success: false, message: "You must be signed in to do that." },
      { status: 401 },
    );
  }

  try {
    switch (action) {
      case "applyCandidate": {
        const { errors, values } = validateApply(body);
        if (hasErrors(errors)) {
          return NextResponse.json(
            {
              success: false,
              message: Object.values(errors)[0],
              errors,
            },
            { status: 400 },
          );
        }

        const vacancyId = text(body, "vacancyId", 50);
        if (!vacancyId) return badRequest("Vacancy ID is required.");

        const result = await applyCandidate({
          vacancyId,
          ...values,
        } satisfies ApplyCandidateInput);

        return mutated({
          message: result.message,
          data: { candidateId: result.candidateId ?? null },
        });
      }

      case "addVacancy": {
        const title = text(body, "title", 200);
        const openingsRaw = text(body, "openings", 10);
        const openings = Number(openingsRaw);

        if (!title) return badRequest("Job title is required.");
        if (!Number.isInteger(openings) || openings < 1) {
          return badRequest("Openings must be a whole number of 1 or more.");
        }

        const result = await addVacancy({
          title,
          description: text(body, "description", 5000),
          openings,
          salary: text(body, "salary", 100),
          jobType: text(body, "jobType", 100),
          location: text(body, "location", 100),
        } satisfies AddVacancyInput);

        return mutated({
          message: result.message,
          data: { vacancyId: result.vacancyId ?? null },
        });
      }

      case "updateCandidateStatus": {
        const candidateId = text(body, "candidateId", 50);
        const status = text(body, "status", 40);
        if (!candidateId) return badRequest("Candidate ID is required.");
        if (!(CANDIDATE_STATUSES as readonly string[]).includes(status)) {
          return badRequest("Unsupported status value.");
        }

        const result = await updateCandidateStatus({ candidateId, status });
        return mutated({ message: result.message });
      }

      case "updateWhatsAppStatus": {
        const candidateId = text(body, "candidateId", 50);
        const whatsappSent = text(body, "whatsappSent", 10);
        if (!candidateId) return badRequest("Candidate ID is required.");
        if (whatsappSent !== "Yes" && whatsappSent !== "No") {
          return badRequest("Unsupported WhatsApp status value.");
        }

        const result = await updateWhatsAppStatus({
          candidateId,
          whatsappSent,
        });
        return mutated({ message: result.message });
      }

      default:
        return badRequest("Unsupported action.");
    }
  } catch (error) {
    if (error instanceof RecruitmentApiError) {
      const status =
        error.kind === "notFound"
          ? 404
          : error.kind === "config"
            ? 503
            : error.kind === "api"
              ? 422
              : 502;
      return NextResponse.json(
        { success: false, message: error.userMessage },
        { status },
      );
    }

    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
