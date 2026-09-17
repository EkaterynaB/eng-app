# English Practice — MVP

A small app for practicing sentences you want to learn in English: save a sentence with its
translation, then practice recalling the English version from the translation.

## Stack

- **Frontend**: React + TypeScript (Vite), React Router, browser `SpeechSynthesis` API for
  text-to-speech.
- **Backend**: Node.js + TypeScript, Express, Mongoose (MongoDB), Zod for validation.
- **Database**: MongoDB.

## Project structure

```
backend/    REST API (Express + Mongoose)
  src/
    config/       env + MongoDB connection
    models/       Mongoose schemas
    validation/   Zod request schemas
    middleware/   validation + centralized error handling
    services/     business logic (DB access), independent of HTTP layer
    controllers/  request/response glue
    routes/       route wiring
    app.ts        Express app factory
    server.ts     process entrypoint

frontend/   React SPA (Vite)
  src/
    api/          typed REST client
    types/        shared TS types
    hooks/        useSentences (CRUD state), useSpeechSynthesis (TTS)
    components/    SentenceForm, SentenceList, DiffView, ProgressBar, EmptyState
    pages/        SentenceManagementPage, PracticePage
```

## Data model

```ts
Sentence {
  _id: string;
  englishText: string;
  translation: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
```

Deliberately flat. Fields like tags, difficulty, spaced-repetition scheduling, or a `userId`
can be added later without restructuring existing data.

## API

| Method | Path                      | Description                              |
| ------ | ------------------------- | ----------------------------------------- |
| GET    | `/api/sentences`          | List all sentences                        |
| POST   | `/api/sentences`          | Create a sentence                         |
| PUT    | `/api/sentences/:id`      | Update a sentence                         |
| DELETE | `/api/sentences/:id`      | Delete a sentence                         |
| GET    | `/api/sentences/practice` | Get a shuffled set for a practice session (`?limit=`) |
| GET    | `/health`                 | Health check                              |

All request bodies are validated with Zod; invalid input returns `400` with an `error` message,
missing resources return `404`, unexpected errors return `500`.

## Running locally

### Prerequisites

- Node.js 20+
- A running MongoDB instance (local `mongod`, Docker, or Atlas)

### Backend

```bash
cd backend
cp .env.example .env   # adjust MONGODB_URI if needed
npm install
npm run dev             # starts on http://localhost:4000
```

### Frontend

```bash
cd frontend
cp .env.example .env   # adjust VITE_API_BASE_URL if needed
npm install
npm run dev              # starts on http://localhost:5173
```

Open http://localhost:5173. The "Sentences" page lets you add/edit/delete sentences; "Practice"
runs a session against whatever is saved.

## Verified

- `backend`: `npm run typecheck` passes; the app was smoke-tested directly (health check,
  validation errors, 404 handling) since this sandbox's network policy blocks downloading a
  MongoDB binary for an in-memory integration test. Exercise the full CRUD + practice flow
  against a real MongoDB instance before relying on it.
- `frontend`: `npm run typecheck` and `npm run build` both pass.

## Known dependency advisories

`npm audit` flags two moderate advisories in the frontend's dev tooling that require breaking
major-version upgrades (Vite 6→8, React Router 6→7):

- **esbuild / Vite dev server**: only affects the local dev server accepting requests from other
  origins; irrelevant to the production build.
- **react-router**: an open-redirect edge case triggered by attacker-controlled `to` values
  starting with a backslash. This app only uses static, hardcoded `to` values, so it isn't
  exploitable here.

Revisit these before adding user-generated redirect targets or exposing the dev server publicly.

## Extending later

The architecture leaves room for, without major rework:

- **User accounts**: add a `userId` to `Sentence`, scope queries by the authenticated user.
- **Learning statistics / spaced repetition**: add a separate `PracticeAttempt` collection
  (sentence id, timestamp, correct/incorrect) or extend `Sentence` with scheduling fields; the
  service layer already isolates DB access from HTTP handlers.
- **Difficulty levels / tags / topics**: additive fields on `Sentence`, plus filter params on
  `GET /api/sentences` and `GET /api/sentences/practice`.
- **AI-generated examples / importing from text**: new endpoints that ultimately call
  `sentenceService.create`, no changes to existing ones.
- **Multiple source languages**: add a `sourceLanguage` field defaulting to the current
  behavior.
- **Pronunciation practice**: the `useSpeechSynthesis` hook already isolates TTS; a recording/
  scoring feature would be a new page reusing the same sentence data.
