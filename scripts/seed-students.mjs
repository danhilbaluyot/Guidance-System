// Database seeder: inserts 100 mock student records into Supabase `students` table.
// Usage: npm run seed:students

import { createClient } from "@supabase/supabase-js";
import { MOCK_STUDENTS } from "./mock-students-data.mjs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Make sure .env.local has both keys.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function seed() {
  console.log(`Starting to seed ${MOCK_STUDENTS.length} students into Supabase...`);

  // Upsert in batches of 25
  const batchSize = 25;
  for (let i = 0; i < MOCK_STUDENTS.length; i += batchSize) {
    const batch = MOCK_STUDENTS.slice(i, i + batchSize);
    const { error } = await supabase
      .from("students")
      .upsert(batch, { onConflict: "student_number" });

    if (error) {
      console.error(`Batch ${Math.floor(i / batchSize) + 1} failed:`, error.message);
      if (error.code === "PGRST205" || error.message.includes("Could not find the table")) {
        console.error(
          "\nNOTE: The 'students' table does not exist in Supabase yet!\n" +
            "Please run the SQL file 'supabase/migrations/0004_create_students_table.sql' in your Supabase SQL Editor first, then rerun this script.\n",
        );
      }
      process.exit(1);
    }
    console.log(`✓ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} students)`);
  }

  console.log(`\n🎉 Successfully seeded ${MOCK_STUDENTS.length} students into Supabase!`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

