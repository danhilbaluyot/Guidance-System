import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Keep-alive route: Pings the Supabase database to prevent 7-day inactivity pause
export async function GET(request: Request) {
  // Optional security: verify CRON_SECRET if configured in Vercel environment
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    // Query 1 row to wake up / record activity on Supabase database
    const { count, error } = await supabase
      .from("visits")
      .select("id", { count: "exact", head: true });

    if (error) {
      console.error("Keep-alive ping error:", error.message);
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Supabase database kept alive successfully!",
      timestamp: new Date().toISOString(),
      totalVisitsRecorded: count,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Keep-alive unexpected error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

