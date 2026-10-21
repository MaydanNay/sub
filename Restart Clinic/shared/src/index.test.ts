import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateDisciplinePercent,
  calculateMedalQuotas,
  calculateRewardTier,
  getCharacterImageIndex,
  getCourseVisitTotal,
  getStageProgressPercent,
  getStageSubLevel,
  getVisitSlotMedalTier,
  validateVisitMedals,
  visitsUntilMascotUpgrade,
} from "./index.ts";

const stats = (n: number) => ({ endurance: n, ligaments: n, balance: n });

describe("calculateDisciplinePercent", () => {
  it("returns 0 when no scheduled visits", () => {
    assert.equal(calculateDisciplinePercent(0, 5), 0);
  });

  it("calculates ratio of completed to scheduled", () => {
    assert.equal(calculateDisciplinePercent(10, 8), 80);
  });

  it("caps at 100 when completed exceeds scheduled", () => {
    assert.equal(calculateDisciplinePercent(3, 5), 100);
  });
});

describe("calculateRewardTier", () => {
  it("maps tiers per TZ thresholds", () => {
    assert.equal(calculateRewardTier(69), "NONE");
    assert.equal(calculateRewardTier(70), "BRONZE");
    assert.equal(calculateRewardTier(85), "SILVER");
    assert.equal(calculateRewardTier(95), "GOLD");
    assert.equal(calculateRewardTier(100), "GOLD");
  });
});

describe("visitsUntilMascotUpgrade", () => {
  it("counts down within 3-visit cycle", () => {
    assert.equal(visitsUntilMascotUpgrade(0), 3);
    assert.equal(visitsUntilMascotUpgrade(1), 2);
    assert.equal(visitsUntilMascotUpgrade(2), 1);
    assert.equal(visitsUntilMascotUpgrade(3), 3);
  });
});

describe("getStageSubLevel", () => {
  it("maps stage progress to 4 sub-levels", () => {
    assert.equal(getStageSubLevel(0), 1);
    assert.equal(getStageSubLevel(24), 1);
    assert.equal(getStageSubLevel(25), 2);
    assert.equal(getStageSubLevel(49), 2);
    assert.equal(getStageSubLevel(50), 3);
    assert.equal(getStageSubLevel(74), 3);
    assert.equal(getStageSubLevel(75), 4);
    assert.equal(getStageSubLevel(100), 4);
  });
});

describe("getStageProgressPercent", () => {
  it("uses absolute stats on stages 1, 2, 4", () => {
    assert.equal(getStageProgressPercent(1, stats(10)), 10);
    assert.equal(getStageProgressPercent(2, stats(50)), 50);
    assert.equal(getStageProgressPercent(4, stats(100)), 100);
  });

  it("uses 50% cap on stage 3", () => {
    assert.equal(getStageProgressPercent(3, stats(25)), 50);
    assert.equal(getStageProgressPercent(3, stats(50)), 100);
  });
});

describe("calculateMedalQuotas", () => {
  it("splits 10 visits as 3/3/4", () => {
    assert.deepEqual(calculateMedalQuotas(10), { BRONZE: 3, SILVER: 3, GOLD: 4 });
  });

  it("always sums to total visits", () => {
    for (const n of [1, 3, 5, 7, 10, 12, 20]) {
      const q = calculateMedalQuotas(n);
      assert.equal(q.BRONZE + q.SILVER + q.GOLD, n);
    }
  });

  it("uses target visits independent of stage count", () => {
    assert.equal(getCourseVisitTotal(10, 4, 2), 10);
    assert.equal(getCourseVisitTotal(null, 5, 1), 5);
  });
});

describe("validateVisitMedals", () => {
  it("rejects more than 10 medals per visit", () => {
    const err = validateVisitMedals(
      Array(11).fill("BRONZE"),
      { BRONZE: 0, SILVER: 0, GOLD: 0 },
      { BRONZE: 10, SILVER: 10, GOLD: 10 }
    );
    assert.ok(err?.includes("10"));
  });
});

describe("getVisitSlotMedalTier", () => {
  it("maps visit numbers to 30/30/40 slots for 40 visits", () => {
    const quotas = calculateMedalQuotas(40);
    assert.equal(getVisitSlotMedalTier(1, quotas), "BRONZE");
    assert.equal(getVisitSlotMedalTier(12, quotas), "BRONZE");
    assert.equal(getVisitSlotMedalTier(13, quotas), "SILVER");
    assert.equal(getVisitSlotMedalTier(24, quotas), "SILVER");
    assert.equal(getVisitSlotMedalTier(25, quotas), "GOLD");
    assert.equal(getVisitSlotMedalTier(40, quotas), "GOLD");
  });
});

describe("getCharacterImageIndex", () => {
  it("maps stage and progress to image 1–16", () => {
    assert.equal(getCharacterImageIndex(1, stats(0)), 1);
    assert.equal(getCharacterImageIndex(1, stats(25)), 2);
    assert.equal(getCharacterImageIndex(1, stats(50)), 3);
    assert.equal(getCharacterImageIndex(1, stats(75)), 4);
    assert.equal(getCharacterImageIndex(2, stats(0)), 5);
    assert.equal(getCharacterImageIndex(3, stats(50)), 12);
    assert.equal(getCharacterImageIndex(4, stats(100)), 16);
  });
});
