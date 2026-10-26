"use server";

import { createClient } from "@/lib/supabase/server";
import {
  expressCheckInSchema,
  manualCheckInSchema,
} from "@/lib/validation";

export type CheckInState = {
  ok: boolean;
  notFound?: boolean;
  message?: string;
  errors?: Partial<Record<string, string>>;
  values?: Record<string, string>;
  student_name?: string;
  student_number?: string;
  grade_level?: string;
  section?: string;
  purpose?: string;
};

/**
 * Step 1: Express Check-In Action
 * Searches for the student by student_number.
 * If found, logs their visit in `visits` table and returns success.
 * If not found, notifies caller with notFound = true to redirect to Step 2.
 */
export async function submitExpressCheckIn(
  _prev: CheckInState,
  formData: FormData,
): Promise<CheckInState> {
  const values = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => typeof v === "string"),
  ) as Record<string, string>;

  // Honeypot: real students never see or fill this field. Pretend success to bots.
  if (values.website) return { ok: true };

  const parsed = expressCheckInSchema.safeParse({
    ...values,
    purpose_other: values.purpose === "others" ? values.purpose_other : undefined,
    details: values.details || undefined,
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
    return { ok: false, errors, values };
  }

  const supabase = await createClient();
  const studentNumber = parsed.data.student_number;

  // 1. Search in `students` table first
  let student: {
    student_name: string;
    student_number: string;
    grade_level: string;
    section: string;
  } | null = null;

  try {
    const { data: studentRecord } = await supabase
      .from("students")
      .select("student_name, student_number, grade_level, section")
      .eq("student_number", studentNumber)
      .maybeSingle();

    if (studentRecord) {
      student = studentRecord;
    }
  } catch (err) {
    console.warn("Could not query 'students' table directly:", err);
  }

  // 2. Fallback: Search existing `visits` table if student is not yet in `students`
  if (!student) {
    const { data: visitRecord } = await supabase
      .from("visits")
      .select("student_name, student_number, grade_level, section")
      .eq("student_number", studentNumber)
      .order("time_in", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (visitRecord) {
      student = visitRecord;
    }
  }

  // If NOT found: trigger redirect to Step 2 (Manual Registration)
  if (!student) {
    return {
      ok: false,
      notFound: true,
      message: `Hindi nahanap ang student record para sa "${studentNumber}". Mangyaring magpatuloy sa Manual Registration.`,
      values,
    };
  }

  // If FOUND: automatically record their check-in log
  const { error: insertError } = await supabase.from("visits").insert({
    student_name: student.student_name,
    student_number: student.student_number,
    grade_level: student.grade_level,
    section: student.section,
    purpose: parsed.data.purpose,
    purpose_other: parsed.data.purpose_other ?? null,
    details: parsed.data.details ?? null,
    status: "waiting",
  });

  if (insertError) {
    console.error("Express check-in insert failed:", insertError.message);
    return {
      ok: false,
      message: "May problema sa pag-save. Pakisubukan ulit o lumapit sa guidance staff.",
      values,
    };
  }

  return {
    ok: true,
    student_name: student.student_name,
    student_number: student.student_number,
    grade_level: student.grade_level,
    section: student.section,
    purpose: parsed.data.purpose,
  };
}

/**
 * Step 2: Manual Registration & Check-In Action
 * Saves new student profile in `students` table and records current visit log in `visits`.
 */
export async function submitManualCheckIn(
  _prev: CheckInState,
  formData: FormData,
): Promise<CheckInState> {
  const values = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => typeof v === "string"),
  ) as Record<string, string>;

  // Honeypot
  if (values.website) return { ok: true };

  const parsed = manualCheckInSchema.safeParse({
    ...values,
    purpose_other: values.purpose === "others" ? values.purpose_other : undefined,
    details: values.details || undefined,
  });

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] ??= issue.message;
    }
    return { ok: false, errors, values };
  }

  const supabase = await createClient();

  // 1. Save or update the student profile in `students` table
  try {
    await supabase.from("students").upsert(
      {
        student_number: parsed.data.student_number,
        student_name: parsed.data.student_name,
        grade_level: parsed.data.grade_level,
        section: parsed.data.section,
      },
      { onConflict: "student_number" },
    );
  } catch (err) {
    console.warn("students upsert skipped/failed:", err);
  }

  // 2. Record the visit log in `visits` table
  const { error: visitError } = await supabase.from("visits").insert({
    student_name: parsed.data.student_name,
    student_number: parsed.data.student_number,
    grade_level: parsed.data.grade_level,
    section: parsed.data.section,
    purpose: parsed.data.purpose,
    purpose_other: parsed.data.purpose_other ?? null,
    details: parsed.data.details ?? null,
    status: "waiting",
  });

  if (visitError) {
    console.error("Manual check-in insert failed:", visitError.message);
    return {
      ok: false,
      message: "May problema sa pag-save. Pakisubukan ulit o lumapit sa guidance staff.",
      values,
    };
  }

  return {
    ok: true,
    student_name: parsed.data.student_name,
    student_number: parsed.data.student_number,
    grade_level: parsed.data.grade_level,
    section: parsed.data.section,
    purpose: parsed.data.purpose,
  };
}

/** Legacy alias */
export const submitCheckIn = submitManualCheckIn;
