# RoadSense Admin — Upgraded UI Files

## What's new vs v1

### Dashboard page
- Animated number counters (stat cards count up when data loads)
- Recharts integration — Bar chart (hazard by type) + Pie chart (by status)
- Hover-to-click table rows that navigate to report detail
- Live search on recent reports
- Spinning refresh button with last-updated timestamp
- Delta badges on stat cards ("+12%", "Active", "90%")

### Sidebar
- Live badge on Reports link showing count of "New" reports from Firestore
- Role subtitle under username
- Sign out button with hover danger state
- Sticky positioning so it stays visible while scrolling

### Report Table
- Tab bar (All / New / Under Investigation / Resolved) with live counts
- Type filter dropdown built from actual Firestore data
- Skeleton loading rows while data fetches
- Actions (View / Delete) hidden until row hover
- Toast notification on status change and delete
- Result count display ("X reports")

## Install extra dependency (recharts)
```bash
npm install recharts
```
(firebase and @tabler/icons-react already installed from v1)

## How to apply

Copy these files into your project, replacing the originals:

| File in zip | Destination in your project |
|---|---|
| `app/dashboard/page.tsx` | `app/(dashboard)/dashboard/page.tsx` |
| `components/Sidebar.tsx` | `components/Sidebar.tsx` |
| `components/ReportTable.tsx` | `components/ReportTable.tsx` |

Then restart:
```bash
npm run dev
```
