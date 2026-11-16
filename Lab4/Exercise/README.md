# Lab 4 — Multi-Route SPA, Context Form Engine & Full-Stack React 19

In-class exercises Ex 1.1, 1.2, 1.2.1, 1.2.2 (Sprint 1) · Ex 1.3 (Sprint 2) · Ex 1.7.1 (Sprint 3).
See `TASK_DECOMPOSITION.md` for the WBS and contracts, `project-rules.md` for the rules, and `AI_FAILURE_AUDIT.md` for the verified AI defects.

## Stack

React 19 · React Router v7 (`react-router`) · Vite 8 · Express 5 + `cors` · Vitest 5 + React Testing Library + jsdom · Supertest · Oxlint

## Run

```bash
# 1. API (http://localhost:3001)
cd server
npm install
cp ../.env.example ../.env   # optional — defaults match .env.example
npm start

# 2. Client (http://localhost:5173) — must stay on localhost:5173 to match CLIENT_ORIGIN (CORS)
cd client
npm install
npm run dev
```

| Route | Exercise | What to look at |
|---|---|---|
| `/`, `/about` | Ex 1.2, 1.2.1 | `<Routes>` + `element`, nested `<Layout>` with `<Outlet />`, active `NavLink` |
| `/people`, `/people/:id` | Ex 1.2.2, Ex 1.1 | Master-detail grid, `useParams`, 404 alert, lazy `PersonDetail` + skeleton |
| `/form` | Ex 1.3 | Context form, validation derived during render (no `useEffect`), `<ShowData>` inspector |
| `/forum` | Ex 1.7.1 | `useForumMessages` with `AbortController`, channel switcher, POST form |

## Verify

```bash
cd client && npm test && npm run lint && npm run build   # 51 tests, 0 lint warnings
cd server && npm test                                     # 17 Supertest tests
cd client && npm run build && npm run verify              # 19 headless-Chrome checks → ../docs/
```

`npm run verify` starts the API and `vite preview` itself. It needs Google Chrome and the Puppeteer bundle path set in the script; override them with `CHROME_PATH` / `PUPPETEER_BUNDLE`.

## API

| Method | Route | Body | Response |
|---|---|---|---|
| `GET` | `/api/messages/:forum` | — | `200 Message[]` · `404 { error: 'Unknown forum' }` |
| `POST` | `/api/messages/:forum` | `{ author, text }` | `201 Message` · `400 { error }` |

`forum ∈ { nasa, esports-tribunal, notNasa }` · `Message = { id: uuid, author, text, timestamp: ISO 8601 }`. Data is in memory and resets when the server restarts.
