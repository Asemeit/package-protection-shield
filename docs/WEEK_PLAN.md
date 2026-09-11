# One-week build plan (MVP ready, October for polish)

**Goal:** Ship a demo-ready Package Protection Shield in **7 days**. October = fix pending, AWS polish, video, submission.

Baseline already done: detect, actions, fixtures, local demo UI, requirements/architecture/demo docs, tests green.

---

## Day 1 — Lock + feedback loop ✅
- Locked open decisions in REQUIREMENTS / this file  
- **“Was this a delivery?”** feedback on detections (`POST /api/feedback`)  
- `npm test` + `npm run demo` confirmed  

## Day 2 — Detection hardening ✅
- Extra fixtures (night delivery, driveway-only, double ding, driveway-zone false positive)  
- Unit tests for edge cases  
- Driveway / street zones ignored for delivery motion  

## Day 3 — Actions + Apply UX ✅
- Night vs day action coverage in tests  
- Deep-link stub (`howTo`: “Open Ring → …”) on each action card  
- Clear empty states in UI  

## Day 4 — Demo UI polish ✅
- Fixture badge, confidence bars, keyboard focus styles  
- Feedback + Apply in the same demo path  
- Match DEMO.md click path  

## Day 5 — AWS Builder path ✅
- [`infra/aws/handler.mjs`](../infra/aws/handler.mjs) wraps detect + actions  
- README deploy notes (deploy optional)  

## Day 6 — End-to-end rehearsal
- Full DEMO.md dry run (timed) — **you do this live**  
- Fix anything that confuses a first-time viewer  
- README “Judge quick start” section ✅  

## Day 7 — Buffer + backlog ✅
- [`docs/OCTOBER_BACKLOG.md`](./OCTOBER_BACKLOG.md) written  
- Tag `v0.1.0-mvp` when you are happy with the dry run  

---

## Locked decisions (Day 1)

| Question | Decision |
|----------|----------|
| Driveway-only motion | **Ignore for likely_delivery** (needs ding + *porch* motion on same device) |
| Timezone | **Demo clock** from each event’s ISO time; product later uses home TZ |
| Feedback in demo? | **Yes** — “Was this a delivery?” on each card |

---

## Definition of “week done”

- [x] Demo runs offline in &lt;30s setup  
- [x] Feedback + Apply both visible in UI  
- [x] Tests pass  
- [ ] DEMO.md dry-run ≤3 minutes *(your rehearsal)*  
- [x] AWS path documented with a real handler file  
- [x] October backlog written (not built)  
