import { test } from "node:test";
import assert from "node:assert/strict";
import { recommendAction } from "./actions.mjs";

test("daytime high-confidence suggests announce mode", () => {
  const action = recommendAction(
    {
      id: "d1",
      startedAt: "2026-09-03T14:00:00.000Z",
      endedAt: "2026-09-03T14:01:00.000Z",
      confidence: 0.85,
      label: "likely_delivery",
      reasonCodes: ["doorbell_ding", "motion_near_door"],
      eventIds: ["e1", "e2"],
      deviceId: "front-door",
    },
    { now: new Date("2026-09-03T14:05:00") },
  );
  assert.equal(action.kind, "announce_mode");
});
