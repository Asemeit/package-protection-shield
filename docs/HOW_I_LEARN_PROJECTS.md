# How I learn every project (reusable method)

Copy this into any repo as `docs/LEARN.md` (or keep this file and fill a new section per project).  
Use it so you **understand before you scale**, whether it’s Amazon, FieldMate, Focus Quest, or CALEC.

---

## The 5 questions (answer before coding)

1. **Who** is hurt today? (user)
2. **What** fails for them? (problem)
3. **What** do we change? (outcome)
4. **What data** goes in / out? (shapes)
5. **What must we never do?** (constraints — privacy, offline, cost, time)

If you can’t answer these, you’re guessing.

---

## The 4 layers (draw this every time)

```
1. Problem / product story
2. Domain logic (pure rules — easiest to test)
3. Interface (UI, API, CLI)
4. Infrastructure (DB, cloud, device SDKs)
```

Learn **layer 2 before layer 4**. Pretty AWS diagrams don’t help if you don’t know the rules.

---

## Build ritual (every feature)

1. **Write the checkpoint** — one sentence: “Done when ___.”
2. **Add or update a fixture / example input.**
3. **Implement the smallest pure function** (or rule).
4. **Add a test** that would fail without your change.
5. **Wire UI/API last.**
6. **Explain it out loud** (or write 3 bullets in LEARN.md notes).

---

## Template: paste into `docs/LEARN.md` for a new project

```markdown
# Learn: <Project name>

## One-sentence problem
## One-sentence solution
## Data flow (ascii)
## Folder map (table)
## Glossary (5–10 terms)
## Build order (A → E with checkpoints)
## 30-second pitch
## Constraints / non-goals
## My notes
```

---

## Red flags you’re not learning

- You only ever run the full app, never a unit test
- You can’t name inputs/outputs of the “brain” file
- You ask the agent to “just fix it” without stating what should happen
- Docs exist but you’ve never answered a checkpoint out loud

## Green flags

- You can break the demo on purpose by editing a fixture
- You can add a new action rule without touching the UI first
- You can explain privacy/offline constraints without reading notes
