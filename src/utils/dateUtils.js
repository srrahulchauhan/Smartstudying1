// Utility functions for dates, times, streaks, and calendar grids

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString() {
  const d = new Date();
  return formatDateToISO(d);
}

/**
 * Format any Date object to YYYY-MM-DD
 */
export function formatDateToISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date string (YYYY-MM-DD) to friendly format: '16 Sep 2026'
 */
export function formatFriendlyDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()].slice(0, 3);
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format date string to full day format: 'Monday, 16 Sep 2026'
 */
export function formatFullDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dayName = getDayNameFromDate(date);
  return `${dayName}, ${formatFriendlyDate(dateStr)}`;
}

/**
 * Get day name from Date object or ISO string (e.g. 'Monday')
 */
export function getDayNameFromDate(dateOrStr) {
  const date = typeof dateOrStr === 'string' 
    ? new Date(dateOrStr.includes('T') ? dateOrStr : `${dateOrStr}T00:00:00`)
    : dateOrStr;
  const dayIndex = date.getDay(); // 0 is Sunday, 1 is Monday
  // Remap to Monday-based (0=Monday ... 6=Sunday)
  const remappedIndex = dayIndex === 0 ? 6 : dayIndex - 1;
  return DAYS_OF_WEEK[remappedIndex];
}

/**
 * Format 24-hour time string '19:30' or '07:30' to 12-hour format '07:30 PM'
 */
export function formatTimeString(timeStr, format12h = true) {
  if (!timeStr) return '';
  if (!format12h) return timeStr;
  const [hoursStr, minsStr] = timeStr.split(':');
  let hours = parseInt(hoursStr, 10);
  const mins = minsStr || '00';
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // '0' should be '12'
  return `${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
}

/**
 * Format JS Date or timestamp to local time string (HH:MM AM/PM)
 */
export function formatTimeFromTimestamp(timestamp, format12h = true) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  let hours = date.getHours();
  const mins = String(date.getMinutes()).padStart(2, '0');
  if (!format12h) {
    return `${String(hours).padStart(2, '0')}:${mins}`;
  }
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${String(hours).padStart(2, '0')}:${mins} ${ampm}`;
}

/**
 * Get date string for tomorrow
 */
export function getTomorrowDateString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return formatDateToISO(d);
}

/**
 * Get date string for yesterday
 */
export function getYesterdayDateString() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateToISO(d);
}

/**
 * Get dates in current week (Monday to Sunday)
 */
export function getCurrentWeekDates(weekStartOnSunday = false) {
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
  
  let diff;
  if (weekStartOnSunday) {
    diff = now.getDate() - currentDay;
  } else {
    diff = now.getDate() - (currentDay === 0 ? 6 : currentDay - 1);
  }
  
  const startOfWeek = new Date(now.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    dates.push({
      dateStr: formatDateToISO(day),
      dayName: getDayNameFromDate(day),
      dayNumber: day.getDate(),
      month: day.getMonth(),
      year: day.getFullYear(),
      isToday: formatDateToISO(day) === getTodayDateString(),
    });
  }
  return dates;
}

/**
 * Generates month calendar grid cells with padding for previous/next months
 */
export function getMonthCalendarCells(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Day of week for first day (0=Sunday, 1=Monday... we want Monday as index 0)
  let startDayOfWeek = firstDay.getDay();
  startDayOfWeek = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const totalDaysInMonth = lastDay.getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  const cells = [];

  // Previous month padding days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i;
    const prevDate = new Date(year, month - 1, dayNum);
    cells.push({
      dateStr: formatDateToISO(prevDate),
      dayNumber: dayNum,
      isCurrentMonth: false,
      isToday: formatDateToISO(prevDate) === getTodayDateString(),
    });
  }

  // Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push({
      dateStr: formatDateToISO(date),
      dayNumber: d,
      isCurrentMonth: true,
      isToday: formatDateToISO(date) === getTodayDateString(),
    });
  }

  // Next month padding to fill a complete 35 or 42 grid
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let n = 1; n <= remainingCells; n++) {
    const nextDate = new Date(year, month + 1, n);
    cells.push({
      dateStr: formatDateToISO(nextDate),
      dayNumber: n,
      isCurrentMonth: false,
      isToday: formatDateToISO(nextDate) === getTodayDateString(),
    });
  }

  return cells;
}

/**
 * Calculates current study streak & longest study streak
 * based on days where total study time meets minimum attendance duration.
 */
export function calculateStudyStreaks(sessions = [], minStudyMinutes = 30) {
  // Aggregate daily study minutes
  const dailyStudyMinutes = {};
  sessions.forEach((s) => {
    if (s.date && s.actualStudyDuration) {
      dailyStudyMinutes[s.date] = (dailyStudyMinutes[s.date] || 0) + (s.actualStudyDuration / 60);
    }
  });

  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();

  // Check if today or yesterday qualifies
  const todayStudied = (dailyStudyMinutes[todayStr] || 0) >= minStudyMinutes;
  const yesterdayStudied = (dailyStudyMinutes[yesterdayStr] || 0) >= minStudyMinutes;

  // If neither today nor yesterday has qualified study time, current streak is 0
  let currentStreak = 0;
  let checkDate = new Date();

  // If today hasn't met target yet, but yesterday did, streak is still active from yesterday
  if (!todayStudied && yesterdayStudied) {
    checkDate.setDate(checkDate.getDate() - 1);
  } else if (!todayStudied && !yesterdayStudied) {
    currentStreak = 0;
  }

  if (todayStudied || yesterdayStudied) {
    while (true) {
      const dateStr = formatDateToISO(checkDate);
      const minutes = dailyStudyMinutes[dateStr] || 0;
      if (minutes >= minStudyMinutes) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak across all recorded days
  const sortedDates = Object.keys(dailyStudyMinutes)
    .filter((d) => dailyStudyMinutes[d] >= minStudyMinutes)
    .sort();

  let longestStreak = 0;
  let runningStreak = 0;
  let prevDate = null;

  sortedDates.forEach((dateStr) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const currentDate = new Date(y, m - 1, d);

    if (!prevDate) {
      runningStreak = 1;
    } else {
      const diffDays = Math.round((currentDate - prevDate) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        runningStreak++;
      } else {
        runningStreak = 1;
      }
    }
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
    prevDate = currentDate;
  });

  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    isTodayStudied: todayStudied,
  };
}
