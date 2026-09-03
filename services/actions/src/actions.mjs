/**
 * @typedef {import('../../detect/src/detect.mjs').DeliveryDetection} DeliveryDetection
 *
 * @typedef {Object} RecommendedAction
 * @property {string} id
 * @property {string} title
 * @property {string} rationale
 * @property {'announce_mode' | 'check_porch' | 'remind_later' | 'review_zones'} kind
 * @property {number} durationMinutes
 * @property {string} detectionId
 */

/**
 * Map a detection to a single next-best action.
 * @param {DeliveryDetection} detection
 * @param {{ now?: Date }} [opts]
 * @returns {RecommendedAction}
 */
export function recommendAction(detection, opts = {}) {
  const now = opts.now ?? new Date();
  const hour = now.getHours();
  const high = detection.confidence >= 0.75;

  if (high && hour >= 8 && hour <= 20) {
    return {
      id: `act_${detection.id}_announce`,
      title: "Enable announce mode for 2 hours",
      rationale:
        "Likely delivery window — announce visitors and keep the porch monitored.",
      kind: "announce_mode",
      durationMinutes: 120,
      detectionId: detection.id,
    };
  }

  if (high && (hour < 8 || hour > 20)) {
    return {
      id: `act_${detection.id}_porch`,
      title: "Check porch / secure package",
      rationale:
        "After-hours delivery risk — verify the package is not left exposed.",
      kind: "check_porch",
      durationMinutes: 15,
      detectionId: detection.id,
    };
  }

  return {
    id: `act_${detection.id}_remind`,
    title: "Set a 30-minute porch check reminder",
    rationale: "Possible delivery — confirm before dismissing the alert.",
    kind: "remind_later",
    durationMinutes: 30,
    detectionId: detection.id,
  };
}

/**
 * @param {DeliveryDetection[]} detections
 * @param {{ now?: Date }} [opts]
 */
export function recommendActions(detections, opts = {}) {
  return detections.map((d) => recommendAction(d, opts));
}
