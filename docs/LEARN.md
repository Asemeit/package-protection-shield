# Learn this project (Package Protection Shield)

Read this **before** writing more code. Goal: you can explain every folder out loud without opening the files.

Also see: [REQUIREMENTS.md](./REQUIREMENTS.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [DEMO.md](./DEMO.md)

---

## 1. The problem in one sentence

Ring cameras create **lots of alerts**. People still lose packages because alerts don’t say **what to do next**.

## 2. The product in one sentence

Turn doorbell/motion **events** into a **delivery guess** + **one recommended action**, without storing video.

## 3. Mental model (data flow)

```
Ring-like events (JSON)
        ↓
  detectDeliveries()     ← “Was this a delivery?”
        ↓
  recommendAction()      ← “What should the user do?”
        ↓
  Web UI / later AWS     ← show timeline + Apply button
```

Everything else (DynamoDB, S3, Lambda) is the **same idea** hosted on AWS for the Builder mini-challenge.

## 4. Folder map (what each piece is for)

| Path | Job | You should understand |
|------|-----|------------------------|
| `fixtures/ring-events/` | Fake Ring history for demos | What fields an event has |
| `services/detect/` | Heuristic: ding + motion ⇒ delivery | Pure function, unit tests |
| `services/actions/` | Map detection → next action | Rules by confidence + time of day |
| `scripts/demo.mjs` | Tiny local API + static files | How UI gets JSON |
| `apps/web/` | Dashboard | Fetch → render cards → Apply |
| `infra/aws/` | Cloud stub | Same data, different host |
| `docs/demo-script.md` | Hackathon video outline | What judges should see |

## 5. Core concepts (glossary)

- **Event** — something the camera/doorbell reported (`ding`, `motion`, …) at a time.
- **Window** — a short time range (here: 3 minutes) used to group related events.
- **Detection** — our guess that a cluster of events means a delivery (`likely_delivery` / `possible_delivery`).
- **Confidence** — 0–1 score for how strong that guess is.
- **Reason codes** — human-readable why (`doorbell_ding`, `motion_cluster`).
- **Next-best action** — one concrete button (announce mode, check porch, remind later).
- **Privacy-first** — store labels and times, **not** video/audio/faces.
- **Fixture** — checked-in sample data so the demo works offline.

## 6. Build order (learn by doing)

Do these in order. After each step, answer the checkpoint out loud.

### Step A — Events
1. Open `fixtures/ring-events/sample-day.json`.
2. Draw a timeline of events for `front-door` on paper.

**Checkpoint:** What is the difference between `ding` and `motion`?

### Step B — Detection
1. Read `services/detect/src/detect.mjs` top to bottom.
2. Run: `npm run detect:test`
3. Change the fixture: remove a ding. Re-run tests / demo. What breaks?

**Checkpoint:** Why do we need both ding *and* motion, not motion alone?

### Step C — Actions
1. Read `services/actions/src/actions.mjs`.
2. Run: `npm run actions:test`
3. Mentally set the clock to 11pm with high confidence. Which action fires?

**Checkpoint:** Why does nighttime change the recommendation?

### Step D — Wire-up
1. Read `scripts/demo.mjs` — find where detect + actions are called.
2. Run: `npm run demo` → open the URL.
3. Click **Apply action**. Find where that is handled in `apps/web/app.js`.

**Checkpoint:** Where does UI state live — browser only, or also the server?

### Step E — AWS (later)
1. Read `infra/aws/README.md`.
2. Map each local piece to a cloud piece (fixture → API, detect → Lambda, store → DynamoDB/S3).

**Checkpoint:** What stays the same when you move to AWS? What changes?

## 7. How to explain it in a hackathon (30 seconds)

> “Package Protection Shield listens to Ring-like events, clusters doorbell + motion into a delivery detection with a confidence score, then recommends one next action. We never store footage — only summaries — and the same pipeline can run locally or on AWS.”

## 8. When you’re stuck

Ask yourself in this order:

1. What is the **input** shape? (event fields)
2. What is the **output** shape? (detection / action)
3. Is the bug in **rules**, **data**, or **UI wiring**?
4. Can I prove it with a **unit test** or a **fixture change**?

## 9. Your learning rule for this repo

If you can’t teach a file to a friend in 2 minutes, you don’t own it yet — re-read or write a note in this file under “My notes” below.

### My notes

- 
- 
-
