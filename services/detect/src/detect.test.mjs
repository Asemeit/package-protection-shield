import { test } from "node:test";
import assert from "node:assert/strict";
import { detectDeliveries } from "./detect.mjs";

test("detects ding + motion as likely delivery", () => {
  const events = [
    {
      id: "e1",
      deviceId: "front-door",
      deviceName: "Front Door",
      type: "ding",
      occurredAt: "2026-09-03T14:00:00.000Z",
    },
    {
      id: "e2",
      deviceId: "front-door",
      deviceName: "Front Door",
      type: "motion",
      occurredAt: "2026-09-03T14:00:40.000Z",
      durationSec: 12,
    },
  ];
  const dets = detectDeliveries(events);
  assert.equal(dets.length, 1);
  assert.equal(dets[0].label, "likely_delivery");
  assert.ok(dets[0].confidence >= 0.75);
});

test("ignores lone motion without ding", () => {
  const events = [
    {
      id: "e1",
      deviceId: "front-door",
      deviceName: "Front Door",
      type: "motion",
      occurredAt: "2026-09-03T15:00:00.000Z",
    },
  ];
  assert.equal(detectDeliveries(events).length, 0);
});
