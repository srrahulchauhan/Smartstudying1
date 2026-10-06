// Google Apps Script backend for StudyFlow.
// 1. Open https://script.google.com
// 2. Create a new project and replace its default code with this file.
// 3. Set the spreadsheet ID below and deploy as a Web App.
// 4. Copy the Web App URL into StudyFlow Settings -> Live Google Sheets Sync.

const SPREADSHEET_ID = '1ZnbGK9DTsMzD0nz2mWyGMtXHCUnb1AGM_LTrXSxF110';
const SYNC_KEY = '';

function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getSheet(spreadsheet, sheetName) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }
  return sheet;
}

function ensureHeaders(sheet, headers) {
  const existing = sheet.getDataRange().getValues();
  if (!existing.length) {
    sheet.appendRow(headers);
    return;
  }

  const firstRow = existing[0];
  headers.forEach((header, index) => {
    if (firstRow[index] !== header) {
      firstRow[index] = header;
    }
  });

  if (firstRow.join('|') !== headers.join('|')) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function normalizeRows(rows, headers) {
  return rows.map((row) => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index] ?? '';
    });
    return item;
  });
}

function recordDataset(sheet, datasetName, rows, headers) {
  const existing = sheet.getDataRange().getValues();
  const headerRow = existing[0] || headers;
  const currentHeaders = headerRow.length ? headerRow : headers;

  ensureHeaders(sheet, currentHeaders);

  const startRow = existing.length ? 2 : 2;
  const startColumn = 1;
  sheet.getRange(startRow, startColumn, Math.max(0, existing.length - 1), currentHeaders.length).clearContent();

  const normalizedRows = rows.map((row) =>
    headers.map((header) => {
      const value = row?.[header];
      return typeof value === 'undefined' ? '' : JSON.stringify(value);
    }),
  );

  if (normalizedRows.length) {
    sheet.getRange(startRow, startColumn, normalizedRows.length, headers.length).setValues(normalizedRows);
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const syncKey = e.headers && e.headers['x-sync-key'];

    if (SYNC_KEY && syncKey !== SYNC_KEY) {
      return jsonResponse({ success: false, message: 'Unauthorized' }, 401);
    }

    const spreadsheet = getSpreadsheet();
    const datasetNames = [
      'Preparations',
      'Subjects',
      'Topics',
      'Timetable',
      'Sessions',
      'Attendance',
      'Goals',
      'Targets',
      'Settings',
      'Notifications',
    ];

    let rowCount = 0;
    datasetNames.forEach((name) => {
      const rows = payload.data?.[name.toLowerCase()] || [];
      const safeHeaders = ['id', 'name', 'status', 'updatedAt', 'data'];
      const sheet = getSheet(spreadsheet, name);
      const values = rows.map((row) => ({
        id: row.id || '',
        name: row.name || row.title || '',
        status: row.status || '',
        updatedAt: row.updatedAt || '',
        data: JSON.stringify(row),
      }));

      if (values.length) {
        const rowsToWrite = values.map((item) => safeHeaders.map((header) => item[header] || ''));
        sheet.clearContents();
        sheet.appendRow(safeHeaders);
        sheet.getRange(2, 1, rowsToWrite.length, safeHeaders.length).setValues(rowsToWrite);
        rowCount += values.length;
      } else {
        sheet.clearContents();
        sheet.appendRow(safeHeaders);
      }
    });

    return jsonResponse({
      success: true,
      message: 'Data saved to Google Sheets.',
      rowCount,
    });
  } catch (error) {
    return jsonResponse({
      success: false,
      message: error.message,
    }, 500);
  }
}

function jsonResponse(body, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON)
    .setStatusCode(statusCode || 200);
}

function doGet() {
  return jsonResponse({
    success: true,
    message: 'StudyFlow Google Sheets sync service is running.',
  });
}
