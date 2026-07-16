# RoadSense Admin Dashboard

Web-based administrative dashboard for the RoadSense road hazard reporting system, integrated with the same Firebase backend as the [RoadSense Android app](https://github.com/HarlequinCS/RoadSense).

Built with Next.js, TypeScript, Tailwind CSS, Firebase, and Recharts.

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/about` | About the project |
| `/login` | Admin sign in (requires `admin` custom claim) |
| `/dashboard` | Overview — stats, charts, active hazard map |
| `/reports` | Manage hazard reports (filter, status, delete, CSV export) |
| `/reports/[id]` | Hazard detail — photo, reporter profile, admin notes |
| `/map` | Full-screen hazard map (active hazards, colour by risk/status) |
| `/users` | Registered users, contributor badges, per-user reports |
| `/analytics` | Report trends, risk breakdown, monthly charts |

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/alyahns/roadsense-admin.git
cd roadsense-admin
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

Required variables:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase Web SDK (project: `roadsense-2bbad`) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Hazard map page |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Hazard photo thumbnails (`ditifn5y3`) |

For local development without admin custom claims set up yet:

```
NEXT_PUBLIC_SKIP_ADMIN_CHECK=true
```

### 4. Firebase setup

1. Register a **Web app** in Firebase Console → Project `roadsense-2bbad` → copy `appId` into `.env.local`
2. Create dedicated **admin accounts** under Authentication → Users
3. Set admin custom claim via Firebase Admin SDK:

```javascript
await admin.auth().setCustomUserClaims(adminUid, { admin: true });
```

4. Add your admin domain to Authentication → Settings → Authorized domains

### 5. Run the app

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Data model

The dashboard reads/writes the same Firestore collections as the mobile app:

- **`users`** — profile, stats (`totalReports`, `resolvedReports`, `contributorBadge`, `fcmToken`)
- **`hazards`** — reports with `hazardType`, `riskLevel`, `status`, `verificationCount`, `imageUrl` (Cloudinary)

### Hazard types (mobile app)

`Pothole`, `Road Crack`, `Flooding`, `Debris`, `Street Light Issue`, `Other`

### Status values

| Status | Set by |
|---|---|
| `New` | Mobile app on submit |
| `Under Investigation` | **Admin only** |
| `Resolved` | Mobile app or admin |

### Admin write operations

- Set status to **Under Investigation** (primary admin action)
- Resolve hazard (updates `statusUpdatedAt`, `resolvedBy`, recalculates user stats)
- Delete hazard (admin only)
- Add **admin notes** (`adminNotes`, `adminUpdatedBy`)

---

## Login

Use a dedicated admin Firebase Auth account with the `{ admin: true }` custom claim. Do not promote regular mobile app users to admin.

---

## Tech Stack

- Next.js 16 + TypeScript
- Tailwind CSS v4
- Firebase Authentication + Firestore (client SDK)
- Google Maps (`@react-google-maps/api`)
- Recharts
- Tabler Icons

---

## Project

ICT602 Mobile Technology Group Project — RoadSense

**Team:** Muhammad Saiful Iqbal Abdul Rani, Nurul Jannah Idris, Siti Alya Hanisah Latif, Muhammad Aiman Mohd Nazri

**Mobile repo:** https://github.com/HarlequinCS/RoadSense
