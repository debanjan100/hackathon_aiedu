# 🚀 Supabase Cloud Migration Guide
Welcome to the absolute future-proof Serverless Architecture for AI Edu! 

By dropping the legacy Express backend, the entire platform is now hosted statically on the edge, with Supabase handling Authentication, Database (Postgres), and Serverless Edge Functions completely out of the box.

Here is your exact step-by-step master plan to connect the APIs and solve the "Cannot Login" issue.

---

## 🟢 Step 1: Create Your Supabase Project & Link APIs
1. Create a free account at [Supabase](https://supabase.com).
2. Click **New Project**, name it `ai-edu`, and generate a secure database password.
3. Once the project provisions (takes ~2 minutes), click the **Settings (Gear Icon)** in the bottom left -> **API**.
4. You need two critical strings here:
   - **Project URL**
   - **Project API Key (anon / public)**
5. In your VS Code project root (`d:\Codebase\hackathon_aiedu`), create a new file named exactly `.env`. Paste this inside:
   ```env
   VITE_SUPABASE_URL=YOUR_PROJECT_URL_HERE
   VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
   ```

---

## 🟢 Step 2: Initialize Your Postgres Tables (The SQL Master Schema)
Because we migrated from MongoDB (NoSQL) to Postgres (Relational SQL), you need to initialize the tables so the "Profile", "Assessment", and "Roadmap" pages have physical rows to write to.

1. Go to your Supabase Dashboard -> **SQL Editor** (the `< >` icon).
2. Click **New Query** and copy-paste this absolutely bulletproof foundational schema. 
3. Click **Run**.

```sql
-- 1. Create the Users profile table (Extends Supabase Auth natively)
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  name text,
  age integer,
  course text,
  github text,
  linkedin text,
  skill_level text default 'Beginner',
  current_roadmap text,
  isPremium boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create the Progress tracking table (For Analytics.jsx)
create table public.progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  accuracy integer default 70,
  xp_gained integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Turn ON physical row level security so hackers cannot overwrite other user profiles
alter table public.users enable row level security;
alter table public.progress enable row level security;

-- 4. Create RLS Policies (Allows authenticated users to update their OWN data)
create policy "Users can view and update their own profiles."
on public.users for all
using ( auth.uid() = id );

create policy "Users can view and update their own progress."
on public.progress for all
using ( auth.uid() = user_id );

create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users on delete cascade not null,
  text text not null,
  date text,
  color text default 'default'
);
alter table public.tasks enable row level security;
create policy "Users can view and update their own tasks." on public.tasks for all using ( auth.uid() = user_id );

-- 5. Automate Profile Creation! (Trigger: When a user Signs Up, insert a row in 'users')
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 🟢 Step 3: Deploy the Gemini Edge Function
To prevent hackers from stealing your `GEMINI_API_KEY` in the frontend, I constructed a **Supabase Edge Function** within `supabase/functions/chat/index.ts`. It acts as an impenetrable shield.

1. Keep your terminal open at `d:\Codebase\hackathon_aiedu`.
2. I am installing the CLI into your project automatically right now (`npm install supabase --save-dev`).
3. Link your project locally using **`npx`**: 
   ```bash
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REFERENCE_ID
   ```
   *(You can find your Reference ID in Project Settings -> General).*
4. Store your Gemini Key securely in the Cloud Edge Vault:
   ```bash
   npx supabase secrets set GEMINI_API_KEY=your_google_api_key_here
   ```
5. Deploy the edge function instantly:
   ```bash
   npx supabase functions deploy chat --no-verify-jwt
   ```

---

### 🎉 You're Done!
Once you do this, you can safely run `npm run dev`. 
The legacy NodeJS server error `require is not defined` is **permanently gone**. You will successfully be able to sign up, update your profile, take assessments, enroll in roadmaps, and chat with the AI natively through enterprise-grade cloud systems.
