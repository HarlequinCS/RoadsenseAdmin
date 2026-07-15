# RoadSense Admin Dashboard

Web-based administrative dashboard for the RoadSense road hazard reporting system.

Built with Next.js, TypeScript, Tailwind CSS, Firebase, and Recharts.

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/about` | About the project |
| `/login` | Admin sign in |
| `/dashboard` | Overview — stats and charts |
| `/reports` | Manage hazard reports |
| `/users` | View registered users |
| `/analytics` | Report trends and breakdown |

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

### 3. Create `.env.local`

Create a file named `.env.local` in the root folder and fill in the Firebase credentials (get from a team member — do not commit this file):

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 4. Run the app

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## Login

Use the admin account credentials shared privately by the team. Do not commit login credentials to this repo.

---

## Tech Stack

- Next.js 16 + TypeScript
- Tailwind CSS
- Firebase Authentication + Firestore
- Recharts
- Tabler Icons

---

## Project

ICT602 Mobile Technology Group Project — RoadSense
