// Timestamp-accurate Study and Break Timer calculations

export const TIMER_STATUS = {
  IDLE: 'IDLE',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  BREAK: 'BREAK',
};

/**
 * Format milliseconds to standard clock "HH:MM:SS"
 */
export function formatMsToHMS(ms) {
  if (!ms || ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    String(hours).padStart(2, '0'),
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ].join(':');
}

/**
 * Format seconds to standard clock "HH:MM:SS"
 */
export function formatSecondsToHMS(seconds) {
  return formatMsToHMS((seconds || 0) * 1000);
}

/**
 * Format seconds to friendly short string "1h 40m" or "25m" or "0m"
 */
export function formatSecondsToShort(seconds) {
  if (!seconds || seconds <= 0) return '0m';
  const totalMinutes = Math.floor(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

/**
 * Format minutes to friendly short string "1h 30m"
 */
export function formatMinutesToShort(minutes) {
  return formatSecondsToShort((minutes || 0) * 60);
}

/**
 * Format hours decimal (e.g. 2.5) to "2h 30m"
 */
export function formatHoursToShort(hoursDecimal) {
  if (!hoursDecimal || hoursDecimal <= 0) return '0h';
  const totalMinutes = Math.round(hoursDecimal * 60);
  return formatMinutesToShort(totalMinutes);
}

/**
 * Computes exact live timings for an active session using timestamps.
 * 
 * Session structure:
 * {
 *   status: 'RUNNING' | 'PAUSED' | 'BREAK',
 *   sessionStartTime: timestamp,
 *   accumulatedStudyMs: number, // study ms accumulated before last resume
 *   lastResumeTime: timestamp | null,
 *   accumulatedBreakMs: number, // break ms accumulated before current break
 *   currentBreakStartTime: timestamp | null,
 * }
 */
export function calculateLiveTimings(session, now = Date.now()) {
  if (!session || session.status === TIMER_STATUS.IDLE || !session.sessionStartTime) {
    return {
      totalSessionMs: 0,
      breakMs: 0,
      netStudyMs: 0,
      currentBreakDurationMs: 0,
    };
  }

  // 1. Total session duration since initial START
  const totalSessionMs = Math.max(0, now - session.sessionStartTime);

  // 2. Break duration
  let breakMs = session.accumulatedBreakMs || 0;
  let currentBreakDurationMs = 0;
  if (session.status === TIMER_STATUS.BREAK && session.currentBreakStartTime) {
    currentBreakDurationMs = Math.max(0, now - session.currentBreakStartTime);
    breakMs += currentBreakDurationMs;
  }

  // 3. Net study time
  let netStudyMs = session.accumulatedStudyMs || 0;
  if (session.status === TIMER_STATUS.RUNNING && session.lastResumeTime) {
    const currentRunMs = Math.max(0, now - session.lastResumeTime);
    netStudyMs += currentRunMs;
  }

  // Ensure logical boundary: study time cannot exceed session time - break time
  const maxPossibleStudyMs = Math.max(0, totalSessionMs - breakMs);
  netStudyMs = Math.min(netStudyMs, maxPossibleStudyMs);

  return {
    totalSessionMs,
    breakMs,
    netStudyMs,
    currentBreakDurationMs,
  };
}
