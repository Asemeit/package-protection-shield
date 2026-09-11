# Demo plan — Package Protection Shield

Hackathon demos fail from flaky live APIs. We demo **fixture mode** by default and mention Ring as the production source.

Related: [REQUIREMENTS.md](./REQUIREMENTS.md) acceptance criteria · [demo-script.md](./demo-script.md) spoken lines.

---

## 1. Demo goals

In **≤ 3 minutes**, a judge should understand:

1. The **problem** (noisy alerts, missed packages)  
2. Our **approach** (events → detection → one action)  
3. **Privacy** (no footage stored)  
4. That it can move to **AWS / Ring** later without changing the brain  

---

## 2. Setup (before recording / booth)

### Machine checklist
- [ ] Node 20+ installed  
- [ ] Repo cloned; on `main`  
- [ ] `npm test` passes  
- [ ] `npm run demo` starts; browser opens `http://localhost:8787`  
- [ ] Fixture file present: `fixtures/ring-events/sample-day.json`  
- [ ] Notifications / unrelated popups silenced  
- [ ] Font zoom readable on projector  

### Story props
- [ ] One sentence problem on a sticky or slide  
- [ ] Optional: phone mock of “useless alert spam” (static image)  

### Fallback
- [ ] Screenshot/video of working UI if laptop dies  
- [ ] Second browser profile already on the demo URL  

---

## 3. Demo flow (timed)

| Time | Beat | What you show | What you say |
|------|------|---------------|--------------|
| 0:00–0:20 | Hook | Pitch line | Packages get missed; alerts don’t say what to do next |
| 0:20–0:50 | Contrast | Click **Watch a delivery** | Six noisy alerts → one “likely delivery” + one action |
| 0:50–1:20 | Action | Tap green CTA | Enable announce / check porch — protection, not chat |
| 1:20–1:40 | Privacy + AWS | Badge + privacy note | Summaries only; same brain on Lambda / API GW |
| 1:40–2:20 | Proof | Timeline tab | Confidence, reason codes, stored fields |
| 2:20–2:45 | Ring path | Speak | Fixtures now; Ring adapter is the production ingest |
| 2:45–3:00 | Close | Brand | Ring track + AWS Builder; prevention + recovery |

---

## Click path (exact)

1. Terminal: `npm run demo` → open printed URL  
2. Say the pitch line on screen: *Camera noise → one package action*  
3. Click **Watch a delivery** — noisy alerts stack, then Shield shows one moment  
4. Tap the green CTA → wait for **✓ Active until …** + status banner  
5. Point at AWS badge: same brain on Lambda / API GW / DynamoDB / S3  
6. Switch to **Timeline · judge demo** — confidence, reasons, privacy fields, Applied  
7. Optional: Yes/No feedback on a detection  

Full shoot checklist: [VIDEO.md](./VIDEO.md)

---

## 5. What NOT to do live

- Don’t log into Ring mid-demo  
- Don’t refactor code on stage  
- Don’t open unrelated tabs (Downloads, Discord)  
- Don’t promise face recognition or auto-unlock doors  

---

## 6. Backup demo (60 seconds)

If the server won’t start:

1. Show pre-recorded screen capture following the same beats  
2. Show `fixtures/ring-events/sample-day.json` + test output `npm test`  
3. Walk `detect.mjs` / `actions.mjs` as the “brain”  

---

## 7. Judge Q&A cheat sheet

| Question | Short answer |
|----------|--------------|
| Why not use the video? | Privacy + hackathon scope; metadata is enough for an actionable MVP |
| What if there’s no ding? | MVP prioritizes precision; motion-only can be “possible” later |
| Is Announce Mode real? | Recommended now; Apply stubs / deep-links until Ring action API is wired |
| Where’s AWS? | Same functions behind API GW + Lambda; DynamoDB/S3 for summaries |
| False positives? | Require ding+motion; show reasons; add user feedback next |

---

## 8. Recording checklist (DevPost video)

- [ ] 1080p, clear mic, ≤3 minutes  
- [ ] Show face optional; UI must be readable  
- [ ] Repo URL spoken or on-screen end card  
- [ ] No secrets / `.env` on screen  
- [ ] Caption problem → solution → demo → privacy → AWS  

---

## 9. Success criteria for the demo itself

- Ran without live Ring  
- At least one Apply succeeded  
- Privacy called out explicitly  
- Scope stayed on packages (not whole smart home)
