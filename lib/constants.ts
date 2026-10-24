export const PURPOSES = [
  { value: "counseling", label: "Counseling" },
  { value: "referral", label: "Referral" },
  { value: "consultation", label: "Consultation" },
  { value: "career_guidance", label: "Career guidance" },
  { value: "document_request", label: "Document request (e.g. Good Moral)" },
  { value: "excuse_slip", label: "Excuse / absence slip" },
  { value: "complaint_report", label: "Bullying / complaint report" },
  { value: "scholarship_assistance", label: "Scholarship / assistance" },
  { value: "others", label: "Others" },
] as const;

export type PurposeValue = (typeof PURPOSES)[number]["value"];

export const PURPOSE_VALUES = PURPOSES.map((p) => p.value) as [
  PurposeValue,
  ...PurposeValue[],
];

export const PURPOSE_LABELS: Record<string, string> = Object.fromEntries(
  PURPOSES.map((p) => [p.value, p.label]),
);

export const STATUSES = [
  { value: "waiting", label: "Waiting" },
  { value: "in_session", label: "In session" },
  { value: "done", label: "Done" },
  { value: "no_show", label: "Umalis / No show" },
] as const;

export type StatusValue = (typeof STATUSES)[number]["value"];

export const STATUS_VALUES = STATUSES.map((s) => s.value) as [StatusValue, ...StatusValue[]];

export const STATUS_LABELS: Record<string, string> = Object.fromEntries(
  STATUSES.map((s) => [s.value, s.label]),
);

export const OUTCOMES = [
  { value: "resolved", label: "Resolved" },
  { value: "needs_follow_up", label: "Needs follow-up" },
  { value: "referred", label: "Referred (nurse / principal / external)" },
  { value: "parent_conference", label: "Parent conference needed" },
] as const;

export type OutcomeValue = (typeof OUTCOMES)[number]["value"];

export const OUTCOME_VALUES = OUTCOMES.map((o) => o.value) as [OutcomeValue, ...OutcomeValue[]];

export const OUTCOME_LABELS: Record<string, string> = Object.fromEntries(
  OUTCOMES.map((o) => [o.value, o.label]),
);

/** Outcomes that come with a follow-up date. */
export const FOLLOW_UP_OUTCOMES: readonly string[] = ["needs_follow_up", "parent_conference"];

export const APP_TIME_ZONE = "Asia/Manila";

export type Visit = {
  id: string;
  student_name: string;
  student_number: string;
  grade_level: string;
  section: string;
  purpose: PurposeValue;
  purpose_other: string | null;
  details: string | null;
  status: StatusValue;
  counselor_notes: string | null;
  outcome: OutcomeValue | null;
  follow_up_date: string | null;
  session_started_at: string | null;
  time_in: string;
  time_out: string | null;
  handled_by: string | null;
};
