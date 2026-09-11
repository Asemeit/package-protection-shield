/**
 * AWS Lambda sketch — same detect + actions brain as local demo.
 * Wire via API Gateway POST /events (see README.md).
 *
 * Deploy optional for MVP; judges run `npm run demo` offline.
 */
import { detectDeliveries } from "../../services/detect/src/detect.mjs";
import { recommendActions } from "../../services/actions/src/actions.mjs";

/**
 * @param {{ body?: string | object, httpMethod?: string }} event
 */
export async function handler(event) {
  let payload = event?.body ?? event;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      return response(400, { error: "invalid_json" });
    }
  }

  const events = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.events)
      ? payload.events
      : null;

  if (!events) {
    return response(400, {
      error: "bad_request",
      hint: "Send { events: RingEvent[] } or a RingEvent[] array",
    });
  }

  const detections = detectDeliveries(events);
  const now = payload?.now ? new Date(payload.now) : undefined;
  const actions = recommendActions(detections, now ? { now } : {});

  return response(200, {
    privacy: {
      storedFields: [
        "timestamp",
        "deviceId",
        "eventType",
        "label",
        "confidence",
        "action",
      ],
      notStored: ["raw_video", "audio", "faces"],
    },
    detections,
    actions,
  });
}

/**
 * @param {number} statusCode
 * @param {object} body
 */
function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}

// Local smoke: node infra/aws/handler.mjs
import { pathToFileURL } from "node:url";
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { fileURLToPath } = await import("node:url");
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const events = JSON.parse(
    fs.readFileSync(path.join(root, "fixtures/ring-events/sample-day.json"), "utf8"),
  );
  const out = await handler({ body: { events } });
  console.log(out.body);
}
