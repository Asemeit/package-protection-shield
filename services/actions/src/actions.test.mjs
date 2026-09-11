import { test } from "node:test";
import assert from "node:assert/strict";
import { recommendAction } from "./actions.mjs";

const base = {
  id: "d1",
  startedAt: "2026-09-03T14:00:00.000Z",
  endedAt: "2026-09-03T14:01:00.000Z",
  confidence: 0.85,
  label: "likely_delivery",
  reasonCodes: ["doorbell_ding", "motion_near_door"],
  eventIds: ["e1", "e2"],
  deviceId: "front-door",
};

test("daytime high-confidence suggests announce mode", () => {
  const action = recommendAction(base, {
    now: new Date("2026-09-03T14:05:00.000Z"),
  });
  assert.equal(action.kind, "announce_mode");
  assert.match(action.howTo, /Ring/);
});

test("night high-confidence suggests check porch", () => {
  const action = recommendAction(base, {
    now: new Date("2026-09-03T22:15:00.000Z"),
  });
  assert.equal(action.kind, "check_porch");
  assert.match(action.howTo, /Live View/);
});

test("lower confidence suggests remind later", () => {
  const action = recommendAction(
    { ...base, confidence: 0.6, label: "possible_delivery" },
    { now: new Date("2026-09-03T14:05:00.000Z") },
  );
  assert.equal(action.kind, "remind_later");
});
