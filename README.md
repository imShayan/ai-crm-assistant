# AI CRM Assistant

AI CRM Assistant is a customer relationship management dashboard for tracking
customers and their notes. It also provides customer-level summaries and
follow-up recommendations based on the customer's notes.

## Features

- Sign up, sign in, and sign out
- View customer counts by total, active, and pending status
- Search customers by name, email, or company
- Add, edit, and delete customers
- View a customer's notes and activity timeline
- Add notes to a customer
- Generate and save a customer summary
- Generate and save a customer follow-up recommendation

## Technology

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS
- Lucide React icons
- Supabase Auth
- Supabase PostgreSQL
- `@supabase/ssr` for browser and server Supabase clients

## Architecture

The application follows this high-level request flow:

```text
React pages/components
        |
        v
Client hooks and service functions
        |
        v
Next.js App Router API routes
        |
        v
Database service layer
        |
        v
Supabase PostgreSQL and Supabase Auth
```

The main dashboard is implemented in `src/app/page.tsx`. Reusable UI is in
`src/components`, client-side state and request orchestration are in
`src/hooks`, and service functions are in `src/lib/services`.

## API routes

| Route | Purpose |
| --- | --- |
| `/api/customers` | List, create, update, and delete customers |
| `/api/notes` | List and create customer notes |
| `/api/summary` | Read and generate customer summaries |
| `/api/recommendation` | Read and generate customer recommendations |

## CRM data model

The application reads and writes these Supabase tables:

- `customers`: customer name, email, company, status, and owning user
- `customer_notes`: notes associated with a customer and user
- `customer_summaries`: saved customer summaries
- `customer_recommendations`: saved follow-up recommendations

The database access code is in:

- `src/lib/services/customer-db-service.ts`
- `src/lib/services/note-db-service.ts`
- `src/lib/services/summary-db-service.ts`
- `src/lib/services/recommendations-db-service.ts`

The `user_id` field is used by the customer list query to scope customers to
the authenticated user. API routes that create records also attach the
authenticated user's ID. Authentication is implemented through Supabase Auth,
with browser and server helpers in `src/lib/supabase`.

## Local development

### Prerequisites

- Node.js
- npm
- A Supabase project with the application tables available

Create a local `.env.local` file containing the Supabase project values used by
the application:

```text
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
GROQ_API_KEY=your-groq-server-side-api-key
# Optional; defaults to openai/gpt-oss-20b
GROQ_MODEL=openai/gpt-oss-20b
```

`GROQ_API_KEY` must remain server-side. The browser calls the application's
summary API route; it never calls Groq directly.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Available scripts:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Current engineering status

- Supabase configuration and the baseline CRM schema are managed in
  `supabase/config.toml` and `supabase/migrations`.
- Applying the baseline migration recreates the CRM tables, constraints, indexes,
  and RLS policies from an empty database. Existing disposable data must be
  cleared before applying it to the current project.
- Customer summary generation calls Groq's OpenAI-compatible API from the
  server, sends bounded authorized customer context, requests strict JSON
  Schema output, validates it with Zod, and persists only validated summaries.
- Recommendations still return fixed placeholder text from
  `src/lib/services/ai-service.ts`; recommendation AI is intentionally out of
  scope for the first real AI workflow.
- Automated tests cover API authorization/failure behavior and the summary
  provider adapter. Tests mock the provider and never make external LLM calls.
- There is no queue, background worker, scheduled job, or caching layer.
- Error handling is basic: API routes return JSON status responses, while
  several client and database service paths log errors or show browser alerts.
- Authentication checks remain present in the dashboard and API routes, while
  database ownership is enforced by the RLS policies in the baseline migration.
- Generated Supabase database types are intentionally not included yet; they
  should be generated after the baseline schema is applied and confirmed.
