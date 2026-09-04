# Requirements — Package Protection Shield

**Status:** Draft for MVP / Amazon Developer Hackathon 2026 (Ring track + AWS Builder)  
**Owner:** Precious Asemeit (`pasemeit@gmail.com`)  
**Last updated:** 2026-09-04

---

## 1. Vision

Homeowners get **noisy Ring alerts** but still miss or lose packages.  
Package Protection Shield turns doorbell/motion **events** into a **delivery risk** plus **one clear next action**, without storing raw video.

**One-liner:** From camera noise → package protection action.

---

## 2. Goals & non-goals

### Goals (MVP)
- Detect likely package deliveries from Ring-like events
- Show a human-friendly timeline of detections
- Recommend exactly one next-best action per detection
- Keep a privacy-first data model (summaries only)
- Run a reliable **fixture demo** offline
- Sketch the same pipeline on AWS (Builder mini-challenge)

### Non-goals (explicitly out of MVP)
- Storing or streaming camera footage / audio
- Face recognition or person identification
- Full smart-home control (lights, locks, scenes) as primary product
- Perfect ML computer vision
- Multi-tenant SaaS billing / org admin
- Replacing the Ring app

---

## 3. Users & scenarios

| Persona | Need | Success looks like |
|--------|------|--------------------|
| Busy homeowner | Know when a package likely arrived and what to do | Sees “likely delivery” + taps announce/check porch |
| Privacy-conscious user | Trust the product won’t keep video | Sees stored fields list; privacy mode on |
| Hackathon judge | Understand problem → solution → demo in ≤3 min | Fixture replay works live, pitch is clear |

### Primary scenarios
1. **Delivery cluster** — ding + motion near door within 3 minutes → detection + action  
2. **After-hours drop** — high-confidence detection at night → “check porch”  
3. **Ambiguous activity** — weaker signal → lower confidence + remind later  
4. **Apply action** — user taps Apply → logged in timeline (stub OK if Ring can’t auto-apply)  
5. **Privacy review** — user toggles privacy mode → UI shows what is stored  

---

## 4. Functional requirements

### FR-1 Event ingest
- System shall accept normalized events with at least: `id`, `deviceId`, `deviceName`, `type`, `occurredAt`
- Supported types (MVP): `ding`, `motion` (others ignored or logged)
- MVP source: JSON fixtures; future: Ring API/SDK behind the same shape

### FR-2 Delivery detection
- System shall cluster events per device in a time window (default **3 minutes**)
- A **likely** detection requires doorbell `ding` + at least one `motion` in-window
- System shall output `confidence` (0–1), `label`, `reasonCodes`, linked `eventIds`

### FR-3 Next-best action
- System shall recommend **one** action per detection
- Actions (MVP): `announce_mode`, `check_porch`, `remind_later`
- Recommendation may depend on confidence and local time of day

### FR-4 Timeline UI
- UI shall list detections with confidence and reasons
- UI shall show recommended actions and allow **Apply**
- UI shall show applied-action history for the session
- UI shall support privacy mode toggle and display stored-field summary

### FR-5 Demo mode
- `npm run demo` shall serve UI + APIs using fixtures without cloud credentials
- Demo shall remain usable if live Ring is unavailable

### FR-6 AWS Builder path (stub → implementable)
- Document mapping: ingest → detect → store summaries
- Provide CloudFormation/SAM stub for DynamoDB + S3 (extend with Lambda/API later)

### FR-7 Observability (light)
- Detection reasons visible in UI (no hidden scoring)
- Failed Apply returns a clear error (no silent failure)

---

## 5. Non-functional requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-1 | Privacy | No raw video/audio/faces stored in MVP |
| NFR-2 | Transparency | Every detection shows reason codes |
| NFR-3 | Reliability | Fixture path works 100% for demo |
| NFR-4 | Performance | Local timeline load &lt; 1s on fixture day |
| NFR-5 | Testability | Core detect/action logic covered by unit tests |
| NFR-6 | Portability | Domain logic independent of UI and AWS |
| NFR-7 | Security | No secrets in repo; `.env.example` only |
| NFR-8 | Accessibility (stretch) | Keyboard-usable Apply controls |

---

## 6. Constraints

- Hackathon deadline: **submit by October 23, 2026**
- Track: **Ring**; mini-challenge: **AWS Builder**
- Prefer explainable heuristics over opaque ML for MVP
- Scope lock: package **prevention + recovery** only

---

## 7. Assumptions

- Sample events sufficiently resemble Ring event semantics for a convincing demo
- “Announce mode” may be **recommended** before it can be **auto-applied** via API
- Judges accept simulator/fixture mode if clearly labeled

---

## 8. Risks → requirement links

| Risk | Mitigating requirements |
|------|-------------------------|
| False positives | FR-2 (ding+motion), FR-7 (reasons), feedback later |
| Ring API unavailable | FR-5 fixture demo |
| Privacy concerns | NFR-1, FR-4 privacy mode |
| Scope creep | Goals / non-goals, constraints |
| Action can’t auto-run | FR-3 + stub Apply + deep-link (post-MVP) |

---

## 9. Acceptance criteria (MVP “done”)

- [ ] Judge can run `npm run demo` and see ≥1 likely delivery from fixtures  
- [ ] Detection card shows confidence + reasons  
- [ ] Applying an action appears under Applied  
- [ ] Privacy mode explains stored fields  
- [ ] Unit tests for detect + actions pass (`npm test`)  
- [ ] README + LEARN + this requirements doc exist  
- [ ] Demo script followed in ≤3 minutes  
- [ ] AWS stub folder explains Builder mapping  

---

## 10. Open questions

1. Do we treat driveway-only motion as “possible delivery” in MVP or ignore it?  
2. Home timezone source: browser local time vs configured home TZ?  
3. Minimum Ring API surface needed after fixtures (events only vs device health)?  
4. Should “Was this a delivery?” feedback be in the hackathon demo or post-demo?

Record decisions under **My decisions** below when answered.

### My decisions

- 
- 
-
