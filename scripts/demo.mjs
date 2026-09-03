import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { detectDeliveries } from "../services/detect/src/detect.mjs";
import { recommendActions } from "../services/actions/src/actions.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const port = Number(process.env.PORT || 8787);

const fixturesPath = path.join(root, "fixtures/ring-events/sample-day.json");
const events = JSON.parse(fs.readFileSync(fixturesPath, "utf8"));
const detections = detectDeliveries(events);
const actions = recommendActions(detections, {
  now: new Date("2026-09-03T14:05:00"),
});

const state = {
  privacyMode: true,
  events,
  detections,
  actions,
  applied: [],
};

const webRoot = path.join(root, "apps/web");

/** @param {import('node:http').IncomingMessage} req */
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${port}`);

  if (req.method === "GET" && url.pathname === "/api/timeline") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        privacyMode: state.privacyMode,
        storedFields: state.privacyMode
          ? ["timestamp", "deviceId", "eventType", "label", "confidence", "action"]
          : ["timestamp", "deviceId", "eventType", "label", "confidence", "action", "note"],
        events: state.events,
        detections: state.detections,
        actions: state.actions,
        applied: state.applied,
      }),
    );
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/actions/apply") {
    try {
      const body = await readBody(req);
      const action = state.actions.find((a) => a.id === body.actionId);
      if (!action) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "action_not_found" }));
        return;
      }
      const entry = {
        ...action,
        appliedAt: new Date().toISOString(),
      };
      state.applied.unshift(entry);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, entry }));
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "bad_request" }));
    }
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/privacy") {
    const body = await readBody(req);
    state.privacyMode = Boolean(body.enabled);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ privacyMode: state.privacyMode }));
    return;
  }

  let filePath = path.join(webRoot, url.pathname === "/" ? "index.html" : url.pathname);
  if (!filePath.startsWith(webRoot)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  const ext = path.extname(filePath);
  const types = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
  };
  res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(port, () => {
  console.log(`Package Protection Shield demo → http://localhost:${port}`);
  console.log(`Detections from fixtures: ${detections.length}`);
});
