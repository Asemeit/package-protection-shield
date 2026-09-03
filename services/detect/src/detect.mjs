/**
 * @typedef {'ding' | 'motion' | 'on_demand' | 'offline' | 'online'} RingEventType
 *
 * @typedef {Object} RingEvent
 * @property {string} id
 * @property {string} deviceId
 * @property {string} deviceName
 * @property {RingEventType} type
 * @property {string} occurredAt ISO timestamp
 * @property {number} [durationSec]
 * @property {string} [zone]
 */

/**
 * @typedef {Object} DeliveryDetection
 * @property {string} id
 * @property {string} startedAt
 * @property {string} endedAt
 * @property {number} confidence 0–1
 * @property {string} label
 * @property {string[]} reasonCodes
 * @property {string[]} eventIds
 * @property {string} deviceId
 */

const WINDOW_MS = 3 * 60 * 1000;

/**
 * Heuristic v1: a ding near the door plus a short motion cluster in a 3-minute
 * window is treated as a likely delivery. Pure function — easy to unit test.
 *
 * @param {RingEvent[]} events
 * @returns {DeliveryDetection[]}
 */
export function detectDeliveries(events) {
  if (!Array.isArray(events) || events.length === 0) return [];

  const sorted = [...events].sort(
    (a, b) => new Date(a.occurredAt) - new Date(b.occurredAt),
  );

  /** @type {DeliveryDetection[]} */
  const detections = [];

  for (let i = 0; i < sorted.length; i++) {
    const anchor = sorted[i];
    if (anchor.type !== "ding" && anchor.type !== "motion") continue;

    const t0 = new Date(anchor.occurredAt).getTime();
    const windowEvents = sorted.filter((e) => {
      const t = new Date(e.occurredAt).getTime();
      return t >= t0 && t <= t0 + WINDOW_MS && e.deviceId === anchor.deviceId;
    });

    const hasDing = windowEvents.some((e) => e.type === "ding");
    const motionCount = windowEvents.filter((e) => e.type === "motion").length;
    if (!hasDing || motionCount < 1) continue;

    const reasonCodes = [];
    let confidence = 0.45;
    if (hasDing) {
      reasonCodes.push("doorbell_ding");
      confidence += 0.25;
    }
    if (motionCount >= 1) {
      reasonCodes.push("motion_near_door");
      confidence += 0.15;
    }
    if (motionCount >= 2) {
      reasonCodes.push("motion_cluster");
      confidence += 0.1;
    }
    confidence = Math.min(0.95, confidence);

    const endedAt = windowEvents[windowEvents.length - 1].occurredAt;
    const id = `det_${anchor.id}_${windowEvents.map((e) => e.id).join("_")}`;

    // Deduplicate overlapping windows that share the same ding
    if (detections.some((d) => d.eventIds.includes(anchor.id) || overlap(d, t0, endedAt))) {
      continue;
    }

    detections.push({
      id,
      startedAt: anchor.occurredAt,
      endedAt,
      confidence: Number(confidence.toFixed(2)),
      label: confidence >= 0.75 ? "likely_delivery" : "possible_delivery",
      reasonCodes,
      eventIds: windowEvents.map((e) => e.id),
      deviceId: anchor.deviceId,
    });
  }

  return detections;
}

/**
 * @param {DeliveryDetection} d
 * @param {number} t0
 * @param {string} endedAt
 */
function overlap(d, t0, endedAt) {
  const a0 = new Date(d.startedAt).getTime();
  const a1 = new Date(d.endedAt).getTime();
  const b1 = new Date(endedAt).getTime();
  return Math.max(a0, t0) <= Math.min(a1, b1);
}
