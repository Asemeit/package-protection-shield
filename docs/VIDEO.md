# Demo video — shoot guide (≤3 minutes)

**Goal:** One clean take judges can watch without reading the repo.

Related: [DEMO.md](./DEMO.md) · [demo-script.md](./demo-script.md) · [video/VOICEOVER_TRANSCRIPT.md](./video/VOICEOVER_TRANSCRIPT.md)

## Submission files (~1:53)

| File | Use |
|------|-----|
| [`video/pps-demo-captions.mp4`](./video/pps-demo-captions.mp4) | Captions already on; upload or practice |
| [`video/pps-demo-silent.webm`](./video/pps-demo-silent.webm) | Best base for **your** voiceover |
| [`video/VOICEOVER_TRANSCRIPT.md`](./video/VOICEOVER_TRANSCRIPT.md) | What to say + timestamps |

---

## Record yourself in ~10 minutes (QuickTime)

1. Restart demo: `npm run demo` → http://localhost:8787 · Cmd+Shift+R  
2. Open **QuickTime Player** → **File → New Screen Recording**  
3. Choose built-in mic · record the browser window only  
4. Follow the shot list below while reading [demo-script.md](./demo-script.md)  
5. Stop · trim to ≤3:00 · export MP4  

---

## Before you record

1. Restart a clean demo:
   ```bash
   cd "/Users/macbook/Documents/AMAZON PROJECT 2026/package-protection-shield"
   npm test
   npm run demo
   ```
2. Open **http://localhost:8787** · hard refresh (Cmd+Shift+R)
3. Click **Watch a delivery** once to warm up, then click it again so the take starts fresh  
   (or refresh the page so Apply state is empty)
4. Hide desktop clutter · Do Not Disturb on · zoom browser to ~110% if needed
5. Mic check · speak slower than feels natural

---

## Shot list (stay on Home first)

| Time | On screen | You say |
|------|-----------|---------|
| 0:00–0:15 | Pitch + brand | Packages get missed. Alerts don’t say what to do next. |
| 0:15–0:50 | Click **Watch a delivery** | Without Shield — six noisy alerts. With Shield — one likely delivery. |
| 0:50–1:20 | Tap green CTA → **Active until…** + ✓ banner | One next action. Tap Apply — protection is on. |
| 1:20–1:40 | Point privacy line + AWS badge | Summaries only — never video. Same brain on Lambda. |
| 1:40–2:20 | Switch **Timeline** | Here’s the proof: confidence, reason codes, stored fields. |
| 2:20–2:45 | Applied list / green banner | Detect → recommend → apply. |
| 2:45–3:00 | Back to Home brand | Ring track + AWS Builder. From noise to protection. |

---

## Do / don’t

**Do**
- Keep the **phone frame** in shot the whole Home segment (don’t crop differently mid-take)
- Pause 1 second after Apply so “Active until…” is readable
- One mouse cursor · no frantic scrolling

**Don’t**
- Log into Ring live
- Open VS Code mid-video
- Promise face ID or auto-unlock doors

---

## Export checklist

- [ ] Length ≤ 3:00 (or contest limit)
- [ ] Audio clear; no keyboard clatter over voice
- [ ] Apply beat visible (check + Active until)
- [ ] Privacy line or stored-fields banner shown
- [ ] Repo URL in description / README: `https://github.com/Asemeit/package-protection-shield`

---

## After the video

1. Commit + push any UI polish  
2. Add the video link to README (when you have the URL)  
3. October backlog stays for Ring adapter / real AWS deploy  
