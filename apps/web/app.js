async function loadTimeline() {
  const res = await fetch("/api/timeline");
  const data = await res.json();
  render(data);
}

function render(data) {
  const fields = document.getElementById("storedFields");
  fields.textContent = `Stored fields: ${data.storedFields.join(", ")}`;

  const privacy = document.getElementById("privacyToggle");
  privacy.checked = data.privacyMode;

  const detections = document.getElementById("detections");
  detections.innerHTML = data.detections
    .map((d) => {
      const pct = Math.round(d.confidence * 100);
      return `<article class="card">
        <h3>${escapeHtml(d.label.replaceAll("_", " "))}</h3>
        <p class="meta">${escapeHtml(d.deviceId)} · ${escapeHtml(d.startedAt)}</p>
        <p class="meta">Confidence ${pct}%</p>
        <div class="bar"><span style="width:${pct}%"></span></div>
        <div class="reasons">
          ${d.reasonCodes
            .map((r) => `<span class="pill hot">${escapeHtml(r)}</span>`)
            .join("")}
        </div>
      </article>`;
    })
    .join("");

  const appliedIds = new Set(data.applied.map((a) => a.id));
  const actions = document.getElementById("actions");
  actions.innerHTML = data.actions
    .map((a) => {
      const done = appliedIds.has(a.id);
      return `<article class="card">
        <h3>${escapeHtml(a.title)}</h3>
        <p class="meta">${escapeHtml(a.rationale)}</p>
        <button class="action" data-id="${escapeHtml(a.id)}" ${done ? "disabled" : ""}>
          ${done ? "Applied" : "Apply action"}
        </button>
      </article>`;
    })
    .join("");

  actions.querySelectorAll("button.action").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await fetch("/api/actions/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId: btn.dataset.id }),
      });
      loadTimeline();
    });
  });

  const applied = document.getElementById("applied");
  applied.innerHTML = data.applied.length
    ? data.applied
        .map(
          (a) => `<article class="card">
            <h3>${escapeHtml(a.title)}</h3>
            <p class="meta">Applied ${escapeHtml(a.appliedAt)}</p>
          </article>`,
        )
        .join("")
    : `<article class="card"><p class="meta">No actions applied yet.</p></article>`;
}

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

loadTimeline();
