# Cloudflare Workers Full-Stack Template

[cloudflarebutton]

A production-ready full-stack template for Cloudflare Workers featuring a React frontend with Tailwind CSS & shadcn/ui, Hono backend with Durable Objects for stateful entities (Users, ChatBoards, Messages), TanStack Query for data fetching, and seamless local development/deployments.

## Features

- **Serverless Backend**: Hono-powered API routes with automatic CORS and logging.
- **Durable Objects**: Per-entity storage (one DO per User/Chat) with ACID transactions, indexing, and pagination.
- **React Frontend**: Vite + React 18 + TypeScript + Tailwind + shadcn/ui components.
- **Data Management**: TanStack Query for optimistic updates, infinite queries, mutations.
- **Type-Safe**: Shared types between frontend/backend, full TypeScript support.
- **Demo Entities**: Users, ChatBoards (with embedded messages), seed data, CRUD operations.
- **Responsive UI**: Modern design with dark mode, sidebar layout, animations.
- **Development Tools**: Hot reload, error reporting, health checks.
- **Production-Ready**: SQLite-backed Durable Objects, SPA asset handling.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Router, Lucide Icons, Sonner (toasts), Framer Motion.
- **Backend**: Cloudflare Workers, Hono, Durable Objects (GlobalDurableObject pattern).
- **Data**: ACID transactions via DO storage, prefix indexes for listing/pagination.
- **Dev Tools**: Bun, wrangler, ESLint, Tailwind, PostCSS.

## Quick Start

1. **Install Dependencies**:
   ```bash
   bun install
   ```

2. **Development**:
   ```bash
   bun dev
   ```
   Opens at `http://localhost:3000` (frontend) with hot reload. API at `/api/*`.

3. **Type Generation** (after `wrangler deploy` or local binding):
   ```bash
   bun run cf-typegen
   ```

4. **Build & Preview**:
   ```bash
   bun run build
   bun run preview
   ```

## Installation

Prerequisites: [Bun](https://bun.sh/) v1.1+, [wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) CLI logged in.

```bash
# Clone/Fork this repo
git clone <your-repo> my-app
cd my-app

# Install
bun install

# Generate types (if bindings configured)
bun run cf-typegen
```

## Usage

### Frontend Development
- Edit `src/pages/HomePage.tsx` for your app UI.
- API calls via `src/lib/api-client.ts` (uses TanStack Query hooks in components).
- Add routes in `src/main.tsx`.
- Components in `src/components/ui/` (shadcn), hooks in `src/hooks/`.
- Shared types: `shared/types.ts`, mock data: `shared/mock-data.ts`.

### Backend Customization
- **Add Entities**: Extend `IndexedEntity` in `worker/entities.ts` (see UserEntity/ChatBoardEntity).
- **Add Routes**: Export `userRoutes(app)` from `worker/user-routes.ts`.
- **API Endpoints** (demo):
  | Method | Endpoint | Description |
  |--------|----------|-------------|
  | GET | `/api/health` | Health check |
  | GET | `/api/users` | List users (?cursor=?&limit=10) |
  | POST | `/api/users` | Create user `{name: string}` |
  | DELETE | `/api/users/:id` | Delete user |
  | POST | `/api/users/deleteMany` | Bulk delete `{ids: string[]}` |
  | GET/POST | `/api/chats` | List/create chats |
  | GET | `/api/chats/:chatId/messages` | List messages |
  | POST | `/api/chats/:chatId/messages` | Send message `{userId, text}` |
  | DELETE | `/api/chats/:id` & `/api/chats/deleteMany` | Delete chats |

- Seed data auto-loads on first list (Users/Chats).

## Development Workflow

```bash
# Local dev (frontend + API proxy)
bun dev

# Tailwind IntelliSense (VSCode): install Tailwind CSS IntelliSense extension

# Lint
bun run lint

# Add shadcn components
npx shadcn@latest add <component>
```

**Hot Reload**: Frontend via Vite. Backend: edit `worker/user-routes.ts`, auto-reloads.

**Custom Sidebar**: Edit `src/components/app-sidebar.tsx`. Use `AppLayout` in pages for sidebar.

## Deployment

1. **Configure wrangler** (edit `wrangler.jsonc`):
   - Set `name` to your worker name.
   - Add `[vars]`, `[secrets]`, `[d1_databases]`, etc.

2. **Deploy**:
   ```bash
   bun run build  # Builds frontend assets
   wrangler deploy
   ```

3. **One-Click Deploy**:
   [cloudflarebutton]

**Assets**: Frontend built to `/dist`, served as SPA via Workers Sites. API at `/api/*`.

**Migrations**: DO schema auto-managed via `wrangler.jsonc`.

**Observability**: Metrics/Logs enabled. View in Cloudflare dashboard.

## Scripts

| Script | Description |
|--------|-------------|
| `bun dev` | Local dev server |
| `bun build` | Build frontend |
| `bun preview` | Preview production build |
| `bun deploy` | Build + wrangler deploy |
| `bun lint` | ESLint |
| `bun cf-typegen` | Generate Worker types |

## License

MIT. See generated `LICENSE` file.