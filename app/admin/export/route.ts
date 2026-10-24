import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { OUTCOME_LABELS, PURPOSE_LABELS, STATUS_LABELS, type Visit } from "@/lib/constants";
import { formatDate, formatDateTime, formatDuration } from "@/lib/dates";
import { applyFilters, parseFilters } from "@/lib/visit-filters";

// Neutralise spreadsheet formula injection (=, +, -, @) and quote for CSV.
function cell(value: string | null | undefined): string {
  let s = value ?? "";
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const filters = parseFilters(Object.fromEntries(request.nextUrl.searchParams));
  const { data, error } = await applyFilters(supabase.from("visits").select("*"), filters)
    .order("time_in", { ascending: false })
    .limit(20000);

  if (error) return new NextResponse(error.message, { status: 500 });

  const { data: profiles } = await supabase.from("profiles").select("id, full_name");
  const staffName = new Map((profiles ?? []).map((p) => [p.id as string, p.full_name as string]));

  const header = [
    "Time in",
    "Time out",
    "Name",
    "Student number",
    "Grade/Year",
    "Section/Course",
    "Purpose",
    "Details",
    "Status",
    "Outcome",
    "Follow-up date",
    "Handled by",
    "Wait time",
    "Session length",
    "Counselor notes",
  ];
  const lines = ((data ?? []) as Visit[]).map((v) =>
    [
      formatDateTime(v.time_in),
      formatDateTime(v.time_out),
      v.student_name,
      v.student_number,
      v.grade_level,
      v.section,
      PURPOSE_LABELS[v.purpose] + (v.purpose === "others" && v.purpose_other ? `: ${v.purpose_other}` : ""),
      v.details,
      STATUS_LABELS[v.status],
      v.outcome ? OUTCOME_LABELS[v.outcome] : "",
      v.follow_up_date ? formatDate(v.follow_up_date) : "",
      v.handled_by ? (staffName.get(v.handled_by) ?? "") : "",
      formatDuration(v.time_in, v.session_started_at ?? (v.status === "no_show" ? v.time_out : null)),
      formatDuration(v.session_started_at, v.time_out),
      v.counselor_notes,
    ]
      .map(cell)
      .join(","),
  );

  // BOM so Excel opens UTF-8 correctly
  const csv = "﻿" + [header.map(cell).join(","), ...lines].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="guidance-visits-${stamp}.csv"`,
    },
  });
}
