# Snapo Frontend

This is the Next.js 14 frontend for the Telegram-backed image hosting system.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Supabase Setup:**
   - Create a new Supabase project.
   - Run the SQL script found in `supabase/schema.sql` in the Supabase SQL editor.
   - Enable Email Authentication in Supabase Auth settings.

3. **Environment Variables:**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials (URL, Anon Key, Service Role Key).
   - Fill in your Cloudflare Worker URL and the shared `CF_WORKER_KEY`.

4. **Run Locally:**
   ```bash
   npm run dev
   ```

## Architecture

- **App Router**: Uses Next.js 14 App Router.
- **Styling**: Vanilla CSS with a custom dark-mode design system (`globals.css`).
- **Auth**: Supabase SSR (`@supabase/ssr`) with cookie-based sessions.
- **Upload Flow**: 
  - Browser → Next.js API Route (`/api/upload`) → Cloudflare Worker → Telegram.
  - The Next.js API Route saves metadata to Supabase using the Service Role Key.
- **View Flow**:
  - Browser visits `/img/[code]`
  - Next.js fetches metadata from Supabase (SSR).
  - Image tag points directly to the Cloudflare Worker URL.
