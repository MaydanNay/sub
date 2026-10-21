import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { PatientRewardTrigger, RehabStage } from "@prisma/client";

const TRIGGER_STAGE: Record<PatientRewardTrigger, RehabStage | null> = {
  STAGE_1: "STAGE_1",
  STAGE_2: "STAGE_2",
  STAGE_3: "STAGE_3",
  STAGE_4: "STAGE_4",
  COURSE_COMPLETE: null,
};

const STAGE_ORDER: Record<RehabStage, number> = {
  STAGE_1: 1,
  STAGE_2: 2,
  STAGE_3: 3,
  STAGE_4: 4,
};

function isRewardEligible(
  trigger: PatientRewardTrigger,
  stage: RehabStage,
  courseCompleted: boolean
) {
  if (trigger === "COURSE_COMPLETE") return courseCompleted;
  if (trigger === "STAGE_4") return stage === "STAGE_4";
  const required = TRIGGER_STAGE[trigger];
  if (!required) return false;
  return STAGE_ORDER[stage] > STAGE_ORDER[required];
}

describe("isRewardEligible", () => {
  it("does not grant stage-1 prize while patient is still on stage 1", () => {
    assert.equal(isRewardEligible("STAGE_1", "STAGE_1", false), false);
  });

  it("grants stage-1 prize after advancing to stage 2", () => {
    assert.equal(isRewardEligible("STAGE_1", "STAGE_2", false), true);
  });

  it("grants stage-4 prize when patient reaches stage 4", () => {
    assert.equal(isRewardEligible("STAGE_4", "STAGE_4", false), true);
  });

  it("grants course-complete prize only after course completion", () => {
    assert.equal(isRewardEligible("COURSE_COMPLETE", "STAGE_4", false), false);
    assert.equal(isRewardEligible("COURSE_COMPLETE", "STAGE_4", true), true);
  });
});
