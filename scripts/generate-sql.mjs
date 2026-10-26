import { MOCK_STUDENTS } from "./mock-students-data.mjs";
import fs from "node:fs/promises";

async function generate() {
  const values = MOCK_STUDENTS.map(
    (s) =>
      `  ('${s.student_number}', '${s.student_name.replace(/'/g, "''")}', '${s.grade_level}', '${s.section}')`,
  ).join(",\n");

  const sql = `-- Migration: Create students table with RLS and seed 100 mock student records

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  student_number text unique not null,
  student_name text not null check (char_length(student_name) between 2 and 120),
  grade_level text not null check (char_length(grade_level) between 1 and 40),
  section text not null check (char_length(section) between 1 and 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_student_number_idx on public.students (student_number);

-- Enable RLS
alter table public.students enable row level security;

-- Policies:
-- 1. Kiosk & staff can search students by student_number
create policy "anyone can read students" on public.students
  for select to anon, authenticated
  using (true);

-- 2. Kiosk can register new student profiles (insert)
create policy "anyone can insert students" on public.students
  for insert to anon, authenticated
  with check (true);

-- 3. Staff can update student profiles
create policy "staff can update students" on public.students
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- Insert 100 Mock Student Records
insert into public.students (student_number, student_name, grade_level, section)
values
${values}
on conflict (student_number) do update set
  student_name = excluded.student_name,
  grade_level = excluded.grade_level,
  section = excluded.section,
  updated_at = now();
`;

  await fs.writeFile("supabase/migrations/0004_create_students_table.sql", sql, "utf8");
  console.log("Successfully wrote supabase/migrations/0004_create_students_table.sql");

  // Also generate MySQL offline export equivalent
  const mysqlValues = MOCK_STUDENTS.map(
    (s) =>
      `INSERT INTO \`students\` (\`student_number\`, \`student_name\`, \`grade_level\`, \`section\`) VALUES ('${s.student_number}', '${s.student_name.replace(/'/g, "\\'")}', '${s.grade_level}', '${s.section}');`,
  ).join("\n");

  const mysqlTable = `
-- Table structure for \`students\`
DROP TABLE IF EXISTS \`students\`;
CREATE TABLE \`students\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`student_number\` VARCHAR(30) NOT NULL UNIQUE,
  \`student_name\` VARCHAR(120) NOT NULL,
  \`grade_level\` VARCHAR(40) NOT NULL,
  \`section\` VARCHAR(60) NOT NULL,
  \`created_at\` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_students_number\` (\`student_number\`)
) ENGINE=InnoDB;

-- 100 Mock Student Records
${mysqlValues}
`;

  await fs.writeFile("exports/students_offline_seed.sql", mysqlTable, "utf8");
  console.log("Successfully wrote exports/students_offline_seed.sql");
}

generate().catch(console.error);

