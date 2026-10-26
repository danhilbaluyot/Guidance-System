// Automatically runs an SQL file directly into Supabase without copy-pasting.
// Usage: node --env-file=.env.local scripts/run-sql.mjs [path-to-sql-file]
// Example: npm run db:push

import fs from "node:fs/promises";
import path from "node:path";

const sqlFile = process.argv[2] || "supabase/migrations/0004_create_students_table.sql";

// 1. Get Supabase Project Ref from NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const projectRef = SUPABASE_URL.replace("https://", "").split(".")[0];

// 2. Get Supabase Access Token (Personal Access Token from https://supabase.com/dashboard/account/tokens)
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

async function run() {
  const filePath = path.resolve(process.cwd(), sqlFile);
  console.log(`Reading SQL file: ${filePath}`);

  let sqlContent;
  try {
    sqlContent = await fs.readFile(filePath, "utf8");
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    process.exit(1);
  }

  if (!accessToken) {
    console.error("\n=======================================================");
    console.error("❌ MISSING: SUPABASE_ACCESS_TOKEN in .env.local");
    console.error("=======================================================");
    console.error(
      "Para ma-run ko nang kusa ang SQL diretso sa Supabase nang hindi nagka-copy paste sa browser:\n\n" +
        "1. Pumunta sa: https://supabase.com/dashboard/account/tokens\n" +
        "2. I-click ang 'Generate new token' (pangalanan hal. 'Auto Migration')\n" +
        "3. Kopyahin ang token (nagsisimula sa 'sbp_...')\n" +
        "4. Ilagay sa .env.local:\n" +
        "   SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxx\n\n" +
        "Pagkatapos, patakbuhin muli ang: npm run db:push\n",
    );
    process.exit(1);
  }

  if (!projectRef) {
    console.error("❌ Could not determine project ref from NEXT_PUBLIC_SUPABASE_URL.");
    process.exit(1);
  }

  console.log(`\nConnecting to Supabase Management API for project: ${projectRef}...`);

  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: sqlContent }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error(`\n❌ Failed to execute SQL (Status ${response.status}):\n${errText}`);
      process.exit(1);
    }

    const result = await response.json();
    console.log("\n=======================================================");
    console.log("🎉 SUCCESS! SQL file executed directly into Supabase!");
    console.log("=======================================================");
    if (result && Array.isArray(result)) {
      console.log(`Executed query successfully. Rows returned: ${result.length}`);
    }
  } catch (err) {
    console.error("Network / API error executing SQL:", err.message);
    process.exit(1);
  }
}

run();

