"use server";

import { createClient } from "@/lib/supabase/server";
import { checkInSchema } from "@/lib/validation";

export type CheckInState = {
  ok: boolean;
  message?: string;
  errors?: Partial<Record<string, string>>;
  values?: Record<string, string>;
};

export async function submitCheckIn(
  _prev: CheckInState,
  formData: FormData,
): Promise<CheckInState> {
  const values = Object.fromEntries(
    [...formData.entries()].filter(([, v]) => typeof v === "string"),
  ) as Record<string, string>;

  // Honeypot: real students never see or fill this field. Pretend success to bots.
  if (values.website) return { ok: true };

  const parsed = checkInSchema.safeParse({
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
  // No .select(): the kiosk (anon) role is allowed to INSERT only, not read rows back.
  const { error } = await supabase.from("visits").insert(parsed.data);

  if (error) {
    console.error("check-in insert failed", error.message);
    return {
      ok: false,
      message: "May problema sa pag-save. Pakisubukan ulit o lumapit sa guidance staff.",
      values,
    };
  }

  return { ok: true };
}
