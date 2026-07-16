# Groq Hazard Scoring (Cloud Function)

Mobile hazard priority uses **Groq** via Firebase Cloud Function `scoreHazardRisk` — not Gemini.

```
Mobile submit → Firestore (pending) → scoreHazardRisk + Groq → Firestore (complete) → Mobile/Admin update
```

## Deploy (run on your laptop)

Prerequisites: [Firebase CLI](https://firebase.google.com/docs/cli), Node 20.

```bash
cd /path/to/roadsense-admin
firebase login
firebase use roadsense-2bbad

# Set Groq keys (comma-separated for failover) — NEVER commit keys to git
firebase functions:secrets:set GROQ_API_KEYS

cd functions && npm install && cd ..
firebase deploy --only functions
```

## Verify

```bash
firebase functions:log --only scoreHazardRisk
```

Submit a hazard from the app. Firestore `hazards/{id}` should change:

- `aiScoringStatus`: `pending` → `complete`
- `riskSource`: `rules` → `ai`
- `aiReason`, `aiConfidence`, `aiRiskLevel` populated
- Reporter receives FCM push: **"AI review complete"**

## Admin panel FCM (alternative / additional)

The admin server can also send pushes via `/api/notifications/send` when
`FIREBASE_SERVICE_ACCOUNT_JSON` is set in `.env`. Used for:

- Manual broadcasts (`/notifications`)
- Status change alerts (report detail save)
- AI complete when `PendingHazardScorer` runs (admin tab open)

## Keys

| Secret | Where | Purpose |
|--------|-------|---------|
| `GROQ_API_KEYS` | Firebase Functions secrets | Mobile auto-scoring |
| `GROQ_API_KEYS` | Admin `.env` | Admin triage panel |

You can use the same keys in both places, or dedicate keys per service.

## Models

- With photo: `meta-llama/llama-4-scout-17b-16e-instruct` (Groq vision)
- Text only: `llama-3.3-70b-versatile`

## Security

- Do **not** paste API keys in chat or commit them to GitHub
- Rotate keys if they were ever exposed
