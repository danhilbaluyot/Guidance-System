-- Migration: Create students table with RLS and seed 100 mock student records

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
  ('2021-08-00101', 'Juan Dela Cruz', '4th Year', 'BSIT 4A'),
  ('2021-08-00102', 'Maria Clara Santos', '4th Year', 'BSIT 4A'),
  ('2021-08-00103', 'Joshua Miguel Reyes', '4th Year', 'BSIT 4B'),
  ('2021-08-00104', 'Bea Nicole Garcia', '4th Year', 'BSIT 4B'),
  ('2021-08-00105', 'Mark Anthony Mendoza', '4th Year', 'BSCS 4A'),
  ('2021-08-00106', 'Princess Mae Ramos', '4th Year', 'BSCS 4A'),
  ('2021-08-00107', 'Christian Dave Bautista', '4th Year', 'BSBA 4A'),
  ('2021-08-00108', 'Angelica Aquino', '4th Year', 'BSBA 4A'),
  ('2021-08-00109', 'John Paul Gonzales', '4th Year', 'BSED 4A'),
  ('2021-08-00110', 'Christine Joy Villanueva', '4th Year', 'BSED 4A'),
  ('2021-08-00111', 'Daniel Castro', '4th Year', 'BSIT 4A'),
  ('2021-08-00112', 'Alyssa Marie Fernandez', '4th Year', 'BSIT 4B'),
  ('2021-08-00113', 'Kenneth Lopez', '4th Year', 'BSCS 4A'),
  ('2021-08-00114', 'Nicole Shane Tolentino', '4th Year', 'BSBA 4A'),
  ('2021-08-00115', 'Carl Angelo Pascual', '4th Year', 'BSED 4A'),
  ('2021-08-00116', 'Patricia Corpuz', '4th Year', 'BSIT 4A'),
  ('2021-08-00117', 'Angelo Navarro', '4th Year', 'BSIT 4B'),
  ('2021-08-00118', 'Jasmine Salazar', '4th Year', 'BSCS 4A'),
  ('2021-08-00119', 'Kevin Mercado', '4th Year', 'BSBA 4A'),
  ('2021-08-00120', 'Kimberly De Leon', '4th Year', 'BSED 4A'),
  ('2021-08-00121', 'Paolo Manuel Soriano', '4th Year', 'BSIT 4A'),
  ('2021-08-00122', 'Hannah Grace Lim', '4th Year', 'BSIT 4B'),
  ('2021-08-00123', 'Patrick James Tan', '4th Year', 'BSCS 4A'),
  ('2021-08-00124', 'Roxanne Dizon', '4th Year', 'BSBA 4A'),
  ('2021-08-00125', 'Dominic Ocampo', '4th Year', 'BSED 4A'),
  ('2022-07-00201', 'Gabriel Alcantara', '3rd Year', 'BSIT 3A'),
  ('2022-07-00202', 'Camille Joy Pineda', '3rd Year', 'BSIT 3A'),
  ('2022-07-00203', 'Adrian Kyle Morales', '3rd Year', 'BSIT 3B'),
  ('2022-07-00204', 'Kaye Ann Valenzuela', '3rd Year', 'BSIT 3B'),
  ('2022-07-00205', 'Nathaniel James Cruz', '3rd Year', 'BSCS 3A'),
  ('2022-07-00206', 'Ella Mae Domingo', '3rd Year', 'BSCS 3A'),
  ('2022-07-00207', 'Marco Antonio David', '3rd Year', 'BSBA 3A'),
  ('2022-07-00208', 'Stephanie Rose Gutierrez', '3rd Year', 'BSBA 3B'),
  ('2022-07-00209', 'Jericho Salvador', '3rd Year', 'BSED 3A'),
  ('2022-07-00210', 'Danielle Cortez', '3rd Year', 'BSED 3B'),
  ('2022-07-00211', 'Vince Christian Aguilar', '3rd Year', 'BSIT 3A'),
  ('2022-07-00212', 'Mariel San Jose', '3rd Year', 'BSIT 3B'),
  ('2022-07-00213', 'Ethan Joshua Miranda', '3rd Year', 'BSCS 3A'),
  ('2022-07-00214', 'Bianca Alexis Rivera', '3rd Year', 'BSBA 3A'),
  ('2022-07-00215', 'Justin Ryan Manalo', '3rd Year', 'BSED 3A'),
  ('2022-07-00216', 'Chloe Sofia Fabian', '3rd Year', 'BSIT 3A'),
  ('2022-07-00217', 'Rafael Lorenzo Palma', '3rd Year', 'BSIT 3B'),
  ('2022-07-00218', 'Sophia Isabel Serrano', '3rd Year', 'BSCS 3A'),
  ('2022-07-00219', 'Kurt Russell Mariano', '3rd Year', 'BSBA 3B'),
  ('2022-07-00220', 'Samantha Gail Lozano', '3rd Year', 'BSED 3B'),
  ('2022-07-00221', 'Lander Jake Beltran', '3rd Year', 'BSIT 3A'),
  ('2022-07-00222', 'Trisha Denise Robles', '3rd Year', 'BSIT 3B'),
  ('2022-07-00223', 'Francis Xavier Chua', '3rd Year', 'BSCS 3A'),
  ('2022-07-00224', 'Janelle Marie Sy', '3rd Year', 'BSBA 3A'),
  ('2022-07-00225', 'Bryan Keith Ong', '3rd Year', 'BSED 3A'),
  ('2023-07-00675', 'Danhil Baluyor', '2nd Year', 'BSIT 2A'),
  ('2023-07-00301', 'Kyle Matthew Bernardo', '2nd Year', 'BSIT 2A'),
  ('2023-07-00302', 'Andrea Nicole Perez', '2nd Year', 'BSIT 2A'),
  ('2023-07-00303', 'Sean Patrick Del Rosario', '2nd Year', 'BSIT 2B'),
  ('2023-07-00304', 'Shaira May Calderon', '2nd Year', 'BSIT 2B'),
  ('2023-07-00305', 'Lance Andrei Feliciano', '2nd Year', 'BSCS 2A'),
  ('2023-07-00306', 'Katrina Gail Espino', '2nd Year', 'BSCS 2A'),
  ('2023-07-00307', 'Jared Neil Macaraeg', '2nd Year', 'BSBA 2A'),
  ('2023-07-00308', 'Regine Joyce Cariño', '2nd Year', 'BSBA 2B'),
  ('2023-07-00309', 'Darren Jay Ilagan', '2nd Year', 'BSED 2A'),
  ('2023-07-00310', 'Celine Beatriz Oria', '2nd Year', 'BSED 2B'),
  ('2023-07-00311', 'Kobe Bryant Valdez', '2nd Year', 'BSIT 2A'),
  ('2023-07-00312', 'Gillian Rose Samson', '2nd Year', 'BSIT 2B'),
  ('2023-07-00313', 'Miggy Luis Coronel', '2nd Year', 'BSCS 2A'),
  ('2023-07-00314', 'Erika Jane Mallari', '2nd Year', 'BSBA 2A'),
  ('2023-07-00315', 'Denzel Washington Cruz', '2nd Year', 'BSED 2A'),
  ('2023-07-00316', 'Micaela Joy Bathan', '2nd Year', 'BSIT 2A'),
  ('2023-07-00317', 'Jomer Clark Punzalan', '2nd Year', 'BSIT 2B'),
  ('2023-07-00318', 'Fiona Denise Arceo', '2nd Year', 'BSCS 2A'),
  ('2023-07-00319', 'Rico Blanco Laurel', '2nd Year', 'BSBA 2B'),
  ('2023-07-00320', 'Kyla Jean Quinto', '2nd Year', 'BSED 2B'),
  ('2023-07-00321', 'Alfonso Miguel Real', '2nd Year', 'BSIT 2A'),
  ('2023-07-00322', 'Denise Aubrey Legaspi', '2nd Year', 'BSIT 2B'),
  ('2023-07-00323', 'Vincent Troy Gatus', '2nd Year', 'BSCS 2A'),
  ('2023-07-00324', 'Lorraine Kate Dionisio', '2nd Year', 'BSBA 2A'),
  ('2024-06-00401', 'Liam Alexander Tan', '1st Year', 'BSIT 1A'),
  ('2024-06-00402', 'Zoe Elizabeth Co', '1st Year', 'BSIT 1A'),
  ('2024-06-00403', 'Lucas Gabriel Dy', '1st Year', 'BSIT 1B'),
  ('2024-06-00404', 'Hannah Beatrice Yao', '1st Year', 'BSIT 1B'),
  ('2024-06-00405', 'Ethan Matthew Dee', '1st Year', 'BSCS 1A'),
  ('2024-06-00406', 'Mia Isabelle Ang', '1st Year', 'BSCS 1A'),
  ('2024-06-00407', 'Noah Benjamin Lim', '1st Year', 'BSBA 1A'),
  ('2024-06-00408', 'Aria Danielle Go', '1st Year', 'BSBA 1B'),
  ('2024-06-00409', 'Oliver James Sy', '1st Year', 'BSED 1A'),
  ('2024-06-00410', 'Stella Marie Chua', '1st Year', 'BSED 1B'),
  ('2024-06-00411', 'Leo Sebastian Tiu', '1st Year', 'BSIT 1A'),
  ('2024-06-00412', 'Ava Charlotte Uy', '1st Year', 'BSIT 1B'),
  ('2024-06-00413', 'Mason Caleb Ching', '1st Year', 'BSCS 1A'),
  ('2024-06-00414', 'Luna Penelope Siy', '1st Year', 'BSBA 1A'),
  ('2024-06-00415', 'Elijah David Yap', '1st Year', 'BSED 1A'),
  ('2024-06-00416', 'Maya Gabrielle Ngo', '1st Year', 'BSIT 1A'),
  ('2024-06-00417', 'Logan Xavier Cua', '1st Year', 'BSIT 1B'),
  ('2024-06-00418', 'Ivy Alessandra See', '1st Year', 'BSCS 1A'),
  ('2024-06-00419', 'Jackson Hunter Po', '1st Year', 'BSBA 1B'),
  ('2024-06-00420', 'Hazel Victoria Sy', '1st Year', 'BSED 1B'),
  ('2024-06-00421', 'Asher Julian Tan', '1st Year', 'BSIT 1A'),
  ('2024-06-00422', 'Elena Rose Yu', '1st Year', 'BSIT 1B'),
  ('2024-06-00423', 'Sebastian Cole Tee', '1st Year', 'BSCS 1A'),
  ('2024-06-00424', 'Nora Grace Lim', '1st Year', 'BSBA 1A'),
  ('2024-06-00425', 'Theodore Max Ong', '1st Year', 'BSED 1A')
on conflict (student_number) do update set
  student_name = excluded.student_name,
  grade_level = excluded.grade_level,
  section = excluded.section,
  updated_at = now();
