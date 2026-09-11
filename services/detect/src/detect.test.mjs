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
      zone: "porch",
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
      zone: "porch",
    },
  ];
  assert.equal(detectDeliveries(events).length, 0);
});

test("ignores driveway-only / street motion even with ding", () => {
  const events = [
    {
      id: "e1",
      deviceId: "front-door",
      deviceName: "Front Door",
      type: "ding",
      occurredAt: "2026-09-03T12:00:00.000Z",
    },
    {
      id: "e2",
      deviceId: "front-door",
      deviceName: "Front Door",
      type: "motion",
      occurredAt: "2026-09-03T12:00:20.000Z",
      zone: "driveway",
    },
  ];
  assert.equal(detectDeliveries(events).length, 0);
});

test("ignores street-zone motion on driveway device", () => {
  const events = [
    {
      id: "e1",
      deviceId: "driveway",
      deviceName: "Driveway Cam",
      type: "motion",
      occurredAt: "2026-09-03T11:15:00.000Z",
      zone: "street",
    },
  ];
  assert.equal(detectDeliveries(events).length, 0);
});

test("repeat ding boosts reasons", () => {
  const events = [
    {
      id: "e1",
      deviceId: "front-door",
      deviceName: "Front Door",
      type: "ding",
      occurredAt: "2026-09-03T16:00:00.000Z",
    },
    {
      id: "e2",
      deviceId: "front-door",
      deviceName: "Front Door",
      type: "ding",
      occurredAt: "2026-09-03T16:00:40.000Z",
    },
    {
      id: "e3",
      deviceId: "front-door",
      deviceName: "Front Door",
      type: "motion",
      occurredAt: "2026-09-03T16:01:10.000Z",
      zone: "porch",
    },
  ];
  const dets = detectDeliveries(events);
  assert.equal(dets.length, 1);
  assert.ok(dets[0].reasonCodes.includes("repeat_ding"));
});

test("night ding + porch motion still detects", () => {
  const events = [
    {
      id: "e1",
      deviceId: "front-door",
      deviceName: "Front Door",
      type: "ding",
      occurredAt: "2026-09-03T22:10:00.000Z",
    },
    {
      id: "e2",
      deviceId: "front-door",
      deviceName: "Front Door",
      type: "motion",
      occurredAt: "2026-09-03T22:10:25.000Z",
      zone: "porch",
    },
  ];
  const dets = detectDeliveries(events);
  assert.equal(dets.length, 1);
  assert.equal(dets[0].label, "likely_delivery");
});
