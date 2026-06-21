# LingoLearn

Monorepo: Flutter mobile app (`app/`) + NestJS API (`server/`).

## Server (`server/`)

**Stack**: NestJS 11 + MikroORM 7 (PostgreSQL) + Bull (Redis) + MinIO

**Package manager**: bun (not npm). `bun.lock` is the lockfile.

**Commands** (run from `server/`):
- `bun run start:dev` — dev server with watch
- `bun run build` — compile to `dist/`
- `bun run start:prod` — run production build
- `bun run lint` — eslint
- `bun run test` — jest unit tests
- `bun run test:e2e` — e2e tests

**MikroORM**: `autoLoadEntities: true` — register entities via `MikroOrmModule.forFeature([Entity])` in feature modules. Do not add entity paths to `forRoot`.

**Bull queues**: Register processors via `BullModule.registerQueue({ name: 'queueName' })`.

**Env**: Copy `server/.env.example` to `server/.env`. Required vars: `DATABASE_URL`, `REDIS_URL`, MinIO creds.

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

## Conventions

- `.gitignore` at root covers both projects
- `CLAUDE.md` references this file
- No CI workflows configured yet

## Specs

- `docs/spec.md` — index file linking to each feature's specification
- `docs/specs/` — individual feature specs (e.g., `auth.md`, `courses.md`)
- **Always update specs when implementing or modifying features**
- **Keep specs in sync on every change** — if code changes, update the corresponding spec
- **Re-analyze requests** — when asked to re-analyze a feature, update its spec in `docs/specs/` and refresh `docs/spec.md` index
