"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { FOLLOW_UP_OUTCOMES, OUTCOME_VALUES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export type QueueActionState = { ok?: boolean; error?: string };

export async function startSession(
  _prev: QueueActionState,
  formData: FormData,
): Promise<QueueActionState> {
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { error: "Hindi valid ang data." };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Hindi ka naka-login." };
  if (profile.role !== "counselor") return { error: "Counselor lang ang pwedeng mag-start ng session." };

  const supabase = await createClient();
  const { data: current, error: readError } = await supabase
    .from("visits")
    .select("status")
    .eq("id", id.data)
    .maybeSingle();
  if (readError) return { error: readError.message };
  if (!current) return { error: "Hindi nahanap ang record." };
  if (current.status !== "waiting") return { error: "Nasa session na o tapos na ang estudyanteng ito." };

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("visits")
    .update({ status: "in_session", session_started_at: now, handled_by: profile.id })
    .eq("id", id.data);
  if (error) return { error: error.message };

  revalidatePath("/admin/queue");
  revalidatePath("/admin/visits");
  revalidatePath("/admin");
  return { ok: true };
}

export async function markDone(
  _prev: QueueActionState,
  formData: FormData,
): Promise<QueueActionState> {
  const parsed = z
    .object({
      id: z.uuid(),
      outcome: z.enum(OUTCOME_VALUES),
      counselor_notes: z.string().max(5000).optional(),
      follow_up_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    })
    .safeParse({
      id: formData.get("id"),
      outcome: formData.get("outcome"),
      counselor_notes: String(formData.get("counselor_notes") ?? "").trim() || undefined,
      follow_up_date: String(formData.get("follow_up_date") ?? "").trim() || undefined,
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Hindi valid ang data." };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Hindi ka naka-login." };
  if (profile.role !== "counselor") return { error: "Counselor lang ang pwedeng mag-update." };

  const supabase = await createClient();
  const { data: current, error: readError } = await supabase
    .from("visits")
    .select("status")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (readError) return { error: readError.message };
  if (!current) return { error: "Hindi nahanap ang record." };
  if (current.status === "done" || current.status === "no_show") {
    return { error: "Tapos na ang visit na ito." };
  }

  const { outcome, counselor_notes, follow_up_date } = parsed.data;
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("visits")
    .update({
      status: "done",
      outcome,
      counselor_notes: counselor_notes ?? null,
      follow_up_date: FOLLOW_UP_OUTCOMES.includes(outcome) ? (follow_up_date ?? null) : null,
      time_out: now,
      handled_by: profile.id,
    })
    .eq("id", parsed.data.id);
  if (error) return { error: error.message };

  revalidatePath("/admin/queue");
  revalidatePath("/admin/visits");
  revalidatePath("/admin");
  return { ok: true };
}

export async function markNoShow(
  _prev: QueueActionState,
  formData: FormData,
): Promise<QueueActionState> {
  const id = z.uuid().safeParse(formData.get("id"));
  if (!id.success) return { error: "Hindi valid ang data." };

  const profile = await getCurrentProfile();
  if (!profile) return { error: "Hindi ka naka-login." };
  if (profile.role !== "counselor") return { error: "Counselor lang ang pwedeng mag-update." };

  const supabase = await createClient();
  const { data: current, error: readError } = await supabase
    .from("visits")
    .select("status")
    .eq("id", id.data)
    .maybeSingle();
  if (readError) return { error: readError.message };
  if (!current) return { error: "Hindi nahanap ang record." };
  if (current.status === "done" || current.status === "no_show") {
    return { error: "Tapos na ang visit na ito." };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("visits")
    .update({ status: "no_show", time_out: now, handled_by: profile.id })
    .eq("id", id.data);
  if (error) return { error: error.message };

  revalidatePath("/admin/queue");
  revalidatePath("/admin/visits");
  revalidatePath("/admin");
  return { ok: true };
}
