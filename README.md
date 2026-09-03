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

## Quick start

```bash
# Requires Node.js 20+
npm install
npm run demo
```

Open the printed local URL for the timeline dashboard. Fixture mode replays sample Ring events so the demo works without live Ring hardware.

## Repo layout

```
apps/web/                 # Timeline dashboard
services/detect/          # Delivery heuristics
services/actions/         # Next-best-action rules
infra/aws/                # API Gateway, Lambda, DynamoDB, S3 stubs
fixtures/ring-events/     # Reproducible demo events
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
