# ResolveHub

ResolveHub is facility complaint management software for hostels, colleges, apartments, and offices. It includes a customer-facing sales website plus a working product workspace where users can file issues with location, category, priority, description, and photo proof while admins manage a live priority queue, staff assignments, SLA urgency, and resolution progress.

## Features

- Customer-facing sales website with product positioning, solutions, pricing, and lead capture
- Live complaint dashboard with operational stats
- Working sidebar navigation for Dashboard, Complaints, Analytics, Staff, and Settings
- Category, priority, and search filters across complaint views
- Searchable priority queue and full complaints workspace
- Status updates with progress tracking
- Complaint detail panel for assignment and status changes
- New complaint form with automatic staff routing and photo filename capture
- Assigned staff workload panel based on active tickets
- Analytics view with live category/status breakdowns and SLA risk
- Staff view with workload, assigned tickets, and reassignment controls
- Settings view with persistent auto-assignment, notification, SLA, and facility controls
- CSV export for complaints
- Browser-local persistence for a smooth customer presentation
- Reset workspace data action
- Responsive SaaS-style UI built with Next.js and Tailwind CSS

## File Structure

```text
resolvehub/
├─ app/
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  └─ SmartComplaintResolver.tsx
├─ .env.example
├─ eslint.config.mjs
├─ .gitignore
├─ next.config.mjs
├─ package.json
├─ postcss.config.mjs
├─ tailwind.config.ts
└─ tsconfig.json
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
cp .env.example .env.local
```

3. Start the development server:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Scripts

```bash
npm run dev        # local development
npm run build      # production build
npm run start      # run the built app
npm run lint       # Next.js lint checks
npm run typecheck  # TypeScript checks
```

## Startup Path

Good next steps for selling to real customers: add authentication, replace browser-local persistence with a database, support real image uploads, send WhatsApp or email updates, add role-based staff dashboards, connect payments, and generate monthly facility analytics for administrators.
