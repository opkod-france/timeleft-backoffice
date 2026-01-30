# Timeleft Back-Office — Event List

Internal back-office application for the Timeleft operations team to manage and monitor events.

## Running the project

```bash
npm install
npm run dev
```

Open [http://localhost:3000/events](http://localhost:3000/events) — the root `/` redirects there automatically.

## Tech choices

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Framework | **Next.js 16** (App Router) | Standard at Timeleft; server components for layout, client components for interactive table |
| UI Components | **shadcn/ui** | Composable Radix primitives with Tailwind — no runtime cost, full control over markup |
| Data Table | **TanStack Table v8** | Headless, type-safe table logic (sorting, pagination) that decouples behavior from rendering |
| Data Fetching | **TanStack Query v5** | Client-side cache with stale-while-revalidate, loading/error states, background refetch |
| URL State | **nuqs** | Type-safe search param management for Next.js App Router — every table state is a URL param |
| Date Formatting | **date-fns** | Tree-shakeable, functional date utilities |

## Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout with QueryProvider + NuqsAdapter
│   ├── page.tsx             # Redirects / → /events
│   └── events/
│       └── page.tsx         # Events page (server component shell)
├── features/events/
│   ├── types.ts             # TimeleftEvent, Zone, City, Country, EventStatus
│   ├── api.ts               # useEvents() — TanStack Query hook
│   ├── helpers.ts           # fillRate, statusLabel, STATUS_OPTIONS
│   ├── search-params.ts     # nuqs parser definitions for URL state
│   └── components/
│       ├── event-stats.tsx           # Statistics cards (total, upcoming, live, past)
│       ├── event-table.tsx           # Main table orchestrator
│       ├── event-table-columns.tsx   # TanStack Table column definitions
│       ├── event-table-toolbar.tsx   # Search input + status filter
│       ├── event-table-pagination.tsx # Page controls + page size selector
│       └── event-detail-sheet.tsx    # Side panel for event details
├── components/ui/           # shadcn/ui primitives
├── providers/
│   └── query-provider.tsx   # TanStack Query client provider
└── lib/utils.ts             # cn() utility
```

## Key decisions

**URL as single source of truth** — Page number, sort column/direction, status filter, search query, and selected event ID are all stored in URL search params via `nuqs`. This means every table state is bookmarkable and shareable. Refreshing the page restores the exact view.

**Client-side filtering** — The API returns a static JSON file from a CDN, so all filtering, sorting, and pagination happen in the browser. TanStack Table handles sorting and pagination; filtering is done via `useMemo` on the raw data before passing it to the table.

**Sheet over modal** — Event details open in a side panel (sheet) rather than a centered modal. This keeps the table visible for context — critical for ops workflows where you're scanning through events.

**Feature-scoped directory** — All event-related code lives under `src/features/events/` to co-locate types, hooks, helpers, and components. Shared UI primitives stay in `src/components/ui/`.

## Features

- **Statistics dashboard** — Four cards showing Total / Upcoming / Live / Past counts
- **Sortable columns** — Date, Booked (fill rate), and Status columns toggle asc/desc on click
- **Status filter** — Dropdown to filter by upcoming, live, or past
- **Text search** — Filters across event type, city, country, and zone name
- **Pagination** — Configurable page size (10/20/50) with first/prev/next/last navigation
- **Event detail sheet** — Click any row to open a side panel with full event details
- **URL sync** — All state reflected in URL params; shareable and refresh-safe
- **Loading skeletons** — Skeleton placeholders while data loads
- **Error handling** — Error state with retry button on fetch failure
