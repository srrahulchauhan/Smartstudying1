import assert from "node:assert/strict";
import test from "node:test";
import { buildSmartDailyPlan } from "./smartPlanner.js";

const today = "2026-10-07";

test("prioritizes overdue high-priority topics and explains the ranking", () => {
  const plan = buildSmartDailyPlan({
    today,
    todayDayName: "Wednesday",
    topics: [
      {
        id: "t-low",
        name: "Low priority topic",
        priority: "Low",
        status: "Pending",
        targetDate: "2026-10-09",
        estimatedStudyTime: 90,
      },
      {
        id: "t-overdue",
        name: "Overdue physics",
        priority: "High",
        status: "Pending",
        targetDate: "2026-10-03",
        estimatedStudyTime: 60,
      },
      {
        id: "t-medium",
        name: "Medium topic",
        priority: "Medium",
        status: "In Progress",
        targetDate: "2026-10-08",
        estimatedStudyTime: 45,
      },
    ],
    subjects: [],
    timetable: [],
    targets: [],
    sessions: [],
    settings: { dailyTargetHours: 2 },
  });

  assert.equal(plan[0].topicId, "t-overdue");
  assert.match(plan[0].reasons.join(" "), /overdue|High/i);
  assert.equal(plan[0].targetDurationMinutes, 60);
});

test("keeps scheduled timetable slots first and uses their duration", () => {
  const plan = buildSmartDailyPlan({
    today,
    todayDayName: "Wednesday",
    topics: [
      {
        id: "t-1",
        name: "Topic one",
        priority: "High",
        status: "Pending",
        estimatedStudyTime: 120,
      },
    ],
    subjects: [{ id: "s-1", name: "Math", preparationId: "p-1" }],
    timetable: [
      {
        id: "slot-1",
        day: "Wednesday",
        startTime: "18:00",
        endTime: "19:00",
        targetDuration: 60,
        subjectId: "s-1",
        topicId: "t-1",
        priority: "High",
      },
    ],
    targets: [],
    sessions: [],
    settings: { dailyTargetHours: 3 },
  });

  assert.equal(plan[0].source, "scheduled");
  assert.equal(plan[0].targetDurationMinutes, 60);
  assert.equal(plan[0].title, "Topic one");
});

test("creates a useful fallback plan when there is no study data", () => {
  const plan = buildSmartDailyPlan({
    today,
    todayDayName: "Wednesday",
    topics: [],
    subjects: [],
    timetable: [],
    targets: [],
    sessions: [],
    settings: { dailyTargetHours: 2 },
  });

  assert.equal(plan.length, 3);
  assert.equal(plan[0].source, "fallback");
  assert.equal(plan[0].targetDurationMinutes, 45);
});
