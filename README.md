# Guidance Office Visit Log

Paperless check-in at records para sa guidance office. Next.js (App Router) + Supabase + Tailwind.

- `/` — kiosk form para sa estudyante (Name, Student Number, Grade/Year, Section/Course, Purpose, detalye). Walang login.
- `/login` — login ng guidance staff.
- `/admin` — dashboard (bisita ngayon / linggo / buwan, breakdown per purpose).
- `/admin/visits` — listahan na may search, filters, pagination, **Export CSV**.
- `/admin/visits/[id]` — detalye, counselor notes, status (Waiting → In session → Done); ang "Done" ay nagre-record ng time-out.
- `/admin/students/[number]` — lahat ng visits ng isang student number.

## Setup

1. Gumawa ng project sa [supabase.com](https://supabase.com).
2. Sa **SQL Editor**, i-run ang laman ng `supabase/migrations/0001_init.sql`, tapos ang `0002_outcome_status.sql` (outcome, no-show, follow-up date, session timing), at `0003_staff_only_update.sql` (staff lang ang makaka-edit).
3. **Authentication → Users → Add user** (email + password) para sa unang staff. Kopyahin ang user id.
4. I-run sa SQL Editor:
   ```sql
   insert into public.profiles (id, full_name, role)
   values ('<user id>', 'Pangalan ng Staff', 'admin');
   ```
5. **Authentication → Sign In / Providers → Email**: i-**disable ang "Allow new users to sign up"** para staff lang ang may account.
6. Kopyahin ang `.env.local.example` papuntang `.env.local` at ilagay ang **Project URL** at **anon/publishable key** (Project Settings → API).
7. ```bash
   npm install
   npm run dev
   ```
   Buksan ang http://localhost:3000.

## Admin vs Staff (Counselor)

| | Counselor | Admin |
|---|---|---|
| Dashboard, listahan, detalye, history, CSV export | ✅ | ✅ |
| Mag-edit ng status / outcome / notes (I-edit modal) | ✅ | ❌ |
| Mag-delete ng visit | ❌ | ✅ |

Ang role ay galing sa `profiles.role`. Naka-enforce din ito sa database (RLS), hindi lang sa screen.

## Seguridad

- Ang kiosk (anonymous) ay **INSERT lang** ang pwede sa `visits` (Row Level Security). Hindi nito mababasa ang records.
- Staff lang (nasa `profiles`) ang makakabasa/makaka-update; admin lang ang makaka-delete.
- Huwag gamitin ang `service_role` key sa app na ito.
- Honeypot field ang proteksyon laban sa bots. Kung kailangan ng mas mahigpit na rate limit, ilagay sa hosting/CDN level.

## Notes

- Oras: Asia/Manila (`lib/constants.ts`).
- Next.js 16: ang `middleware` ay `proxy.ts` na ngayon.
