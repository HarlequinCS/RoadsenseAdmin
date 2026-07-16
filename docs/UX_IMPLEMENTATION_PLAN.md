# RoadSense Admin — UX Implementation Plan

**Goal:** Make the dashboard more significant, action-oriented, and user-friendly for road-safety administrators.

**Principles:**
- Dashboard = *what needs attention now*
- Reports = *work queue*
- Map = *spatial command center*
- Analytics = *trends for stakeholders*

---

## Phase 1 — Quick wins (1–2 days)

High impact, low risk. No schema changes.

### 1.1 Priority action banner (Dashboard)

**Problem:** Admins land on 7 stat cards with no clear next step.

**Implementation:**
| Item | Detail |
|------|--------|
| **File** | `app/(dashboard)/dashboard/page.tsx` |
| **New component** | `components/PriorityBanner.tsx` |
| **Logic** | Query hazards where `status === "New"` OR (`riskLevel` in `High/Critical` AND active) |
| **UI** | Alert strip at top: counts + CTA buttons |
| **CTAs** | "Review critical" → `/reports?filter=critical`, "View new" → `/reports?filter=new` |

**Acceptance criteria:**
- [ ] Banner visible when ≥1 critical/high-new hazard exists
- [ ] Banner shows friendly empty state when all clear
- [ ] Buttons navigate with correct query params

---

### 1.2 Reduce stat card clutter (Dashboard)

**Problem:** 7 cards on one screen — cognitive overload.

**Implementation:**
| Item | Detail |
|------|--------|
| **File** | `app/(dashboard)/dashboard/page.tsx` |
| **Keep (4 cards)** | New reports, Active hazards, High/Critical, Under investigation |
| **Remove from dashboard** | Total users, Total reports, Resolved, Resolve rate |
| **Move to** | Users page / Analytics page respectively |
| **Enhancement** | Wire `delta` prop on `StatCard` — e.g. `+3 today` for new reports |

**Acceptance criteria:**
- [ ] Dashboard shows exactly 4 primary stat cards
- [ ] At least one card shows a trend delta
- [ ] Removed metrics still accessible on their dedicated pages

---

### 1.3 Hide dev tools in production

**Problem:** `SeedDataButton` visible to real admins undermines trust.

**Implementation:**
| Item | Detail |
|------|--------|
| **File** | `components/SeedDataButton.tsx` or `dashboard/page.tsx` |
| **Condition** | Render only when `NODE_ENV !== "production"` OR `NEXT_PUBLIC_ENABLE_SEED === "true"` |

**Acceptance criteria:**
- [ ] Seed button hidden on `roadsense.saifuliqbal.dev`
- [ ] Seed button still available in local dev

---

### 1.4 Empty states

**Problem:** Blank charts/tables feel broken when no data.

**Implementation:**
| Item | Detail |
|------|--------|
| **New component** | `components/EmptyState.tsx` |
| **Use in** | Dashboard recent table, Analytics charts, Reports table, Users page |
| **Variants** | `all-clear`, `no-data`, `no-results` |

**Copy examples:**
- All clear: *"No critical hazards — roads looking good."*
- No data: *"Waiting for the first report from the mobile app."*
- No results: *"No reports match your filters."*

**Acceptance criteria:**
- [ ] Each major list/chart has an empty state
- [ ] Empty states include a helpful next action where relevant

---

## Phase 2 — Reports workflow (2–3 days)

Make `/reports` the primary admin work queue.

### 2.1 URL-driven filters

**Implementation:**
| Item | Detail |
|------|--------|
| **File** | `components/ReportTable.tsx` |
| **Query params** | `?filter=new`, `critical`, `investigating`, `resolved`, `all` |
| **UI** | Pill/tab filter bar above table |
| **Default sort** | Risk (Critical → Low), then date desc |

**Acceptance criteria:**
- [ ] Priority banner links open correct filtered view
- [ ] Filter state reflected in URL (shareable/bookmarkable)
- [ ] Active filter visually highlighted

---

### 2.2 Photo thumbnails in table

**Implementation:**
| Item | Detail |
|------|--------|
| **File** | `components/ReportTable.tsx` |
| **Column** | 48×48 thumbnail using existing `lib/cloudinary.ts` helper |
| **Fallback** | Hazard-type icon when no image |

**Acceptance criteria:**
- [ ] Thumbnail loads for reports with `imageUrl`
- [ ] Clicking row still opens detail page
- [ ] Table remains usable on smaller screens (hide thumb below `md` if needed)

---

### 2.3 Human-readable status labels

**Implementation:**
| Item | Detail |
|------|--------|
| **File** | `components/StatusBadge.tsx` or `lib/style-helpers.ts` |
| **Mapping** | New → "Awaiting review", Under Investigation → "In progress", Resolved → "Closed" |
| **Tooltip** | Raw status on hover for clarity |

**Acceptance criteria:**
- [ ] All status badges use friendly labels
- [ ] Original status value still in data/API

---

### 2.4 Bulk status update (optional stretch)

**Implementation:**
| Item | Detail |
|------|--------|
| **File** | `components/ReportTable.tsx`, `lib/hazard-service.ts` |
| **UI** | Checkbox column + "Mark as Under Investigation" toolbar |
| **API** | Batch update via existing `updateHazardStatus` |

**Acceptance criteria:**
- [ ] Select multiple New reports → single action updates all
- [ ] Confirmation before bulk update

---

## Phase 3 — Map command center (2 days)

### 3.1 Side panel on marker click

**Problem:** Tiny InfoWindow is hard to act on.

**Implementation:**
| Item | Detail |
|------|--------|
| **File** | `components/HazardMap.tsx` |
| **New component** | `components/HazardMapPanel.tsx` |
| **Layout** | Map left (70%) + fixed panel right (30%) on desktop; drawer on mobile |
| **Panel content** | Photo, type, risk, status, reporter, description snippet |
| **Actions** | "View full report", "Start investigation" (if New) |

**Acceptance criteria:**
- [ ] Clicking marker opens panel without leaving map
- [ ] Panel closes via X or map background click
- [ ] "Start investigation" updates status and refreshes marker color

---

### 3.2 Map page filter sync

**Implementation:**
| Item | Detail |
|------|--------|
| **Files** | `app/(dashboard)/map/page.tsx`, `HazardMap.tsx` |
| **Feature** | Same filter pills as Reports (New / Critical / All active) |
| **URL** | `?filter=critical` supported on map page |

**Acceptance criteria:**
- [ ] Filters reduce visible markers consistently with Reports page logic

---

## Phase 4 — Significance & polish (2–3 days)

### 4.1 Hero metric + live connection strip

**Implementation:**
| Item | Detail |
|------|--------|
| **File** | `dashboard/page.tsx` |
| **Hero** | Large "Active hazards" count with subtext |
| **Strip** | "Connected to RoadSense mobile · Last report X min ago" |

**Acceptance criteria:**
- [ ] Last report time updates in real time via existing `onSnapshot`
- [ ] Strip hidden if no reports ever submitted

---

### 4.2 Dashboard / Analytics de-duplication

**Implementation:**
| Item | Detail |
|------|--------|
| **Dashboard** | Action queue + 1 summary chart max (hazard type bar) |
| **Analytics** | All trend charts, monthly lines, resolve rate, exports |
| **Files** | `dashboard/page.tsx`, `analytics/page.tsx` |

**Acceptance criteria:**
- [ ] No duplicate pie/bar charts across both pages
- [ ] Each page has a distinct purpose documented in page subtitle

---

### 4.3 Global search (sidebar)

**Implementation:**
| Item | Detail |
|------|--------|
| **File** | `components/Sidebar.tsx` |
| **New component** | `components/GlobalSearch.tsx` |
| **Scope** | Search hazards by type, reporter, location text |
| **UX** | Cmd+K / Ctrl+K shortcut, dropdown results |

**Acceptance criteria:**
- [ ] Search finds reports and navigates to detail
- [ ] Debounced input (300ms)

---

### 4.4 Dark mode toggle

**Implementation:**
| Item | Detail |
|------|--------|
| **Files** | `components/Sidebar.tsx`, `app/layout.tsx`, `globals.css` |
| **Approach** | `class="dark"` on `<html>`, persist in `localStorage` |
| **Default** | System preference, user override saved |

**Acceptance criteria:**
- [ ] Toggle in sidebar footer
- [ ] Preference persists across sessions

---

## Phase 5 — Stakeholder features (future)

Lower priority; may need backend/Firebase changes.

| Feature | Effort | Notes |
|---------|--------|-------|
| Browser push notifications (Critical) | 3–5 days | FCM + admin token storage |
| Activity audit log | 3 days | New Firestore `audit_log` collection |
| CSV/PDF export | 2 days | Analytics + Reports export buttons |
| Avg response time metric | 2 days | Compute from `createdAt` → `adminUpdatedAt` |
| Email digest (daily summary) | 5+ days | Cloud Function + SendGrid/Resend |

---

## File change summary

| File | Phases |
|------|--------|
| `app/(dashboard)/dashboard/page.tsx` | 1, 4 |
| `components/PriorityBanner.tsx` | 1 (new) |
| `components/EmptyState.tsx` | 1 (new) |
| `components/ReportTable.tsx` | 2 |
| `components/HazardMap.tsx` | 3 |
| `components/HazardMapPanel.tsx` | 3 (new) |
| `components/StatusBadge.tsx` | 2 |
| `components/SeedDataButton.tsx` | 1 |
| `components/Sidebar.tsx` | 4 |
| `components/GlobalSearch.tsx` | 4 (new) |
| `app/(dashboard)/map/page.tsx` | 3 |
| `app/(dashboard)/analytics/page.tsx` | 4 |
| `lib/style-helpers.ts` | 2 |

---

## Deployment checklist (each phase)

```bash
cd /home/dengkis/projects/roadsense-admin
git pull
# ... make changes ...
docker compose build && docker compose up -d
docker logs roadsense-admin --tail 30
```

Verify on `https://roadsense.saifuliqbal.dev` after each phase before moving on.

---

## Recommended sprint order

```
Sprint 1 (Phase 1)     → Action banner, 4 cards, empty states, hide seed
Sprint 2 (Phase 2)     → Report filters, thumbnails, status labels
Sprint 3 (Phase 3)     → Map side panel + filter sync
Sprint 4 (Phase 4)     → Hero metric, de-dupe, search, dark mode
Sprint 5 (Phase 5)     → Notifications, export, audit log (as needed)
```

---

## Success metrics

| Metric | Target |
|--------|--------|
| Time to first action (login → open a report) | < 10 seconds |
| Clicks to start investigation from dashboard | ≤ 2 |
| Admin confusion reports | Zero "what do I do?" |
| Mobile ↔ dashboard perceived connection | Visible "last report" strip |

---

*Last updated: 2026-07-16*
