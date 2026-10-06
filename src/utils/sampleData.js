// Clean default dataset for StudyFlow - Smart Study Tracker
// All pre-existing sample/demo records removed for a fresh workspace

export const initialPreparations = [];

export const initialSubjects = [];

export const initialTopics = [];

export const initialTimetable = [];

export const initialStudySessions = [];

export const initialAttendance = [];

export const initialGoals = [];

export const initialTargets = {
  daily: {
    targetHours: 4,
    subjectDistribution: [],
  },
  tomorrow: [],
  weekly: {
    targetHours: 25,
    dailyPlan: {
      Monday: 4,
      Tuesday: 4,
      Wednesday: 4,
      Thursday: 4,
      Friday: 4,
      Saturday: 4,
      Sunday: 1,
    },
  },
  monthly: {
    month: "",
    year: 2026,
    targetHours: 100,
  },
};

export const initialSettings = {
  dailyTargetHours: 4,
  minAttendanceMinutes: 30,
  defaultSessionMinutes: 45,
  pomodoro: {
    studyMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    cyclesBeforeLongBreak: 4,
  },
  breakReasons: ["Tea", "Food", "Rest", "Phone", "Personal", "Other"],
  soundEnabled: true,
  theme: "dark", // 'dark' | 'light'
  timeFormat: "12h", // '12h' | '24h'
  weekStartDay: "Monday", // 'Monday' | 'Sunday'
  browserNotifications: false,
  googleSheetsSyncEnabled: false,
  googleSheetsSyncUrl: "",
  googleSheetsSyncKey: "",
};

export const initialNotifications = [];
