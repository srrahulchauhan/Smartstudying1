function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const data = payload.data;
    const clientId = payload.clientId || 'unknown';
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let rowCount = 0;
    
    // Process each main array in the data object
    const arraysToSync = ['preparations', 'subjects', 'topics', 'timetable', 'sessions', 'attendance', 'goals'];
    
    for (const key of arraysToSync) {
      if (data[key] && Array.isArray(data[key])) {
        // Ensure sheet exists
        let sheet = ss.getSheetByName(key);
        if (!sheet) {
          sheet = ss.insertSheet(key);
        }
        
        // Clear existing data (for simplicity, we do a full replace)
        sheet.clear();
        
        const items = data[key];
        if (items.length > 0) {
          // Get headers from first object
          const headers = Object.keys(items[0]);
          sheet.appendRow(headers);
          
          // Add rows
          const rows = items.map(item => {
            return headers.map(h => {
              const val = item[h];
              return (typeof val === 'object') ? JSON.stringify(val) : val;
            });
          });
          
          sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
          rowCount += rows.length;
        }
      }
    }
    
    // Also save settings and targets in a generic "meta_data" sheet
    let metaSheet = ss.getSheetByName("meta_data");
    if (!metaSheet) {
      metaSheet = ss.insertSheet("meta_data");
    }
    metaSheet.clear();
    metaSheet.appendRow(["Key", "Value"]);
    metaSheet.appendRow(["settings", JSON.stringify(data.settings || {})]);
    metaSheet.appendRow(["targets", JSON.stringify(data.targets || {})]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Data successfully synced to Google Sheets",
      rowCount: rowCount
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle preflight OPTIONS request
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
