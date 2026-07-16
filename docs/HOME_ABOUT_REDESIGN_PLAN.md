# Home & About Page Redesign Plan

**Goal:** Make the public landing and about pages visually compelling, informative, and on-brand — without any repository links.

**Sources:** `PROJECT_STORY.md`, existing brand tokens, team photos at `/home/dengkis/*.jpg`

**APK download (Android only):**  
https://drive.google.com/drive/folders/1uzaGzxzeC0IS6LC5iF-PUWP3R4Q-RmBs?usp=sharing  
(File: `RoadSenseV3.0.apk`)

---

## 1. Design direction

### Brand personality
- **Waze-inspired energy** — cyan trust + orange urgency (from mobile app)
- **Community-first** — drivers helping drivers, not bureaucracy
- **Academic credibility** — UiTM ICT602, professional but not dry

### Visual tokens (extend existing admin theme)

| Token | Value | Use |
|-------|-------|-----|
| Brand cyan | `#009EE3` | Hero accents, links, map motifs |
| Accent orange | `#FF6B35` | CTAs, hazard urgency, lane dividers |
| Asphalt / Fog | existing palette | Text, surfaces |
| Tagline | *Drive aware. Report fast. Keep each other safe.* | Hero + footer |

### Layout principles
- Large logo in hero (xl size)
- Generous whitespace, rounded-xl cards
- Subtle road/lane patterns (reuse `lane-divider` motif)
- Optional soft gradient hero background (cyan → fog)
- Mobile-first responsive (stack sections on small screens)
- No GitHub / repo links anywhere

---

## 2. Shared components (new)

| Component | Purpose |
|-----------|---------|
| `PublicNav` | Logo + About + Sign in (sticky, blur backdrop) |
| `PublicFooter` | UiTM credit, tagline, © 2026, no repo links |
| `SectionHeading` | Eyebrow + title + optional subtitle |
| `FeatureGrid` | Icon cards for capabilities |
| `StatStrip` | 3–4 headline numbers (reports concept, modules, etc.) |
| `TeamCard` | Photo, name, role, one-line bio |
| `DownloadCta` | Android APK button + “Android only” badge |
| `TimelineStep` | How-it-works numbered flow |

**Assets to add:**
```
public/team/saiful.jpg
public/team/aiman.jpg
public/team/jannah.jpg
public/team/nisa.jpg
```
(Copy from `/home/dengkis/` during implementation)

---

## 3. Home page (`/`) — section plan

### 3.1 Hero
- **Logo** large (xl) + wordmark
- **Headline:** *What if every driver could warn the next one?*
- **Subcopy:** 2 sentences from PROJECT_STORY prologue — crowdsourced hazards, photo + GPS + tap
- **CTAs:**
  1. **Download Android App** → Google Drive folder (primary, orange)
  2. **Admin Sign in** → `/login` (secondary, outline)
- **Badge:** `Android only · v3.0`
- **Visual:** Decorative map-pin cluster or abstract road graphic (CSS/SVG, no screenshot dependency)

### 3.2 Problem → Solution strip
Short narrative block:
- **Problem:** Slow official channels, hazards invisible until too late
- **Solution:** RoadSense — report in under a minute, community verifies, admins investigate

### 3.3 How it works (4 steps)
Condensed from PROJECT_STORY modules:

| Step | Title | Copy |
|------|-------|------|
| 1 | Report | 5-step wizard — type, photo, GPS, submit |
| 2 | Alert | Nearby drivers see hazards on map & home dashboard |
| 3 | Verify | Community confirms or resolves at 150 m |
| 4 | Act | Authorities use admin dashboard to investigate |

### 3.4 Mobile app highlights (6 cards)
From story chapters — citizen-facing only:
- Real-time hazard map with clustering
- Risk scoring (Low → Critical)
- Push notifications & proximity alerts
- Contributor badges (Safety Hero, etc.)
- Google Sign-In + email auth
- Legal compliance (Terms & Privacy gate)

### 3.5 Admin platform teaser
Brief section — this website is the **authority-facing** half:
- Dashboard, reports queue, map command center, analytics, AI assist
- CTA: **Admin Sign in** (not “dashboard” jargon on public page)

### 3.6 Impact quote
Pull quote from Chapter 14:
> *A driver who knows about a hazard can protect a driver who does not.*

### 3.7 Final CTA band
- Logo + tagline
- Download APK + About link

---

## 4. About page (`/about`) — section plan

### 4.1 Opening story
- **Title:** *The RoadSense Story*
- **Intro:** UiTM ICT602 group project → real Android app + live Firebase + admin platform
- **Mission:** Road safety in Malaysia through community action

### 4.2 Origin narrative
3 short paragraphs adapted from PROJECT_STORY:
1. The problem every driver knows (potholes, floods, debris)
2. The team’s question: report in seconds, see it immediately
3. What they built: mobile app + cloud + verification model + this admin dashboard

### 4.3 Technology stack (informative, not dev-doc)
Visual grid — icons + labels only:
- Android (Java)
- Firebase Auth & Firestore
- Google Maps & Location
- Cloudinary photos
- Firebase Cloud Messaging

### 4.4 Innovation highlights
Bullet story cards:
- **150 m arrival validation** — drivers confirm or resolve passing by
- **Automatic risk scoring** — type + nearby density
- **Waze-inspired UI** — familiar, urgent, trustworthy
- **Two halves of one system** — mobile for citizens, web for operators

### 4.5 Meet the team
Photo grid (2×2 desktop, 1 col mobile)

| Photo | Name | Role | One-line bio |
|-------|------|------|----------------|
| `saiful.jpg` | Muhammad Saiful Iqbal Abdul Rani | **Team Lead & Project Manager** | Led architecture, admin platform, and project delivery |
| `aiman.jpg` | Muhammad Aiman Mohd Nazri | **Lead Android & Maps Engineer** | Google Maps, location services, proximity alerts & background monitoring |
| `nisa.jpg` | Siti Alya Hanisah Latif | **Mobile Developer & Firebase Lead** | Authentication, Firestore integration, hazard reporting flow |
| `jannah.jpg` | Nurul Jannah Idris | **UI/UX Designer & Documentation Lead** | Waze-inspired interface, user flows, project documentation |

*Order: Team Lead first, then by technical pillar (maps → backend → design)*

Optional: UiTM + ICT602 badge under team section.

### 4.6 Project facts card
| Field | Value |
|-------|-------|
| Institution | Universiti Teknologi MARA (UiTM) |
| Course | ICT602 Mobile Programming |
| Type | Group Project |
| Status | Feature-complete (July 2026) |
| Platform | Android mobile app + Web admin |

**No repository row.**

### 4.7 Download section
- Same `DownloadCta` as home
- Install note: enable “Install from unknown sources” if needed
- Link to Google Drive folder

### 4.8 Closing
Epilogue line from PROJECT_STORY:
> *Four students at UiTM looked at a problem every driver knows and asked: Can we build something that helps? They did.*

---

## 5. Content rules

| Do | Don't |
|----|-------|
| Link APK on Google Drive | Link GitHub or any repo |
| Mention UiTM / ICT602 | Expose internal VPS paths |
| Use PROJECT_STORY narrative | Paste entire 480-line doc |
| Show team photos & roles | Invent team members |
| Promote admin login for staff | Confuse public users with dashboard jargon |

---

## 6. Implementation phases

### Phase A — Assets & shared layout (~30 min)
- Copy team photos → `public/team/`
- Create `PublicNav`, `PublicFooter`, `DownloadCta`
- Add brand cyan/orange CSS utilities if needed

### Phase B — Home page rebuild (~1–2 hrs)
- Replace `app/page.tsx` with new sections (3.1–3.7)
- Remove GitHub button and `#` download placeholder
- Wire real Google Drive URL

### Phase C — About page rebuild (~1–2 hrs)
- Replace `app/about/page.tsx` with story + team + tech sections
- Remove repository block entirely
- Team cards with photos

### Phase D — Polish & deploy (~30 min)
- Responsive pass (mobile/tablet)
- Dark mode check on public pages
- `docker compose build && up -d`
- Verify on `https://roadsense.saifuliqbal.dev`

---

## 7. Success criteria

- [ ] Home feels like a product landing page, not an admin stub
- [ ] About tells a human team story with real photos
- [ ] APK download works (opens Google Drive)
- [ ] Zero repository links on public pages
- [ ] Logo prominent on both pages
- [ ] Content aligns with PROJECT_STORY facts
- [ ] Mobile layout readable without horizontal scroll

---

## 8. Optional future enhancements (out of scope now)

- Bahasa Malaysia toggle
- Embedded demo video (splash video asset)
- Animated hazard map mockup (static image)
- Testimonials / use-case scenarios from Chapter 14

---

*Plan created: 16 July 2026 — ready for implementation on approval.*
