// One-off export: pulls all rows from Supabase (profiles, visits, students) and writes a
// MySQL-compatible .sql dump to exports/guidance_offline.sql for offline
// browsing in phpMyAdmin under XAMPP. Does not touch the live app or its data.
//
// Usage: npm run export:mysql
// Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (service role bypasses RLS,
// which is needed here since the anon key can only INSERT visits, never SELECT).

import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase dashboard > Project Settings > API > service_role key).",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

async function fetchAll(table, orderBy) {
  const rows = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(orderBy, { ascending: true })
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`Fetching ${table} failed: ${error.message}`);
    rows.push(...data);
    if (data.length < pageSize) break;
  }
  return rows;
}

function sqlString(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function sqlDateTime(value) {
  if (!value) return "NULL";
  const d = new Date(value);
  const pad = (n) => String(n).padStart(2, "0");
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  return `'${date} ${time}'`;
}

function sqlDate(value) {
  if (!value) return "NULL";
  return `'${value}'`; // date columns already come back as YYYY-MM-DD
}

function insertStatement(table, columns, row) {
  const values = columns.map((col) => row[col.name]).map((v, i) =>
    columns[i].type === "datetime"
      ? sqlDateTime(v)
      : columns[i].type === "date"
        ? sqlDate(v)
        : sqlString(v),
  );
  return `INSERT INTO \`${table}\` (${columns.map((c) => `\`${c.name}\``).join(", ")}) VALUES (${values.join(", ")});`;
}

const PROFILES_COLUMNS = [
  { name: "id", type: "string" },
  { name: "full_name", type: "string" },
  { name: "role", type: "string" },
  { name: "created_at", type: "datetime" },
];

const STUDENTS_COLUMNS = [
  { name: "student_number", type: "string" },
  { name: "student_name", type: "string" },
  { name: "grade_level", type: "string" },
  { name: "section", type: "string" },
  { name: "created_at", type: "datetime" },
];

const VISITS_COLUMNS = [
  { name: "id", type: "string" },
  { name: "student_name", type: "string" },
  { name: "student_number", type: "string" },
  { name: "grade_level", type: "string" },
  { name: "section", type: "string" },
  { name: "purpose", type: "string" },
  { name: "purpose_other", type: "string" },
  { name: "details", type: "string" },
  { name: "status", type: "string" },
  { name: "counselor_notes", type: "string" },
  { name: "time_in", type: "datetime" },
  { name: "time_out", type: "datetime" },
  { name: "handled_by", type: "string" },
  { name: "outcome", type: "string" },
  { name: "follow_up_date", type: "date" },
  { name: "session_started_at", type: "datetime" },
];

const SCHEMA_SQL = `
CREATE DATABASE IF NOT EXISTS \`guidance_offline\` DEFAULT CHARACTER SET utf8mb4;
USE \`guidance_offline\`;

DROP TABLE IF EXISTS \`visits\`;
DROP TABLE IF EXISTS \`students\`;
DROP TABLE IF EXISTS \`profiles\`;

CREATE TABLE \`profiles\` (
  \`id\` CHAR(36) NOT NULL PRIMARY KEY,
  \`full_name\` VARCHAR(255) NOT NULL,
  \`role\` VARCHAR(20) NOT NULL DEFAULT 'counselor',
  \`created_at\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE \`students\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`student_number\` VARCHAR(30) NOT NULL UNIQUE,
  \`student_name\` VARCHAR(120) NOT NULL,
  \`grade_level\` VARCHAR(40) NOT NULL,
  \`section\` VARCHAR(60) NOT NULL,
  \`created_at\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_students_number\` (\`student_number\`)
) ENGINE=InnoDB;

CREATE TABLE \`visits\` (
  \`id\` CHAR(36) NOT NULL PRIMARY KEY,
  \`student_name\` VARCHAR(120) NOT NULL,
  \`student_number\` VARCHAR(30) NOT NULL,
  \`grade_level\` VARCHAR(40) NOT NULL,
  \`section\` VARCHAR(60) NOT NULL,
  \`purpose\` VARCHAR(30) NOT NULL,
  \`purpose_other\` VARCHAR(120) NULL,
  \`details\` TEXT NULL,
  \`status\` VARCHAR(20) NOT NULL DEFAULT 'waiting',
  \`counselor_notes\` TEXT NULL,
  \`time_in\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  \`time_out\` DATETIME NULL,
  \`handled_by\` CHAR(36) NULL,
  \`outcome\` VARCHAR(30) NULL,
  \`follow_up_date\` DATE NULL,
  \`session_started_at\` DATETIME NULL,
  INDEX \`idx_visits_time_in\` (\`time_in\` DESC),
  INDEX \`idx_visits_student_number\` (\`student_number\`)
) ENGINE=InnoDB;
`.trim();

async function main() {
  console.log("Fetching profiles, visits, and students from Supabase...");
  let profiles = [];
  let visits = [];
  let students = [];

  try {
    profiles = await fetchAll("profiles", "created_at");
  } catch (e) {
    console.warn("Could not fetch profiles:", e.message);
  }

  try {
    visits = await fetchAll("visits", "time_in");
  } catch (e) {
    console.warn("Could not fetch visits:", e.message);
  }

  try {
    students = await fetchAll("students", "created_at");
  } catch (e) {
    console.warn("Could not fetch students (table may not exist yet in Supabase):", e.message);
  }

  const lines = [
    "-- Offline export of the Guidance app's Supabase data.",
    "-- Generated for local browsing in phpMyAdmin (XAMPP). Import via phpMyAdmin > Import.",
    `-- Generated at: ${new Date().toISOString()}`,
    "",
    SCHEMA_SQL,
    "",
    `-- profiles (${profiles.length} rows)`,
    ...profiles.map((row) => insertStatement("profiles", PROFILES_COLUMNS, row)),
    "",
    `-- students (${students.length} rows)`,
    ...students.map((row) => insertStatement("students", STUDENTS_COLUMNS, row)),
    "",
    `-- visits (${visits.length} rows)`,
    ...visits.map((row) => insertStatement("visits", VISITS_COLUMNS, row)),
    "",
  ];

  const outDir = path.join(process.cwd(), "exports");
  const outFile = path.join(outDir, "guidance_offline.sql");
  await mkdir(outDir, { recursive: true });
  await writeFile(outFile, lines.join("\n"), "utf8");

  console.log(
    `Done. Wrote ${profiles.length} profiles, ${students.length} students, and ${visits.length} visits to:`,
  );
  console.log(outFile);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
