/**
 * Shared domain types for the recruitment platform.
 * Field names mirror the Google Sheets columns used by the Apps Script API.
 */

export interface Vacancy {
  VacancyID: string;
  Title: string;
  Description: string;
  Openings: number;
  Status: string;
  CreatedAt: string;
  Salary: string;
  JobType: string;
  Location: string;
}

export interface Candidate {
  CandidateID: string;
  VacancyID: string;
  VacancyTitle: string;
  FullName: string;
  /** Normalised to a string — the API sometimes returns phone numbers as numbers. */
  Phone: string;
  Email: string;
  Experience: string;
  ResumeLink: string;
  Message: string;
  Status: string;
  WhatsAppSent: string;
}

/** A vacancy row returned by `getRecruitmentList`, including its candidates. */
export interface VacancyWithCandidates extends Vacancy {
  CandidateCount: number;
  Candidates: Candidate[];
}

/** Normalised grouping used by admin screens. */
export interface RecruitmentGroup {
  vacancy: Vacancy;
  candidates: Candidate[];
  candidateCount: number;
}

export const CANDIDATE_STATUSES = [
  "New",
  "Shortlisted",
  "Interview",
  "Selected",
  "Rejected",
] as const;

export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];

export const WHATSAPP_STATUSES = ["Yes", "No"] as const;
export type WhatsAppStatus = (typeof WHATSAPP_STATUSES)[number];

export function isCandidateStatus(value: string): value is CandidateStatus {
  return (CANDIDATE_STATUSES as readonly string[]).includes(value);
}

export function isOpenVacancy(vacancy: Vacancy): boolean {
  return vacancy.Status.trim().toLowerCase() === "open";
}

/** Generic envelope returned by every Apps Script action. */
export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  error?: string;
  data?: T;
}
