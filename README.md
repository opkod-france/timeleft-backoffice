# Timeleft Back-Office

Internal back-office dashboard for the Timeleft operations team to manage and monitor events.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/login`. Demo credentials: `admin@timeleft.com` / `timeleft2025`

## Tech Stack

Next.js 16 (App Router) · shadcn/ui · TanStack Table v8 · TanStack Query v5 · nuqs · React Hook Form · Tailwind CSS v4 · Phosphor Icons · date-fns

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Redirects to `/login` |
| `/login` | Authentication (demo credentials) |
| `/events` | Events dashboard (protected) |

## Features

- **Statistics cards** — Total, Upcoming, Live, Past counts + average fill rate
- **Sortable table** — Date, Booked, Status columns with asc/desc toggle
- **Filters** — Status dropdown, type multi-select, date range picker, text search
- **Pagination** — Configurable page size (10/20/50)
- **Event detail sheet** — Side panel on row click, deep-linkable via URL
- **URL sync** — All table state in URL params — bookmarkable, shareable, refresh-safe
- **Dark mode** — Solarized-inspired theme with cross-tab sync

## Project Structure

```
src/
├── app/                    # Pages & layouts
│   ├── login/              # Login page
│   └── events/             # Events dashboard
├── features/events/        # Domain logic (types, api, helpers, components)
├── components/             # Shared components (header, auth guard, ui primitives)
├── providers/              # ThemeProvider, QueryProvider
└── lib/                    # Utilities (cn)
```

## Key Decisions

- **URL as single source of truth** — Every table state is a search param via `nuqs`
- **Client-side filtering** — Static CDN data, all filtering/sorting/pagination in browser
- **Sheet over modal** — Event details in side panel to keep table visible
- **Feature-scoped directory** — All event code co-located under `src/features/events/`

## Deployment

Docker + GitHub Actions → GHCR → Dokploy. See [ARCHITECTURE.md](./ARCHITECTURE.md) for details.

## Detailed Documentation

See [ARCHITECTURE.md](./ARCHITECTURE.md) for full architecture, data flow diagrams, state management breakdown, component tree, and data model.
