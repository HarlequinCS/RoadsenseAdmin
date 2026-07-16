# RoadSense — Mobile Responsive Plan

**Goal:** Make the public site and admin dashboard usable on phones (320px–428px width) without horizontal scroll, cramped tap targets, or broken layouts.

**Audit date:** 16 July 2026  
**Breakpoints (Tailwind):** `sm` 640px · `md` 768px · `lg` 1024px

---

## 1. Current state summary

| Area | Mobile readiness | Notes |
|------|------------------|-------|
| **Home `/`** | Good | Responsive grids, stacked sections, hero text scales |
| **About `/about`** | Good | Single column on small screens, team cards `sm:grid-cols-2` |
| **Login `/login`** | Good | Centered form, `max-w-sm`, adequate padding |
| **Public nav** | Needs work | No hamburger; logo + 2 links always visible — tight on narrow phones |
| **Admin sidebar** | Broken | Fixed `220px` always on screen — steals ~56% width on iPhone |
| **Dashboard layout** | Needs work | `px-8` padding; no mobile header |
| **Stat card grids** | Broken | `grid-cols-4` / `grid-cols-3` with no responsive breakpoints |
| **Reports table** | Broken | Wide `table-fixed` with 9+ columns — unreadable on phone |
| **Map page** | OK | Map + panel stack vertically (`flex-col md:flex-row`) |
| **Report detail** | Good | `grid-cols-1 lg:grid-cols-3` stacks correctly |
| **Analytics** | Needs work | Multiple `grid-cols-4` stat rows |
| **Users** | Needs work | `grid-cols-4` stats + wide expandable table |
| **Global search** | OK | Modal overlay works; trigger is inside sidebar (blocked until sidebar fixed) |

### Verdict

- **Public pages:** ~80% responsive — polish nav and touch targets.
- **Admin dashboard:** ~40% responsive — sidebar and data tables are the blockers.

---

## 2. Design principles (mobile)

1. **Thumb zone** — primary actions in bottom half or easy reach; min tap target **44×44px**.
2. **One column default** — stack content; use 2 columns only from `sm` (640px) where it helps.
3. **Progressive disclosure** — hamburger / drawer for admin nav; card rows instead of wide tables on phone.
4. **No horizontal scroll** — except intentional table scroll with fade hint, or dedicated card fallback.
5. **Sticky mobile header** — logo + menu button on public and admin; content scrolls underneath.

---

## 3. Implementation phases

### Phase A — Public site nav (hamburger) · ~2 hours

**Problem:** `PublicNav` shows logo (`lg`) + About + “Admin Sign in” inline. On 320–375px screens the header feels crowded and the sign-in label may wrap awkwardly.

**Files:**
- `components/public/PublicNav.tsx` → convert to client component
- New: `components/public/MobileMenu.tsx` (optional, or inline in PublicNav)

**Implementation:**

```
Desktop (md+):  [Logo]              [About] [Admin Sign in]
Mobile (<md):   [Logo]                        [☰]
                └─ drawer/sheet: About, Admin Sign in, Download APK (optional)
```

| Task | Detail |
|------|--------|
| A.1 | Add `useState` for menu open/close |
| A.2 | Hide desktop `<nav>` below `md`, show `IconMenu2` button (44px tap area) |
| A.3 | Slide-down or full-screen overlay menu with links + close (`IconX`) |
| A.4 | `body` scroll lock when menu open |
| A.5 | Shrink nav logo to `md` on mobile, `lg` on `md+` |
| A.6 | Shorten mobile CTA label: “Sign in” (full “Admin Sign in” on desktop) |
| A.7 | `aria-expanded`, `aria-controls`, focus trap, Escape to close |

**Success criteria:**
- [ ] No horizontal overflow on 320px viewport
- [ ] All nav links reachable with one thumb
- [ ] Menu closes on route change

---

### Phase B — Admin shell (drawer sidebar) · ~3–4 hours

**Problem:** `Sidebar` is `w-[220px] shrink-0` always visible. Main content gets `~170px` on a 390px phone.

**Files:**
- `components/Sidebar.tsx`
- New: `components/MobileAdminHeader.tsx`
- `app/(dashboard)/layout.tsx`

**Implementation:**

```
Mobile (<lg):
  ┌─────────────────────────────┐
  │ [☰]  RoadSense Admin   [🔔] │  ← sticky top bar
  ├─────────────────────────────┤
  │                             │
  │   Main content (full width) │
  │                             │
  └─────────────────────────────┘

  Drawer (off-canvas left): full sidebar content when ☰ tapped

Desktop (lg+):
  Current layout unchanged — sidebar fixed left
```

| Task | Detail |
|------|--------|
| B.1 | Wrap sidebar in drawer: `fixed inset-y-0 left-0 z-50 w-[260px] transform -translate-x-full lg:translate-x-0` |
| B.2 | Backdrop overlay on mobile when open (`bg-black/50`) |
| B.3 | New `MobileAdminHeader`: hamburger, page title (optional), notification icon |
| B.4 | Close drawer on nav link click and route change |
| B.5 | Move `GlobalSearch` trigger to mobile header (search icon) OR keep in drawer |
| B.6 | Layout main: `px-4 py-5 sm:px-6 lg:px-8` |
| B.7 | `lg:flex` on shell; below `lg` single column full width |

**Success criteria:**
- [ ] Main content uses full viewport width on phone
- [ ] All 6 nav items + search + sign out accessible via drawer
- [ ] Sidebar unchanged on desktop (≥1024px)

---

### Phase C — Responsive stat grids · ~1 hour

**Problem:** Dashboard, Analytics, Map, Users use `grid-cols-4` or `grid-cols-3` at all breakpoints.

**Files:**
- `app/(dashboard)/dashboard/page.tsx`
- `app/(dashboard)/analytics/page.tsx`
- `app/(dashboard)/map/page.tsx`
- `app/(dashboard)/users/UsersContent.tsx`

**Pattern (apply everywhere):**

```tsx
// Stat cards
className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3"

// Hero metric font
className="text-[40px] sm:text-[56px]"

// Page headers
className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
```

| Task | Detail |
|------|--------|
| C.1 | Dashboard: 4 stat cards → `grid-cols-2 md:grid-cols-4` |
| C.2 | Analytics: both stat rows → `grid-cols-2 md:grid-cols-4` |
| C.3 | Map: 3 stat cards → `grid-cols-1 sm:grid-cols-3` |
| C.4 | Users: 4 stat cards → `grid-cols-2 md:grid-cols-4` |
| C.5 | Reduce chart heights on mobile: `height={140}` below `sm`, `180` above |

---

### Phase D — Reports table → mobile cards · ~3–4 hours

**Problem:** `ReportTable` uses a wide HTML table (checkbox, photo, ID, type, reporter, risk, status, date, actions). Unusable on phone.

**Files:**
- `components/ReportTable.tsx`
- New: `components/ReportCard.tsx` (mobile row card)

**Desktop (md+):** Keep current table.

**Mobile (<md):** Card list per report:

```
┌──────────────────────────────┐
│ [thumb]  Pothole      Critical│
│          New · 2h ago         │
│          Ahmad · ID #abc12    │
│ [View] [Status ▼]             │
└──────────────────────────────┘
```

| Task | Detail |
|------|--------|
| D.1 | Extract shared row data rendering |
| D.2 | `hidden md:block` on `<table>`, `md:hidden` on card list |
| D.3 | Bulk select: sticky bottom bar on mobile when items selected |
| D.4 | Filter chips: horizontal scroll container `overflow-x-auto` + `flex-nowrap` |
| D.5 | Tab bar (All/New/…): scrollable on mobile |
| D.6 | Toolbar: stack filters vertically; hide Print on `xs` or move to overflow menu |

---

### Phase E — Users & Activity polish · ~2 hours

**Users (`UsersContent.tsx`):**
- User list: card layout on mobile (avatar, name, email, report count)
- Expanded hazard list: already nested — ensure `overflow-x-auto` on inner tables or cardify

**Activity (`AuditLogTable.tsx`):**
- Same pattern as reports: table desktop, stacked cards mobile

---

### Phase F — Touch, typography & misc · ~1 hour

| Task | File / area |
|------|-------------|
| F.1 | Ensure buttons `min-h-[44px]` on primary mobile CTAs (`DownloadCta`, login submit) |
| F.2 | Toast position: `bottom-4 left-4 right-4 sm:left-auto sm:right-5` |
| F.3 | `PriorityBanner` action buttons: full width on mobile `w-full sm:w-auto` |
| F.4 | `AiTriagePanel` tabs: scrollable if needed |
| F.5 | Add explicit viewport in `app/layout.tsx` if missing (Next.js 16 default is usually fine) |
| F.6 | Public pages: reduce horizontal padding `px-4 sm:px-6` |

---

## 4. Component checklist (new / modified)

| Component | Action |
|-----------|--------|
| `PublicNav` | Hamburger + mobile drawer |
| `MobileAdminHeader` | **New** — admin top bar |
| `Sidebar` | Drawer behaviour + `lg:` desktop fixed |
| `ReportCard` | **New** — mobile report row |
| `ReportTable` | Dual layout table / cards |
| `AuditLogTable` | Dual layout (Phase E) |
| Dashboard layout | Responsive padding + header slot |

---

## 5. Testing matrix

Test on these widths (Chrome DevTools or real devices):

| Device | Width | Priority |
|--------|-------|----------|
| iPhone SE | 320px | P0 |
| iPhone 14 | 390px | P0 |
| Android mid | 360px | P0 |
| iPad Mini | 768px | P1 |
| iPad / tablet landscape | 1024px | P1 — sidebar should appear |

**Per-page checklist:**

- [ ] `/` — hero, CTAs, no overflow
- [ ] `/about` — team photos, facts table
- [ ] `/login` — form full width, logo centered
- [ ] `/dashboard` — drawer nav, 2×2 stat grid
- [ ] `/reports` — card list, filters scroll
- [ ] `/reports/[id]` — photo, AI panel stack
- [ ] `/map` — map height ≥ 280px, list below map
- [ ] `/analytics` — charts readable
- [ ] `/users` — user cards
- [ ] `/activity` — audit cards

**Interaction checks:**
- [ ] Hamburger opens/closes; backdrop dismisses
- [ ] Drawer closes after navigation
- [ ] Global search (Ctrl+K) still works on desktop; mobile search icon opens same modal
- [ ] Dark mode on all mobile views

---

## 6. Recommended order of work

```
Phase B (admin drawer)     ← highest impact, unblocks all admin mobile use
    ↓
Phase C (stat grids)       ← quick wins, visible immediately
    ↓
Phase A (public hamburger) ← polish marketing pages
    ↓
Phase D (report cards)     ← core admin workflow on phone
    ↓
Phase E + F                ← remaining polish
```

**Estimated total:** 12–14 hours across 2–3 sessions.

---

## 7. Out of scope (for now)

- Native mobile app changes (Android APK)
- PWA / install prompt
- Bottom tab bar navigation (drawer is sufficient for admin)
- Tablet-specific landscape optimisations beyond `md`/`lg` breakpoints
- Bahasa Malaysia mobile copy

---

## 8. Success criteria (overall)

- [ ] No unintentional horizontal scroll on any page at 320px
- [ ] All interactive elements ≥ 44px tap target on mobile
- [ ] Admin usable on phone for: view dashboard, triage new reports, change status, open map
- [ ] Public site: download APK + sign in path clear without zooming
- [ ] Lighthouse mobile usability pass (no tap-target / overflow flags)

---

*Plan ready for implementation — recommend starting with Phase B (admin drawer) then Phase C.*
