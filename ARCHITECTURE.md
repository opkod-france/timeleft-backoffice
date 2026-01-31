# Architecture

Detailed technical documentation for the Timeleft Back-Office application.

---

## Table of Contents

- [Provider Hierarchy](#provider-hierarchy)
- [Directory Structure](#directory-structure)
- [Routing & Authentication](#routing--authentication)
- [Data Flow](#data-flow)
  - [Fetch → Filter → Render Pipeline](#fetch--filter--render-pipeline)
  - [URL State](#url-state)
  - [Data Model](#data-model)
- [State Management](#state-management)
- [Component Architecture](#component-architecture)
- [Features Breakdown](#features-breakdown)
- [Key Decisions](#key-decisions)
- [Deployment](#deployment)
  - [Overview](#overview)
  - [Files](#files)
  - [CI Pipeline — GitHub Actions](#ci-pipeline--github-actions)
  - [Docker Build — Multi-Stage](#docker-build--multi-stage)
  - [Infrastructure — Dokploy](#infrastructure--dokploy)
  - [Required Secrets](#required-secrets)
  - [Manual Deployment](#manual-deployment)
  - [Local Docker Build](#local-docker-build)

---

## Provider Hierarchy

The root layout (`app/layout.tsx`) wraps the entire app in three nested providers. An inline `<script>` in `<head>` applies the theme before React hydrates to prevent flash of wrong theme.

```
<html>
  └─ ThemeProvider ─────────── light / dark / system (localStorage + cross-tab sync)
       └─ QueryProvider ────── TanStack Query client (5 min staleTime, 1 retry)
            └─ NuqsAdapter ─── URL search param binding for Next.js App Router
                 └─ Pages
```

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with ThemeProvider + QueryProvider + NuqsAdapter
│   ├── page.tsx                # Redirects / → /login
│   ├── globals.css             # Tailwind config, CSS variables, custom animations
│   ├── login/
│   │   └── page.tsx            # Login page (client component)
│   └── events/
│       └── page.tsx            # Events dashboard (wrapped in ProtectedRoute)
├── features/events/
│   ├── types.ts                # TimeleftEvent, Zone, City, Country, EventStatus, EventCategory
│   ├── api.ts                  # useEvents() — TanStack Query hook fetching from CDN
│   ├── helpers.ts              # fillRate(), statusLabel, statusConfig, categoryConfig
│   ├── search-params.ts        # nuqs parser definitions for all URL state
│   └── components/
│       ├── event-stats.tsx             # Statistics cards (Total, Upcoming, Live, Past)
│       ├── event-table.tsx             # Main table orchestrator — fetching, filtering, rendering
│       ├── event-table-columns.tsx     # TanStack Table column definitions
│       ├── event-table-toolbar.tsx     # Search input + status filter + date range + type filter
│       ├── event-table-pagination.tsx  # Page controls + page size selector
│       └── event-detail-sheet.tsx      # Side panel for event details
├── components/
│   ├── app-header.tsx          # Top navigation bar (logo, theme toggle, logout)
│   ├── protected-route.tsx     # Auth guard — redirects to /login if not authenticated
│   ├── theme-toggle.tsx        # Dark/light mode toggle button
│   └── ui/                     # shadcn/ui primitives (badge, button, card, table, sheet, etc.)
├── providers/
│   ├── query-provider.tsx      # TanStack Query client configuration
│   └── theme-provider.tsx      # Theme context with localStorage persistence + cross-tab sync
└── lib/
    └── utils.ts                # cn() — clsx + tailwind-merge utility
```

---

## Routing & Authentication

| Route | Component | Type | Purpose |
|-------|-----------|------|---------|
| `/` | `Home` | Server | `redirect("/login")` |
| `/login` | `LoginPage` | Client | Static demo login (hardcoded credentials) |
| `/events` | `EventsPage` | Client | Events dashboard wrapped in `ProtectedRoute` |

Authentication is static — credentials are hardcoded client-side and validated against a `localStorage` flag (`timeleft-auth = "1"`). `ProtectedRoute` checks this flag on mount and redirects to `/login` if absent. There is no user database; this exists for demo consistency. Production would use a proper auth provider (OAuth, JWT, etc.).

**Demo credentials:** `admin@timeleft.com` / `timeleft2025`

---

## Data Flow

### Fetch → Filter → Render Pipeline

```mermaid
flowchart TD
    CDN["Timeleft CDN<br/><code>events.json</code>"]
    RQ["useEvents()<br/><i>TanStack Query</i><br/>staleTime: 5 min"]
    MEMO["useMemo — Single-Pass Filter<br/><i>status · search · dateRange · types</i>"]
    TT["useReactTable<br/><i>TanStack Table</i><br/>sorting + pagination"]
    URL["URL Search Params<br/><i>nuqs</i>"]

    STATS["EventStats<br/><i>Total · Upcoming · Live · Past</i>"]
    TOOLBAR["EventTableToolbar<br/><i>search · filters</i>"]
    TABLE["EventTable<br/><i>sortable rows</i>"]
    PAGINATION["EventTablePagination<br/><i>page controls</i>"]
    SHEET["EventDetailSheet<br/><i>side panel</i>"]

    CDN -->|fetch| RQ
    RQ -->|"TimeleftEvent[]"| MEMO
    URL -->|"filter params"| MEMO
    MEMO -->|"filtered data"| TT
    URL -->|"sort + page params"| TT

    RQ -->|"raw events"| STATS
    TT --> TABLE
    TT --> PAGINATION
    URL --> TOOLBAR
    URL -->|"event param"| SHEET
    RQ -->|"raw events"| SHEET

    style CDN fill:#6366f1,color:#fff
    style RQ fill:#0ea5e9,color:#fff
    style MEMO fill:#f59e0b,color:#fff
    style TT fill:#10b981,color:#fff
    style URL fill:#ef4444,color:#fff
```

**Key points:**
- The CDN returns a static JSON file — all filtering, sorting, and pagination happen client-side
- Filtering uses a **single `for...of` loop** with early `continue` (no chained `.filter()`)
- Type filtering uses a `Set` for O(1) lookup instead of `Array.includes()`
- `EventStats` receives raw (unfiltered) events to show overall counts
- `EventDetailSheet` looks up events by ID via a `Map` (O(1) vs `.find()`)

### URL State

Every piece of table state is persisted as a URL search parameter via `nuqs`. This means every view is **bookmarkable**, **shareable**, and **refresh-safe**.

| Param | Default | Controlled by |
|-------|---------|---------------|
| `page` | `1` | Pagination controls |
| `perPage` | `20` | Page size selector |
| `sort` | `"date"` | Table header clicks |
| `order` | `"asc"` | Table header clicks |
| `status` | `""` | Status dropdown |
| `search` | `""` | Search input |
| `dateFrom` | `null` | Date range picker |
| `dateTo` | `null` | Date range picker |
| `types` | `[]` | Type filter |
| `event` | `""` | Row click → detail sheet |

### Data Model

```mermaid
classDiagram
    class TimeleftEvent {
        +string id
        +string type
        +string date
        +Zone zone
        +number booked
        +number capacity
        +EventStatus status
    }
    class Zone {
        +number id
        +string name
        +City city
    }
    class City {
        +number id
        +string name
        +Country country
    }
    class Country {
        +number id
        +string name
    }

    TimeleftEvent --> Zone
    Zone --> City
    City --> Country

    class EventStatus {
        <<enumeration>>
        upcoming
        live
        past
    }
    class EventCategory {
        <<enumeration>>
        dinner
        drink
        run
    }

    TimeleftEvent ..> EventStatus
    TimeleftEvent ..> EventCategory
```

---

## State Management

The app uses a layered state management approach — each layer owns a specific concern.

| Layer | Technology | What it manages |
|-------|-----------|----------------|
| Server state | TanStack Query | Remote data cache, background refetch, loading/error states |
| URL state | nuqs | Page, sort, order, status, search, dateFrom, dateTo, types, selected event |
| Client state | React useState | Password visibility, form submission state |
| Context state | ThemeProvider | Light/dark/system theme with `localStorage` persistence |
| Auth state | localStorage | Static demo flag (`timeleft-auth`) — no user database |

---

## Component Architecture

```mermaid
graph TD
    EP["EventsPage<br/><i>ProtectedRoute wrapper</i>"]
    AH["AppHeader<br/><i>logo · theme toggle · logout</i>"]
    ET["EventTable<br/><i>data fetching · filtering · orchestration</i>"]

    ES["EventStats<br/><i>React.memo</i><br/>4 stat cards"]
    ETB["EventTableToolbar<br/><i>search · status · date · types</i>"]
    TBL["Table<br/><i>TanStack Table + shadcn/ui</i>"]
    ETP["EventTablePagination<br/><i>page controls</i>"]
    EDS["EventDetailSheet<br/><i>React.memo</i><br/>side panel"]

    EP --> AH
    EP --> ET
    ET --> ES
    ET --> ETB
    ET --> TBL
    ET --> ETP
    ET --> EDS

    TBL -->|"row click"| EDS

    style EP fill:#6b7280,color:#fff
    style ET fill:#10b981,color:#fff
    style ES fill:#0ea5e9,color:#fff
    style EDS fill:#8b5cf6,color:#fff
```

`EventTable` is the central orchestrator: it owns the TanStack Query hook, manages filtering via `useMemo`, configures the TanStack Table instance, and delegates rendering to child components.

---

## Features Breakdown

### Login Page

- Email + password form with validation (React Hook Form)
- Demo credentials auto-fill button
- Password visibility toggle
- Theme toggle (top-right corner)
- Animated entrance (`animate-fade-up`)

### Events Dashboard

- **Statistics cards** — Total, Upcoming, Live (with pulsing dot), Past counts + average fill rate
- **Sortable columns** — Date, Booked (fill rate), Status toggle asc/desc on header click
- **Status filter** — Dropdown to filter by upcoming, live, or past
- **Type filter** — Multi-select for dinner, drink, run (with category icons + colors)
- **Date range picker** — Calendar-based from/to date filtering
- **Text search** — Filters across event type, city, country, and zone name
- **Pagination** — Configurable page size (10/20/50) with first/prev/next/last navigation
- **Loading skeletons** — Skeleton placeholders while data loads
- **Error state** — Error display with retry button on fetch failure
- **Empty state** — Message when no events match filters

### Event Detail Sheet

- Opens as a **side panel** (sheet) when clicking a table row
- Displays full event details: type, date, location, capacity, fill rate, status
- Event ID stored in URL (`?event=...`) — deep-linkable
- Uses O(1) `Map` lookup by event ID

---

## Key Decisions

**URL as single source of truth** — Page number, sort column/direction, status filter, search query, date range, type filter, and selected event ID are all stored in URL search params via `nuqs`. Every table state is bookmarkable and shareable.

**Client-side filtering** — The API returns a static JSON file from a CDN, so all filtering, sorting, and pagination happen in the browser. TanStack Table handles sorting and pagination; filtering is done via `useMemo` on the raw data before passing it to the table.

**Sheet over modal** — Event details open in a side panel (sheet) rather than a centered modal. This keeps the table visible for context — critical for ops workflows where you're scanning through events.

**Feature-scoped directory** — All event-related code lives under `src/features/events/` to co-locate types, hooks, helpers, and components. Shared UI primitives stay in `src/components/ui/`.

**No backend API** — The app fetches from a static CDN endpoint (`cdn.timeleft.com`). TanStack Query handles caching (5-minute `staleTime`), error states, and background refetch.

---

## Deployment

### Overview

Every push to `main` triggers a fully automated pipeline: build a Docker image, push it to GitHub Container Registry, and deploy to the production server via a Dokploy webhook.

```mermaid
flowchart LR
    PUSH["Push to main"]
    GA["GitHub Actions"]
    DOCKER["Docker Build<br/><i>multi-stage</i>"]
    GHCR["GHCR<br/><i>ghcr.io/opkod-france/timeleft-backoffice</i>"]
    WEBHOOK["Dokploy Webhook"]
    DEPLOY["timeleft.opkod.dev"]

    PUSH --> GA --> DOCKER --> GHCR --> WEBHOOK --> DEPLOY

    style PUSH fill:#6b7280,color:#fff
    style GA fill:#8b5cf6,color:#fff
    style GHCR fill:#0ea5e9,color:#fff
    style DEPLOY fill:#10b981,color:#fff
```

**Live URL:** `https://timeleft.opkod.dev`
**Container registry:** `ghcr.io/opkod-france/timeleft-backoffice`
**Infrastructure:** Dokploy at `https://infra.opkod.dev`

### Files

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | CI pipeline — build, push image, trigger deploy |
| `Dockerfile` | Multi-stage production build |
| `.dockerignore` | Excludes node_modules, .next, .env, .git from Docker context |
| `next.config.ts` | `output: "standalone"` — enables self-contained server.js |

### CI Pipeline — GitHub Actions

**Trigger:** Push to `main` or manual dispatch (`workflow_dispatch`).

**Steps:**

1. **Checkout** — `actions/checkout@v4`
2. **Setup Buildx** — `docker/setup-buildx-action@v3` for build caching
3. **Login to GHCR** — Authenticates with `GITHUB_TOKEN` (automatic, no manual secret needed)
4. **Extract metadata** — `docker/metadata-action@v5` generates image tags:
   - Branch name (e.g., `main`)
   - Short commit SHA (e.g., `a1b2c3d`)
   - `latest`
5. **Build & push** — `docker/build-push-action@v5` builds the multi-stage Dockerfile and pushes to GHCR. Uses GitHub Actions cache (`type=gha`) for layer reuse across builds.
6. **Trigger Dokploy** — On success, sends a `POST` to the Dokploy webhook URL. Dokploy pulls the new `latest` image and restarts the container.

**Permissions:** The workflow only needs `contents: read` and `packages: write`.

### Docker Build — Multi-Stage

The Dockerfile uses three stages to minimize the final image size:

```
┌──────────────────────────────────────────┐
│  Stage 1: deps                           │
│  node:22-alpine                          │
│  npm ci --legacy-peer-deps               │
│  → node_modules/                         │
├──────────────────────────────────────────┤
│  Stage 2: builder                        │
│  Copies node_modules from deps           │
│  npm run build                           │
│  → .next/standalone/ + .next/static/     │
├──────────────────────────────────────────┤
│  Stage 3: runner                         │
│  node:22-alpine (clean)                  │
│  Copies only standalone + static + public│
│  Non-root user (nextjs:nodejs, UID 1001) │
│  CMD ["node", "server.js"]               │
└──────────────────────────────────────────┘
```

**Why three stages:**
- **deps** — Installs dependencies once. If `package.json` hasn't changed, Docker caches this entire layer.
- **builder** — Runs `next build`. The `output: "standalone"` config produces a self-contained `server.js` that bundles only the Node.js modules each page actually needs (~50 MB vs ~300+ MB with full node_modules).
- **runner** — Copies only `standalone/`, `static/`, and `public/` into a clean Alpine image. No build tools, no source code, no dev dependencies in production.

**Security:** The final stage creates a non-root `nextjs` user (UID 1001) and runs the process under that user.

**Runtime config:**

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_ENV` | `production` | Enables Next.js production optimizations |
| `NEXT_TELEMETRY_DISABLED` | `1` | Disables Next.js telemetry |
| `HOSTNAME` | `0.0.0.0` | Binds to all interfaces (required inside containers) |
| `PORT` | `3000` | Application port |

### Infrastructure — Dokploy

Dokploy (`https://infra.opkod.dev`) orchestrates container deployment on the production server. The app is configured as a Docker-based application that:

1. Pulls from `ghcr.io/opkod-france/timeleft-backoffice:latest`
2. Exposes port 3000
3. Serves traffic at `https://timeleft.opkod.dev`

Dokploy handles TLS termination, container lifecycle (health checks, restarts), and log aggregation.

### Required Secrets

| Secret | Where to set | Purpose |
|--------|-------------|---------|
| `DOKPLOY_WEBHOOK_URL` | GitHub repo settings → Secrets → Actions | Triggers Dokploy to pull and deploy the new image |
| `GITHUB_TOKEN` | Automatic | Authenticates to GHCR (provided by GitHub Actions, no manual setup) |

### Manual Deployment

To deploy without pushing code (e.g., redeploy after a Dokploy config change):

1. **Via GitHub Actions UI:** Go to Actions → Deploy → Run workflow
2. **Via Dokploy dashboard:** Manually trigger a redeploy at `https://infra.opkod.dev`

### Local Docker Build

To test the Docker build locally:

```bash
# Build
docker build -t timeleft-backoffice .

# Run
docker run -p 3000:3000 timeleft-backoffice

# Verify
open http://localhost:3000
```

---
