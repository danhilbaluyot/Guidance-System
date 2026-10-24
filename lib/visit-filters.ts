import { OUTCOME_VALUES, PURPOSE_VALUES, STATUSES } from "./constants";

export type VisitFilters = {
  q?: string;
  purpose?: string;
  status?: string;
  outcome?: string;
  grade?: string;
  from?: string; // YYYY-MM-DD (Manila)
  to?: string; // YYYY-MM-DD (Manila), inclusive
};

type Raw = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
const isDate = (v?: string) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

export function parseFilters(raw: Raw): VisitFilters {
  const purpose = one(raw.purpose);
  const status = one(raw.status);
  const outcome = one(raw.outcome);
  const from = one(raw.from);
  const to = one(raw.to);
  return {
    q: one(raw.q),
    purpose: purpose && (PURPOSE_VALUES as string[]).includes(purpose) ? purpose : undefined,
    status: status && STATUSES.some((s) => s.value === status) ? status : undefined,
    outcome: outcome && (OUTCOME_VALUES as string[]).includes(outcome) ? outcome : undefined,
    grade: one(raw.grade),
    from: isDate(from) ? from : undefined,
    to: isDate(to) ? to : undefined,
  };
}

// Loose structural type for the PostgREST filter builder; its real generic type is too deep for tsc.
type AnyBuilder = {
  or(filters: string): AnyBuilder;
  eq(column: string, value: string): AnyBuilder;
  ilike(column: string, pattern: string): AnyBuilder;
  gte(column: string, value: string): AnyBuilder;
  lt(column: string, value: string): AnyBuilder;
};

/** Strip characters that have meaning in PostgREST filter strings / LIKE patterns. */
function safeTerm(s: string) {
  return s.replace(/[,()%_\\*]/g, " ").trim();
}

export function applyFilters<T>(query: T, f: VisitFilters): T {
  let q = query as unknown as AnyBuilder;
  if (f.q) {
    const term = safeTerm(f.q);
    if (term) q = q.or(`student_name.ilike.%${term}%,student_number.ilike.%${term}%`);
  }
  if (f.purpose) q = q.eq("purpose", f.purpose);
  if (f.status) q = q.eq("status", f.status);
  if (f.outcome) q = q.eq("outcome", f.outcome);
  if (f.grade) q = q.ilike("grade_level", `%${safeTerm(f.grade)}%`);
  if (f.from) q = q.gte("time_in", new Date(`${f.from}T00:00:00+08:00`).toISOString());
  if (f.to) {
    const end = new Date(`${f.to}T00:00:00+08:00`);
    end.setUTCDate(end.getUTCDate() + 1);
    q = q.lt("time_in", end.toISOString());
  }
  return q as unknown as T;
}
