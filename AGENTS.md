# LingoLearn

Monorepo: Flutter mobile app (`app/`) + NestJS API (`server/`) + React web app (`web/`).

## Server (`server/`)

**Stack**: NestJS 11 + Sequelize 6 (PostgreSQL) + Bull (Redis) + MinIO

**Package manager**: bun (not npm). `bun.lock` is the lockfile.

**Commands** (run from `server/`):
- `bun run start:dev` — dev server with watch
- `bun run build` — compile to `dist/`
- `bun run start:prod` — run production build
- `bun run lint` — eslint
- `bun run test` — jest unit tests
- `bun run test:e2e` — e2e tests

**Sequelize**: `autoLoadModels: true`, `synchronize: true` — register entities via `SequelizeModule.forFeature([Entity])` in feature modules. Entities use `sequelize-typescript` decorators.

**Bull queues**: Register processors via `BullModule.registerQueue({ name: 'queueName' })`.

**Env**: Copy `server/.env.example` to `server/.env`. Required vars: `DATABASE_URL`, `REDIS_URL`, MinIO creds.

## Testing

**Always run tests after changing code and fix any failures before finishing.**

**Always implement tests for new features.**

```bash
bun run test       # run unit tests
bun run test:e2e   # run e2e tests
```

**Database services**: Use in-memory SQLite for unit tests. Create a test module with `SequelizeModule.forRoot({ dialect: 'sqlite', storage: ':memory:' })`.

**Entities**: Use `declare` on entity properties to avoid Sequelize getter/setter shadowing issues.

## Docker

**Dev** (deps only, app runs on host):
```bash
docker compose -f compose.dev.yml up -d
```

**Production** (full stack):
```bash
docker compose -f compose.prd.yml up --build
```

**Volumes**: All data mounts to `./volumes/` (gitignored).

## App (`app/`)

Flutter project. Standard Flutter commands apply (`flutter run`, `flutter build`, etc.).

## Web (`web/`)

**Stack**: React 19 + Vite 8 + TypeScript 6 + Tailwind CSS v4 + shadcn/ui

**Package manager**: bun. `bun.lock` is the lockfile.

**Commands** (run from `web/`):
- `bun run dev` — dev server with HMR
- `bun run build` — typecheck + build to `dist/`
- `bun run lint` — eslint
- `bun run preview` — preview production build

**shadcn**: Components live in `src/components/ui/`. Add new ones with `bunx shadcn@latest add <component>`. Config in `components.json`.

**Path alias**: `@/` maps to `src/`.

**Theming**: Always use shadcn/Tailwind theme variables (`text-foreground`, `bg-background`, `text-primary`, `text-muted-foreground`, `border-border`, etc.) instead of hardcoded colors (`text-gray-500`, `bg-white`, `text-black`, etc.). This ensures consistent light/dark mode support.

## Conventions

- `.gitignore` at root covers all three projects
- `CLAUDE.md` references this file
- No CI workflows configured yet

## Specs

- `docs/spec.md` — index file linking to each feature's specification
- `docs/specs/` — individual feature specs (e.g., `auth.md`, `courses.md`)
- **Always update specs when implementing or modifying features**
- **Keep specs in sync on every change** — if code changes, update the corresponding spec
- **Re-analyze requests** — when asked to re-analyze a feature, update its spec in `docs/specs/` and refresh `docs/spec.md` index

## Entities & API Specs

- `docs/API.md` stores all API endpoints, a description, their request and response format.
- `docs/ENTITIES.md` stores a list of entities that all mobile app, web app, and backend should know to implement together.
- After any edits, make sure to update these 2 files if there are any changes.