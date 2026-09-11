/** @type {'home' | 'judge'} */
let currentView = "home";
/** @type {object | null} */
let lastData = null;
let replaying = false;

const NOISE = [
  "Motion — driveway",
  "Motion — street",
  "Ding — front door",
  "Motion — porch",
  "Motion — driveway",
  "Online — driveway cam",
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function loadTimeline() {
  const res = await fetch("/api/timeline");
  const data = await res.json();
  lastData = data;
  if (!replaying) {
    resetNoiseVisual(true);
    renderHome(data);
  }
  renderJudge(data);
}

function deviceLabel(deviceId) {
  return String(deviceId || "door")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatWhen(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short",
    });
  } catch {
    return iso;
  }
}

function formatClock(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short",
    });
  } catch {
    return "";
  }
}

function friendlyLabel(label) {
  if (label === "likely_delivery") return "Likely delivery";
  if (label === "possible_delivery") return "Possible delivery";
  return label.replaceAll("_", " ");
}

function whyText(detection) {
  const codes = detection.reasonCodes || [];
  if (codes.includes("motion_cluster")) {
    return "Doorbell rang and there was movement on the porch — this often means a package.";
  }
  if (codes.includes("repeat_ding")) {
    return "Someone rang more than once and we saw porch motion.";
  }
  return "Doorbell + porch motion in a short window.";
}

function findApplied(data, actionId) {
  return (data.applied || []).find((a) => a.id === actionId);
}

function activeLabel(applied) {
  if (!applied?.activeUntil) return "Protection active";
  return `Active until ${formatClock(applied.activeUntil)}`;
}

function resetNoiseVisual(allOn) {
  const list = document.getElementById("noiseList");
  if (!list) return;
  list.innerHTML = NOISE.map(
    (t) => `<li class="${allOn ? "is-on" : ""}">${t}</li>`,
  ).join("");
  const foot = document.querySelector(".contrast-foot");
  if (foot) foot.textContent = "Six alerts. No next step.";
}

function setBanner(el, html, show) {
  if (!el) return;
  el.innerHTML = html;
  el.classList.toggle("is-hidden", !show);
  if (show) {
    el.classList.remove("is-pop");
    void el.offsetWidth;
    el.classList.add("is-pop");
  }
}

function renderHome(data, { reveal = false } = {}) {
  const detections = data.detections || [];
  const actions = data.actions || [];

  const status = document.getElementById("homeStatus");
  const moment = document.getElementById("homeMoment");
  const earlier = document.getElementById("homeEarlier");
  const privacy = document.getElementById("homePrivacy");
  const phone = document.getElementById("phoneShell");
  const banner = document.getElementById("homeBanner");

  privacy.textContent = data.privacyMode
    ? "Privacy on — event summaries only, never doorbell video."
    : "Privacy off (demo) — still no video.";

  const latestApplied = (data.applied || [])[0];
  if (latestApplied) {
    setBanner(
      banner,
      `<span class="check" aria-hidden="true">✓</span>
       <span><strong>${escapeHtml(latestApplied.title)}</strong> · ${escapeHtml(activeLabel(latestApplied))}</span>`,
      true,
    );
  } else {
    setBanner(banner, "", false);
  }

  if (!detections.length) {
    status.textContent = "All quiet · watching for deliveries";
    moment.innerHTML = `<div class="empty-state">
      <strong>All quiet</strong>
      <p>No deliveries yet. Tap <em>Watch a delivery</em> to replay a package drop.</p>
    </div>`;
    earlier.innerHTML = `<li><span class="quiet">Nothing earlier today</span></li>`;
    phone?.classList.remove("is-live");
    return;
  }

  const sorted = [...detections].sort(
    (a, b) => new Date(b.startedAt) - new Date(a.startedAt),
  );
  const top = sorted[0];
  const action = actions.find((a) => a.detectionId === top.id) || actions[0];
  const applied = action ? findApplied(data, action.id) : null;
  const pct = Math.round(top.confidence * 100);

  status.textContent = `${deviceLabel(top.deviceId)} · package watch active`;
  phone?.classList.add("is-live");

  const fb = top.feedback;
  let feedbackBlock = "";
  if (fb === "yes") {
    feedbackBlock = `<p class="meta ok">Thanks — marked as a delivery</p>`;
  } else if (fb === "no") {
    feedbackBlock = `<p class="meta bad">Got it — not a delivery</p>`;
  } else {
    feedbackBlock = `<div class="feedback-home">
      <span>Was this a delivery?</span>
      <button type="button" class="ghost" data-feedback="yes" data-id="${escapeHtml(top.id)}">Yes</button>
      <button type="button" class="ghost" data-feedback="no" data-id="${escapeHtml(top.id)}">No</button>
    </div>`;
  }

  const actionBlock = action
    ? applied
      ? `<div class="cta-done is-pop">
           <span class="check" aria-hidden="true">✓</span>
           <div>
             <p class="cta-done-title">${escapeHtml(activeLabel(applied))}</p>
             <p class="cta-done-sub">${escapeHtml(applied.title)}</p>
           </div>
         </div>
         <p class="cta-hint">${escapeHtml(action.howTo || action.rationale)}</p>`
      : `<button type="button" class="cta" data-apply="${escapeHtml(action.id)}">
           ${escapeHtml(action.title)}
         </button>
         <p class="cta-hint">${escapeHtml(action.howTo || action.rationale)}</p>`
    : "";

  moment.classList.toggle("is-reveal", reveal);
  moment.innerHTML = `
    <p class="moment-label">Right now</p>
    <h2>${escapeHtml(friendlyLabel(top.label))}</h2>
    <p class="when">${escapeHtml(deviceLabel(top.deviceId))} · ${escapeHtml(formatWhen(top.startedAt))}</p>
    <p class="why">${escapeHtml(whyText(top))}</p>
    <p class="confidence"><span class="confidence-num">${pct}%</span> confidence</p>
    ${actionBlock}
    ${feedbackBlock}
  `;

  moment.querySelectorAll("[data-apply]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.textContent = "Applying…";
      await fetch("/api/actions/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId: btn.dataset.apply }),
      });
      await loadTimeline();
    });
  });

  moment.querySelectorAll("[data-feedback]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          detectionId: btn.dataset.id,
          wasDelivery: btn.dataset.feedback === "yes",
        }),
      });
      loadTimeline();
    });
  });

  const rest = sorted.slice(1);
  earlier.innerHTML = rest.length
    ? rest
        .map(
          (d) => `<li>
            <span>${escapeHtml(friendlyLabel(d.label))}</span>
            <span class="t">${escapeHtml(formatWhen(d.startedAt))}</span>
          </li>`,
        )
        .join("")
    : `<li><span class="quiet">No earlier alerts</span></li>`;
}

function renderJudge(data) {
  const fields = document.getElementById("storedFields");
  if (!fields) return;

  fields.textContent = `Stored fields: ${data.storedFields.join(", ")}`;

  const privacy = document.getElementById("privacyToggle");
  if (privacy) privacy.checked = data.privacyMode;

  const latestApplied = (data.applied || [])[0];
  const judgeBanner = document.getElementById("judgeBanner");
  if (latestApplied) {
    setBanner(
      judgeBanner,
      `<span class="check" aria-hidden="true">✓</span>
       <span><strong>Action applied</strong> · ${escapeHtml(activeLabel(latestApplied))} · ${escapeHtml(latestApplied.title)}</span>`,
      true,
    );
  } else {
    setBanner(judgeBanner, "", false);
  }

  const detections = document.getElementById("detections");
  if (!data.detections.length) {
    detections.innerHTML = `<article class="card empty-card">
      <div class="empty-state">
        <strong>No detections yet</strong>
        <p>Replay a fixture day or wait for ding + porch motion in the same window.</p>
      </div>
    </article>`;
  } else {
    detections.innerHTML = data.detections
      .map((d) => {
        const pct = Math.round(d.confidence * 100);
        const fb = d.feedback;
        const feedbackBlock =
          fb === "yes"
            ? `<p class="meta ok">Marked: was a delivery</p>`
            : fb === "no"
              ? `<p class="meta bad">Marked: not a delivery</p>`
              : `<div class="feedback">
                  <span class="meta">Was this a delivery?</span>
                  <button type="button" class="ghost" data-feedback="yes" data-id="${escapeHtml(d.id)}">Yes</button>
                  <button type="button" class="ghost" data-feedback="no" data-id="${escapeHtml(d.id)}">No</button>
                </div>`;
        return `<article class="card card-enter">
          <h3>${escapeHtml(d.label.replaceAll("_", " "))}</h3>
          <p class="meta">${escapeHtml(d.deviceId)} · ${escapeHtml(d.startedAt)}</p>
          <p class="confidence-line"><span class="confidence-num">${pct}%</span> confidence</p>
          <div class="bar"><span style="width:${pct}%"></span></div>
          <div class="reasons">
            ${d.reasonCodes
              .map((r) => `<span class="pill hot">${escapeHtml(r)}</span>`)
              .join("")}
          </div>
          ${feedbackBlock}
        </article>`;
      })
      .join("");
  }

  detections.querySelectorAll("[data-feedback]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          detectionId: btn.dataset.id,
          wasDelivery: btn.dataset.feedback === "yes",
        }),
      });
      loadTimeline();
    });
  });

  const actions = document.getElementById("actions");
  if (!data.actions.length) {
    actions.innerHTML = `<article class="card empty-card">
      <div class="empty-state">
        <strong>No actions yet</strong>
        <p>Actions appear when Shield finds a likely delivery.</p>
      </div>
    </article>`;
  } else {
    actions.innerHTML = data.actions
      .map((a) => {
        const applied = findApplied(data, a.id);
        return `<article class="card card-enter ${applied ? "card-active" : ""}">
          <h3>${escapeHtml(a.title)}</h3>
          <p class="meta">${escapeHtml(a.rationale)}</p>
          <p class="meta how-to">${escapeHtml(a.howTo || "")}</p>
          ${
            applied
              ? `<div class="cta-done compact">
                   <span class="check" aria-hidden="true">✓</span>
                   <div>
                     <p class="cta-done-title">${escapeHtml(activeLabel(applied))}</p>
                     <p class="cta-done-sub">Logged ${escapeHtml(formatWhen(applied.appliedAt))}</p>
                   </div>
                 </div>`
              : `<button type="button" class="action" data-id="${escapeHtml(a.id)}">Apply action</button>`
          }
        </article>`;
      })
      .join("");
  }

  actions.querySelectorAll("button.action").forEach((btn) => {
    btn.addEventListener("click", async () => {
      btn.disabled = true;
      btn.textContent = "Applying…";
      await fetch("/api/actions/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId: btn.dataset.id }),
      });
      await loadTimeline();
    });
  });

  const applied = document.getElementById("applied");
  applied.innerHTML = data.applied.length
    ? data.applied
        .map(
          (a) => `<article class="card card-active card-enter">
            <h3><span class="check inline">✓</span> ${escapeHtml(a.title)}</h3>
            <p class="meta">${escapeHtml(activeLabel(a))}</p>
            <p class="meta">Applied ${escapeHtml(formatWhen(a.appliedAt))}</p>
          </article>`,
        )
        .join("")
    : `<article class="card empty-card">
        <div class="empty-state">
          <strong>Nothing applied yet</strong>
          <p>Tap Apply on a recommended action to log protection.</p>
        </div>
      </article>`;
}

async function runReplay() {
  if (replaying) return;
  replaying = true;
  const btn = document.getElementById("btnReplay");
  btn.disabled = true;
  btn.textContent = "Replaying…";

  setView("home");

  await fetch("/api/session/reset", { method: "POST" });
  const res = await fetch("/api/timeline");
  lastData = await res.json();
  renderJudge(lastData);

  const moment = document.getElementById("homeMoment");
  const status = document.getElementById("homeStatus");
  const phone = document.getElementById("phoneShell");
  const foot = document.querySelector(".contrast-foot");
  const earlier = document.getElementById("homeEarlier");
  const banner = document.getElementById("homeBanner");

  setBanner(banner, "", false);
  phone?.classList.remove("is-live");
  status.textContent = "Listening for Ring events…";
  earlier.innerHTML = "";
  moment.innerHTML = `<div class="waiting"><strong>Waiting…</strong>Raw alerts are piling up on the left.</div>`;

  resetNoiseVisual(false);
  const items = [...document.querySelectorAll("#noiseList li")];
  for (const li of items) {
    await sleep(380);
    li.classList.add("is-on");
  }
  if (foot) foot.textContent = "Six alerts. Still no next step.";

  await sleep(700);
  moment.innerHTML = `<div class="waiting"><strong>Shield thinking…</strong>Ding + porch motion → delivery risk.</div>`;
  await sleep(900);

  for (const li of items) {
    li.classList.add("is-dim");
  }
  if (foot) foot.textContent = "Noise ignored. One clear moment.";

  renderHome(lastData, { reveal: true });
  phone?.classList.add("is-live");

  btn.disabled = false;
  btn.textContent = "Watch a delivery";
  replaying = false;
}

function setView(view) {
  currentView = view;
  document.getElementById("viewHome").classList.toggle("is-hidden", view !== "home");
  document.getElementById("viewJudge").classList.toggle("is-hidden", view !== "judge");
  document.getElementById("tabHome").classList.toggle("is-active", view === "home");
  document.getElementById("tabJudge").classList.toggle("is-active", view === "judge");
}

document.getElementById("tabHome").addEventListener("click", () => setView("home"));
document.getElementById("tabJudge").addEventListener("click", () => setView("judge"));
document.getElementById("btnReplay").addEventListener("click", () => runReplay());

document.getElementById("privacyToggle").addEventListener("change", async (e) => {
  await fetch("/api/privacy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled: e.target.checked }),
  });
  loadTimeline();
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

setView("home");
loadTimeline();
