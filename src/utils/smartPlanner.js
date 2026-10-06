const PRIORITY_WEIGHT = {
  High: 3,
  Medium: 2,
  Low: 1,
};

const WORKDAY_MINUTES = 24 * 60;

function toMinutes(value) {
  return Number.isFinite(value) ? Number(value) : 0;
}

function normalizePriority(value) {
  return PRIORITY_WEIGHT[value] ? value : "Medium";
}

function parseDayNumber(dateString) {
  if (!dateString) return Number.POSITIVE_INFINITY;
  const date = new Date(`${dateString}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? Number.POSITIVE_INFINITY
    : date.getTime();
}

export function buildSmartDailyPlan({
  today,
  todayDayName,
  topics = [],
  subjects = [],
  timetable = [],
  targets = [],
  sessions = [],
  settings = {},
}) {
  const dailyGoalMinutes = Math.max(
    45,
    Math.round((settings.dailyTargetHours || 4) * 60),
  );
  const scheduled = timetable
    .filter((slot) => slot.day === todayDayName)
    .map((slot) => {
      const subject = subjects.find((item) => item.id === slot.subjectId);
      const topic = topics.find((item) => item.id === slot.topicId);
      const duration = Math.max(15, toMinutes(slot.targetDuration) || 45);
      return {
        id: `scheduled-${slot.id}`,
        source: "scheduled",
        title: topic?.name || subject?.name || "Focused study session",
        subjectId: slot.subjectId || "",
        topicId: slot.topicId || "",
        preparationId: slot.preparationId || "",
        targetDurationMinutes: duration,
        priority: normalizePriority(slot.priority),
        reasons: [
          `Scheduled for ${slot.startTime || "today"}`,
          `Planned for ${Math.round(duration / 60)} hour${duration > 60 ? "s" : ""}`,
        ],
        isReady: true,
      };
    })
    .sort((a, b) => a.targetDurationMinutes - b.targetDurationMinutes);

  const topicCandidates = topics
    .filter(
      (topic) => topic.status !== "Completed" && topic.status !== "Skipped",
    )
    .map((topic) => {
      const targetDateMs = parseDayNumber(topic.targetDate);
      const isOverdue =
        Boolean(topic.targetDate) && targetDateMs < parseDayNumber(today);
      const priorityScore =
        PRIORITY_WEIGHT[normalizePriority(topic.priority)] || 1;
      const completionPenalty = topic.status === "In Progress" ? 1 : 0;
      const recencyScore = sessions.filter(
        (session) => session.topicId === topic.id,
      ).length;
      const duration = Math.max(
        30,
        Math.min(180, toMinutes(topic.estimatedStudyTime) || 60),
      );

      return {
        id: `topic-${topic.id}`,
        source: "topic",
        title: topic.name,
        subjectId: topic.subjectId || "",
        topicId: topic.id,
        preparationId: topic.preparationId || "",
        targetDurationMinutes: duration,
        priority: normalizePriority(topic.priority),
        reasons: [
          isOverdue ? "Topic is overdue" : `${topic.status || "Pending"} topic`,
          `${normalizePriority(topic.priority)} priority`,
          recencyScore > 0 ? "You previously worked on it" : "New focus item",
        ],
        score:
          priorityScore * 100 +
          (isOverdue ? 80 : 0) +
          completionPenalty * 10 -
          recencyScore * 5,
        isReady: true,
      };
    })
    .sort((a, b) => b.score - a.score);

  const targetCandidates = targets
    .filter((target) => target.subjectId || target.topicId)
    .map((target) => {
      const subject = subjects.find((item) => item.id === target.subjectId);
      const topic = topics.find((item) => item.id === target.topicId);
      const duration = Math.max(
        30,
        toMinutes(target.targetDurationMinutes) || 60,
      );
      return {
        id: `target-${target.id}`,
        source: "target",
        title: topic?.name || subject?.name || "Targeted study session",
        subjectId: target.subjectId || "",
        topicId: target.topicId || "",
        preparationId: target.preparationId || "",
        targetDurationMinutes: duration,
        priority: normalizePriority(target.priority),
        reasons: [
          `${normalizePriority(target.priority)} priority target`,
          `Prepared for ${Math.round(duration / 60)} hour${duration > 60 ? "s" : ""}`,
        ],
        score: (PRIORITY_WEIGHT[normalizePriority(target.priority)] || 1) * 90,
        isReady: true,
      };
    })
    .sort((a, b) => b.score - a.score);

  const ranked = [...scheduled, ...topicCandidates, ...targetCandidates]
    .filter((item) => item.isReady)
    .filter(
      (item, index, array) =>
        array.findIndex((candidate) => candidate.id === item.id) === index,
    )
    .sort((a, b) => {
      const sourceOrder = { scheduled: 4, topic: 3, target: 2, fallback: 1 };
      return (
        (sourceOrder[b.source] || 0) - (sourceOrder[a.source] || 0) ||
        b.score - a.score
      );
    });

  const selected = ranked.slice(0, 4);
  const plannedMinutes = selected.reduce(
    (total, item) => total + item.targetDurationMinutes,
    0,
  );
  const remainingMinutes = Math.max(0, dailyGoalMinutes - plannedMinutes);

  if (!selected.length) {
    return [
      {
        id: "fallback-1",
        source: "fallback",
        title: "Start with foundational review",
        subjectId: "",
        topicId: "",
        preparationId: "",
        targetDurationMinutes: 45,
        priority: "High",
        reasons: [
          "No data has been added yet",
          "Build a subject and topic to unlock smarter suggestions",
        ],
        isReady: true,
      },
      {
        id: "fallback-2",
        source: "fallback",
        title: "Create your first study block",
        subjectId: "",
        topicId: "",
        preparationId: "",
        targetDurationMinutes: 45,
        priority: "Medium",
        reasons: ["Schedule a topic or add a study target"],
        isReady: true,
      },
      {
        id: "fallback-3",
        source: "fallback",
        title: "Keep the session short and focused",
        subjectId: "",
        topicId: "",
        preparationId: "",
        targetDurationMinutes: 30,
        priority: "Low",
        reasons: ["Use 25–45 minutes to build momentum"],
        isReady: true,
      },
    ];
  }

  return selected.map((item, index) => ({
    ...item,
    order: index + 1,
    totalPlannedMinutes: plannedMinutes,
    remainingMinutes,
    goalMinutes: dailyGoalMinutes,
  }));
}

export function getSmartPlannerSummary(plan, settings = {}) {
  if (!plan.length) return "No recommendation available yet.";
  const totalMinutes = plan.reduce(
    (sum, item) => sum + item.targetDurationMinutes,
    0,
  );
  const goalMinutes = Math.max(
    60,
    Math.round((settings.dailyTargetHours || 4) * 60),
  );
  const progress = Math.min(
    100,
    Math.round((totalMinutes / goalMinutes) * 100),
  );
  return `${progress}% of your daily goal is covered by ${plan.length} recommended session${plan.length === 1 ? "" : "s"}.`;
}

export function getSmartPlannerWindowMinutes(settings = {}) {
  return Math.min(
    WORKDAY_MINUTES,
    Math.max(30, Math.round((settings.dailyTargetHours || 4) * 60)),
  );
}
