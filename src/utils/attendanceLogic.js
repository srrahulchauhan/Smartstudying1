// Attendance calculation and auto-attendance evaluation

import { getTodayDateString, getDayNameFromDate } from './dateUtils';

export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  PARTIAL: 'PARTIAL',
  HOLIDAY: 'HOLIDAY',
};

/**
 * Recalculate or auto-update attendance for a given date
 * based on sessions logged and timetable scheduled for that day.
 */
export function evaluateAutoAttendance({
  dateStr = getTodayDateString(),
  sessions = [],
  timetable = [],
  currentAttendanceList = [],
  minAttendanceMinutes = 30,
}) {
  const existingRecord = currentAttendanceList.find((a) => a.date === dateStr);

  // If user explicitly marked HOLIDAY manually, preserve it unless cleared
  if (existingRecord && existingRecord.status === ATTENDANCE_STATUS.HOLIDAY && existingRecord.manual) {
    return existingRecord;
  }

  // Calculate total study minutes for this date
  const daySessions = sessions.filter((s) => s.date === dateStr);
  const totalStudySeconds = daySessions.reduce((acc, s) => acc + (s.actualStudyDuration || 0), 0);
  const totalStudyMinutes = Math.floor(totalStudySeconds / 60);

  // Check if today was a scheduled day in timetable
  const dayName = getDayNameFromDate(dateStr);
  const scheduledSlots = timetable.filter((t) => t.day === dayName);
  const isScheduledDay = scheduledSlots.length > 0;

  let status = existingRecord?.status || ATTENDANCE_STATUS.ABSENT;

  if (totalStudyMinutes >= minAttendanceMinutes) {
    status = ATTENDANCE_STATUS.PRESENT;
  } else if (totalStudyMinutes > 0) {
    status = ATTENDANCE_STATUS.PARTIAL;
  } else {
    // 0 minutes studied
    if (isScheduledDay) {
      status = ATTENDANCE_STATUS.ABSENT;
    } else {
      // If not scheduled and no study, it could be Holiday or unmarked
      status = existingRecord ? existingRecord.status : ATTENDANCE_STATUS.ABSENT;
    }
  }

  return {
    id: existingRecord ? existingRecord.id : `att-${dateStr}`,
    date: dateStr,
    status,
    studyMinutes: totalStudyMinutes,
    notes: existingRecord?.notes || `Studied ${totalStudyMinutes} mins (Auto-evaluated)`,
    manual: existingRecord?.manual || false,
  };
}

/**
 * Compute monthly attendance metrics
 */
export function computeAttendanceStats(attendanceList = [], targetMonth = null, targetYear = null) {
  let filtered = attendanceList;
  if (targetMonth !== null && targetYear !== null) {
    filtered = attendanceList.filter((a) => {
      const [y, m] = a.date.split('-').map(Number);
      return y === targetYear && m === targetMonth + 1;
    });
  }

  let presentCount = 0;
  let absentCount = 0;
  let partialCount = 0;
  let holidayCount = 0;

  filtered.forEach((a) => {
    if (a.status === ATTENDANCE_STATUS.PRESENT) presentCount++;
    else if (a.status === ATTENDANCE_STATUS.ABSENT) absentCount++;
    else if (a.status === ATTENDANCE_STATUS.PARTIAL) partialCount++;
    else if (a.status === ATTENDANCE_STATUS.HOLIDAY) holidayCount++;
  });

  const totalActiveDays = presentCount + absentCount + partialCount; // excluding holidays
  // Present counts as 1.0, Partial counts as 0.5 for percentage
  const effectivePresent = presentCount + partialCount * 0.5;
  const attendancePercentage = totalActiveDays > 0 
    ? Math.round((effectivePresent / totalActiveDays) * 100) 
    : 100;

  return {
    presentCount,
    absentCount,
    partialCount,
    holidayCount,
    totalRecorded: filtered.length,
    totalActiveDays,
    attendancePercentage,
  };
}
