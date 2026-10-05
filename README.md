# Havitive website (Next.js + Supabase)

The Havitive Infra Pvt Ltd website, rebuilt from the original Laravel app.

- **Next.js 16 (App Router)**: pages are rendered on the server and cached for SEO and speed.
- **Supabase**: Postgres database, admin login (Supabase Auth) and image/file storage.
- **Original theme**: the same Bootstrap/jQuery theme, served from `public/frontend`.
- **Ask Havi**: an AI chat assistant (Claude) that answers visitor questions using the site's own content.

## Run locally

```bash
cp .env.example .env.local   # then fill in the values
npm install
npm run dev                  # http://localhost:3000
```

## Environment variables

| Name | What it is |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable (anon) key |
| `NEXT_PUBLIC_SITE_URL` | Public site address, e.g. `https://havitive.com` (used in canonical URLs, sitemap, structured data) |
| `ANTHROPIC_API_KEY` | Claude API key for the chat assistant. Without it the chat replies with the phone number instead |

## Project layout

| Path | Contents |
| --- | --- |
| `app/(site)` | Public pages: home, about, sectors, projects, services, team, blog, careers, contact |
| `app/admin` | Admin panel at `/admin` (sign in with a Supabase user listed in `public.admins`) |
| `app/api/chat` | Streaming chat endpoint used by the "Ask Havi" widget |
| `lib/data.ts` | All public data queries |
| `lib/admin/resources.ts` | The admin's editable sections and their fields |
| `lib/chat/` | The assistant's instructions and the knowledge base built from Supabase |
| `supabase/migrations` | Database schema, row-level security and storage buckets |
| `scripts/mysql_to_pg.py` | Converts the old phpMyAdmin MySQL dump into Postgres inserts |

## Images

- Images uploaded through the admin are stored in the Supabase Storage bucket `upload` and saved in the database as `storage:<path>`.
- Images from the old Laravel site are served from `public/upload/...`, under the same paths the database already uses. Files missing from this folder show a placeholder. Copy them from the old hosting's `public/upload` folder, or re-upload them in the admin.
- CVs and cover letters go to the private `applications` bucket. Admins download them through short-lived links.

## SEO

- A title, description and canonical URL on every page, plus Open Graph tags
- `sitemap.xml` and `robots.txt`, generated from the database
- JSON-LD structured data: Organization, BreadcrumbList, BlogPosting, Service, Person, JobPosting
- Readable URLs (`/project/kottarakkara-municipality-office-complex-5`). Old Laravel URLs permanently redirect to the new ones

## Admin users

To give someone admin access, create the user in Supabase (Authentication → Users), then run:

```sql
insert into public.admins (user_id)
select id from auth.users where email = 'person@example.com';
```

Turn off public sign-ups in Supabase (Authentication → Sign In / Providers → "Allow new users to sign up").
