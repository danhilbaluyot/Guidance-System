"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { FOLLOW_UP_OUTCOMES, OUTCOME_VALUES, STATUS_VALUES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

const updateSchema = z
  .object({
    id: z.uuid(),
    status: z.enum(STATUS_VALUES),
    counselor_notes: z.string().max(5000).optional(),
    outcome: z.enum(OUTCOME_VALUES).optional(),
    follow_up_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })
  .refine((v) => v.status !== "done" || !!v.outcome, {
    path: ["outcome"],
    message: "Pumili ng outcome bago i-mark na Done.",
  });

export type UpdateState = { ok?: boolean; error?: string };

const text = (v: FormDataEntryValue | null) => String(v ?? "").trim() || undefined;

export async function updateVisit(_prev: UpdateState, formData: FormData): Promise<UpdateState> {
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    counselor_notes: text(formData.get("counselor_notes")),
    outcome: text(formData.get("outcome")),
    follow_up_date: text(formData.get("follow_up_date")),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Hindi valid ang data." };

  // Only staff (counselors) edit status/outcome. Admins can view and delete, not edit.
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Hindi ka naka-login." };
  if (profile.role !== "counselor") return { error: "Staff (counselor) lang ang pwedeng mag-edit." };

  const supabase = await createClient();
  const { id, status, counselor_notes, outcome, follow_up_date } = parsed.data;
  const { data: current, error: readError } = await supabase
    .from("visits")
    .select("time_out, session_started_at")
    .eq("id", id)
    .maybeSingle();
  // Surface the real database error (e.g. a missing column when a migration has not been run).
  if (readError) return { error: readError.message };
  if (!current) return { error: "Hindi nahanap ang record." };

  const now = new Date().toISOString();
  const isDone = status === "done";
  const patch: Record<string, unknown> = {
    status,
    counselor_notes: counselor_notes ?? null,
    handled_by: profile.id,
    // Outcome only applies to finished visits; follow-up date only to outcomes that need one.
    outcome: isDone ? outcome : null,
    follow_up_date: isDone && outcome && FOLLOW_UP_OUTCOMES.includes(outcome) ? (follow_up_date ?? null) : null,
    // Set once, the first time the session starts; never overwritten by later saves.
    session_started_at: current.session_started_at ?? (status === "in_session" ? now : null),
    // Done / no-show record time-out (kept if already set); reopening clears it.
    time_out: isDone || status === "no_show" ? (current.time_out ?? now) : null,
  };

  const { data: updated, error } = await supabase.from("visits").update(patch).eq("id", id).select("id");
  if (error) return { error: error.message };
  if (!updated?.length) return { error: "Hindi na-save ang pagbabago." };

  revalidatePath(`/admin/visits/${id}`);
  revalidatePath("/admin/visits");
  return { ok: true };
}

export async function deleteVisit(_prev: UpdateState, formData: FormData): Promise<UpdateState> {
  const parsed = z.uuid().safeParse(formData.get("id"));
  if (!parsed.success) return { error: "Hindi valid ang data." };

  // Admin only. RLS ("admin delete visits") enforces this again in the database.
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") return { error: "Admin lang ang pwedeng mag-delete." };

  const supabase = await createClient();
  const { data, error } = await supabase.from("visits").delete().eq("id", parsed.data).select("id");
  if (error) return { error: error.message };
  // RLS silently filters rows instead of erroring, so check that something was deleted.
  if (!data?.length) return { error: "Hindi nabura ang record." };

  revalidatePath("/admin/visits");
  redirect("/admin/visits");
}
