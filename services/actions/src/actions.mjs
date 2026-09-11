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
 * @property {string} howTo Advisory deep-link stub until Ring Apply is real
 */

const HOW_TO = {
  announce_mode: "Open Ring → Modes → Announce (or enable for ~2 hours).",
  check_porch: "Open Ring → Live View on porch device → confirm package is secure.",
  remind_later: "Open Ring → set a reminder, or check porch in ~30 minutes.",
  review_zones: "Open Ring → Device Settings → Motion Zones → tighten driveway/street.",
};

/**
 * Map a detection to a single next-best action.
 * @param {DeliveryDetection} detection
 * @param {{ now?: Date }} [opts]
 * @returns {RecommendedAction}
 */
export function recommendAction(detection, opts = {}) {
  const now = opts.now ?? new Date(detection.startedAt);
  // UTC hours keep fixture demos identical in every timezone.
  const hour = now.getUTCHours();
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
      howTo: HOW_TO.announce_mode,
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
      howTo: HOW_TO.check_porch,
    };
  }

  return {
    id: `act_${detection.id}_remind`,
    title: "Set a 30-minute porch check reminder",
    rationale: "Possible delivery — confirm before dismissing the alert.",
    kind: "remind_later",
    durationMinutes: 30,
    detectionId: detection.id,
    howTo: HOW_TO.remind_later,
  };
}

/**
 * @param {DeliveryDetection[]} detections
 * @param {{ now?: Date }} [opts]
 */
export function recommendActions(detections, opts = {}) {
  return detections.map((d) => recommendAction(d, opts));
}
