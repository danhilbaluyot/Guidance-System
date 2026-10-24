import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type StaffProfile = {
  id: string;
  full_name: string;
  role: "counselor" | "admin";
};

/** The logged-in staff member's profile, or null if not logged in / not listed in `profiles`. */
export const getCurrentProfile = cache(async (): Promise<StaffProfile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  return (data as StaffProfile | null) ?? null;
});
