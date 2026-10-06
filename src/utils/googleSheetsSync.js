const DEFAULT_SYNC_URL = "";

function safeJsonValue(value) {
  if (value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    return Array.isArray(value)
      ? value.map((item) => safeJsonValue(item))
      : Object.fromEntries(
          Object.entries(value).flatMap(([key, entry]) =>
            entry === undefined ? [] : [[key, safeJsonValue(entry)]],
          ),
        );
  }
  return value;
}

export function buildGoogleSheetsPayload(data, clientId = "local-user") {
  const safeData = {
    preparations: Array.isArray(data.preparations) ? data.preparations : [],
    subjects: Array.isArray(data.subjects) ? data.subjects : [],
    topics: Array.isArray(data.topics) ? data.topics : [],
    timetable: Array.isArray(data.timetable) ? data.timetable : [],
    sessions: Array.isArray(data.sessions) ? data.sessions : [],
    attendance: Array.isArray(data.attendance) ? data.attendance : [],
    goals: Array.isArray(data.goals) ? data.goals : [],
    targets:
      data.targets && typeof data.targets === "object" ? data.targets : {},
    settings:
      data.settings && typeof data.settings === "object" ? data.settings : {},
    notifications: Array.isArray(data.notifications)
      ? data.notifications
      : null,
  };

  return {
    clientId,
    meta: {
      version: "1.0.0",
      syncedAt: new Date().toISOString(),
      source: "studyflow-web",
    },
    data: safeJsonValue(safeData),
  };
}

export async function syncToGoogleSheets({
  data,
  clientId,
  syncUrl = DEFAULT_SYNC_URL,
  syncKey = "",
  timeoutMs = 15000,
}) {
  if (!syncUrl) {
    throw new Error(
      "Google Sheets sync endpoint is not configured. Add your Apps Script web URL in Settings.",
    );
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(syncUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(syncKey ? { "X-Sync-Key": syncKey } : {}),
      },
      body: JSON.stringify(buildGoogleSheetsPayload(data, clientId)),
      mode: "cors",
      credentials: "omit",
      signal: controller.signal,
    });

    if (!response.ok) {
      const message = `Google Sheets sync failed with status ${response.status}`;
      throw new Error(message);
    }

    let result;
    try {
      result = await response.json();
    } catch {
      result = {};
    }

    return {
      success: true,
      message: result.message || "Data saved to Google Sheets.",
      rowCount: result.rowCount || 0,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Google Sheets sync timed out. Please try again.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}
