# Package Protection Shield

**Amazon Developer Hackathon 2026 — Ring track** (+ AWS Builder mini-challenge)

Turn Ring doorbell / motion events into **actionable package protection**: detect likely deliveries, warn early, and recommend the next best action — without storing raw video.

## Problem

Packages get stolen or missed. Camera alerts are noisy; homeowners still don’t know what to do *next*.

## Solution

1. Ingest Ring-like events (ding, motion, device health)
2. Detect delivery-risk clusters with a confidence score
3. Recommend one clear action (e.g. announce mode for 2 hours, check porch)
4. Store **derived summaries only** (privacy-first)

## Docs (read in this order)

1. **[docs/WEEK_PLAN.md](docs/WEEK_PLAN.md)** — 7-day build to MVP (October = polish)  
2. **[docs/VIDEO.md](docs/VIDEO.md)** — how to record the ≤3 min demo  
3. **[docs/OCTOBER_BACKLOG.md](docs/OCTOBER_BACKLOG.md)** — pending after MVP  
4. **[docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)** — goals, FRs/NFRs, acceptance criteria  
5. **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** — diagrams (context, sequence, local vs AWS)  
6. **[docs/DEMO.md](docs/DEMO.md)** — how we demo (setup, timed script, Q&A)  
7. **[docs/LEARN.md](docs/LEARN.md)** — learn-as-you-build checkpoints  
8. **[docs/HOW_I_LEARN_PROJECTS.md](docs/HOW_I_LEARN_PROJECTS.md)** — same method for every project

## Judge quick start (< 30 seconds)

```bash
git clone https://github.com/Asemeit/package-protection-shield.git
cd package-protection-shield
npm test          # should pass
npm run demo      # → http://localhost:8787
```

No `npm install` required (zero runtime deps). Fixture mode — no Ring login, no AWS.

**In the UI:** detections → “Was this a delivery?” → Apply action → Applied list → Privacy mode toggle.

## Quick start

```bash
# Requires Node.js 20+
npm run demo
```

Open the printed local URL for the timeline dashboard.

## Repo layout

```
apps/web/                 # Timeline dashboard
services/detect/          # Delivery heuristics
services/actions/         # Next-best-action rules
infra/aws/                # API Gateway, Lambda, DynamoDB, S3 stubs
fixtures/ring-events/     # Reproducible demo events
docs/LEARN.md             # Understand-as-you-build guide
docs/demo-script.md       # 2–3 minute video script
```

## Architecture (MVP)

```
Ring / Simulator → API (local or API Gateway + Lambda)
                 → Detection service
                 → Action engine
                 → DynamoDB (events/actions) + S3 (daily summaries)
                 → Web dashboard
```

## Privacy

Stored: timestamp, device id, event type, detection label, confidence, action taken.  
Not stored: raw video, audio, face images, or long-lived media URLs.

## Author

- GitHub: [Asemeit](https://github.com/Asemeit)
- Contact: pasemeit@gmail.com

## License

MIT
