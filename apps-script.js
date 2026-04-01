// Google Apps Script for Weight Loss Tracker - Klinik Anda Kangar 2026
// Deploy this as a Web App to handle Google Sheets operations
//
// SPREADSHEET COLUMNS (A-P):
// A: No | B: Name | C: DOB | D: WT(kg) | E: BMI | F: Fat Mass (kg) | G: Muscle Mass(kg)
// H: Waist Circumference (cm) | I: HbA1c(%) | J: Total cholesterol (mmol/L)
// K: HDL | L: LDL | M: Date | N: Programme | O: Pen Number | P: Height (cm)

var SPREADSHEET_ID = '1eq_mwt8gzjeLamRLv76l_nBB-wu4zNJjhZ6at3FTXnA';
var SHEET_NAME = 'Sheet1';
var NUM_COLS = 16;

// ============================================================
// doGet: READ patients or handle action via URL params
// ============================================================
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'read';

    if (action === 'ping') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
    }

    if (action === 'save') {
      var jsonData = e.parameter.data;
      if (!jsonData) return jsonResponse({ error: 'Missing data parameter' });
      var payload = JSON.parse(decodeURIComponent(jsonData));
      return handleWrite(payload);
    }

    var patients = readPatients();
    return jsonResponse(patients);
  } catch (error) {
    return jsonResponse({ error: error.toString() });
  }
}

// ============================================================
// doPost: WRITE operations via POST body
// ============================================================
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    return handleWrite(data);
  } catch (error) {
    return jsonResponse({ error: error.toString() });
  }
}

// ============================================================
// Unified write handler
// ============================================================
function handleWrite(data) {
  if (!data || !data.action) {
    return jsonResponse({ error: 'Missing action field' });
  }

  if (data.action === 'writeAll') {
    writeAllPatients(data.patients || []);
    return jsonResponse({ success: true, action: 'writeAll', count: (data.patients || []).length, timestamp: new Date().toISOString() });
  }

  if (data.action === 'addPatient') {
    var r1 = addSinglePatient(data.patient);
    return jsonResponse(r1);
  }

  if (data.action === 'addPenRecord') {
    var r2 = addPenRecordToSheet(data.patientId, data.penNumber, data.measurement);
    return jsonResponse(r2);
  }

  if (data.action === 'deletePatient') {
    deletePatientById(data.patientId);
    return jsonResponse({ success: true, action: 'deletePatient' });
  }

  if (data.action === 'updateProgram') {
    updatePatientProgram(data.patientId, data.program);
    return jsonResponse({ success: true, action: 'updateProgram' });
  }

  if (data.action === 'deletePenRecord') {
    deletePenRecordFromSheet(data.patientId, data.penNumber);
    return jsonResponse({ success: true, action: 'deletePenRecord' });
  }

  return jsonResponse({ error: 'Unknown action: ' + data.action });
}

// ============================================================
// Helper: Return JSON
// ============================================================
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// READ: Parse all patients from spreadsheet
// ============================================================
function readPatients() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  if (data.length <= 1) return [];

  var patients = {};
  var lastPatientId = null;
  var patientOrder = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row) continue;

    var isEmpty = true;
    for (var c = 0; c < row.length; c++) {
      if (row[c] !== '' && row[c] !== null && row[c] !== undefined) { isEmpty = false; break; }
    }
    if (isEmpty) continue;

    var noVal = row[0];
    var hasNo = (noVal !== '' && noVal !== null && noVal !== undefined && !isNaN(parseFloat(noVal)));
    var patientId;

    if (hasNo) {
      patientId = 'patient-' + parseInt(noVal);
      lastPatientId = patientId;
    } else if (lastPatientId) {
      patientId = lastPatientId;
    } else {
      continue;
    }

    var weight = parseFloat(row[3]) || 0;
    if (weight === 0) continue;

    if (!patients[patientId]) {
      patients[patientId] = {
        id: patientId,
        no: parseInt(noVal) || (patientOrder.length + 1),
        name: String(row[1] || '').trim(),
        dob: String(row[2] || '').trim(),
        height: parseFloat(row[15]) || 0,
        program: String(row[13] || 'Ozempic').trim(),
        penRecords: []
      };
      patientOrder.push(patientId);
    }

    patients[patientId].penRecords.push({
      penNumber: parseInt(row[14]) || 0,
      measurement: {
        weight: weight,
        bmi: parseFloat(row[4]) || 0,
        fatMass: parseFloat(row[5]) || 0,
        muscleMass: parseFloat(row[6]) || 0,
        waistCircumference: parseFloat(row[7]) || 0,
        hba1c: parseFloat(row[8]) || 0,
        totalCholesterol: parseFloat(row[9]) || 0,
        hdl: parseFloat(row[10]) || 0,
        ldl: parseFloat(row[11]) || 0,
        date: row[12] ? String(row[12]) : ''
      }
    });
  }

  var result = [];
  for (var k = 0; k < patientOrder.length; k++) {
    var p = patients[patientOrder[k]];
    p.penRecords.sort(function(a, b) { return a.penNumber - b.penNumber; });
    result.push(p);
  }
  result.sort(function(a, b) { return a.no - b.no; });

  return result;
}

// ============================================================
// WRITE ALL: Full overwrite of spreadsheet
// ============================================================
function writeAllPatients(patients) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);

  var header = [
    'No', 'Name', 'DOB', 'WT(kg)', 'BMI', 'Fat Mass (kg)', 'Muscle Mass(kg)',
    'Waist Circumference (cm)', 'HbA1c(%)', 'Total cholesterol (mmol/L)',
    'HDL', 'LDL', 'Date', 'Programme', 'Pen Number', 'Height (cm)'
  ];

  sheet.clear();
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
  sheet.getRange(1, 1, 1, header.length)
    .setFontWeight('bold')
    .setBackground('#e8f5e9')
    .setHorizontalAlignment('center');

  var rows = [];
  for (var pi = 0; pi < patients.length; pi++) {
    var patient = patients[pi];
    if (!patient.penRecords || patient.penRecords.length === 0) continue;

    for (var ri = 0; ri < patient.penRecords.length; ri++) {
      var m = patient.penRecords[ri].measurement || {};
      rows.push([
        ri === 0 ? (patient.no || pi + 1) : '',
        ri === 0 ? (patient.name || '') : '',
        ri === 0 ? (patient.dob || '') : '',
        m.weight || '', m.bmi || '', m.fatMass || '', m.muscleMass || '',
        m.waistCircumference || '', m.hba1c || '', m.totalCholesterol || '',
        m.hdl || '', m.ldl || '', m.date || '',
        ri === 0 ? (patient.program || 'Ozempic') : '',
        patient.penRecords[ri].penNumber !== undefined ? patient.penRecords[ri].penNumber : 0,
        ri === 0 ? (patient.height || 0) : ''
      ]);
    }
  }

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, NUM_COLS).setValues(rows);
  }

  SpreadsheetApp.flush();
}

// ============================================================
// ADD PATIENT: Append new patient row to sheet
// ============================================================
function addSinglePatient(patient) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);

  var data = sheet.getDataRange().getValues();
  var maxNo = 0;
  for (var i = 1; i < data.length; i++) {
    var no = parseInt(data[i][0]);
    if (!isNaN(no) && no > maxNo) maxNo = no;
  }

  var newNo = maxNo + 1;
  var m = (patient.penRecords && patient.penRecords[0]) ? patient.penRecords[0].measurement : {};

  var row = [
    newNo,
    patient.name || '',
    patient.dob || '',
    m.weight || 0, m.bmi || 0, m.fatMass || 0, m.muscleMass || 0,
    m.waistCircumference || 0, m.hba1c || 0, m.totalCholesterol || 0,
    m.hdl || 0, m.ldl || 0,
    m.date || new Date().toISOString().split('T')[0],
    patient.program || 'Ozempic',
    0,
    patient.height || 0
  ];

  sheet.appendRow(row);
  SpreadsheetApp.flush();

  return {
    success: true,
    action: 'addPatient',
    patient: {
      id: 'patient-' + newNo,
      no: newNo,
      name: patient.name,
      dob: patient.dob,
      height: patient.height || 0,
      program: patient.program || 'Ozempic',
      penRecords: [{ penNumber: 0, measurement: m }]
    }
  };
}

// ============================================================
// ADD PEN RECORD: Insert a new pen measurement row for a patient
// ============================================================
function addPenRecordToSheet(patientId, penNumber, measurement) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  var patientNo = parseInt(patientId.replace('patient-', ''));
  if (isNaN(patientNo)) {
    return { success: false, error: 'Invalid patient ID: ' + patientId };
  }

  var lastRowIndex = -1;
  var currentPatientNo = null;
  for (var i = 1; i < data.length; i++) {
    var cellNo = data[i][0];
    if (cellNo !== '' && cellNo !== null && cellNo !== undefined && !isNaN(parseFloat(cellNo))) {
      currentPatientNo = parseInt(cellNo);
    }
    if (currentPatientNo === patientNo) {
      lastRowIndex = i;
    }
  }

  if (lastRowIndex === -1) {
    return { success: false, error: 'Patient not found: ' + patientId };
  }

  var m = measurement || {};
  var newRow = [
    '', '', '',
    m.weight || 0, m.bmi || 0, m.fatMass || 0, m.muscleMass || 0,
    m.waistCircumference || 0, m.hba1c || 0, m.totalCholesterol || 0,
    m.hdl || 0, m.ldl || 0,
    m.date || new Date().toISOString().split('T')[0],
    '',
    penNumber || 0,
    ''
  ];

  sheet.insertRowAfter(lastRowIndex + 1);
  sheet.getRange(lastRowIndex + 2, 1, 1, NUM_COLS).setValues([newRow]);
  SpreadsheetApp.flush();

  return { success: true, action: 'addPenRecord', patientId: patientId, penNumber: penNumber };
}

// ============================================================
// DELETE PEN RECORD: Remove a specific pen record row (undo)
// ============================================================
function deletePenRecordFromSheet(patientId, penNumber) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  var patientNo = parseInt(patientId.replace('patient-', ''));
  if (isNaN(patientNo)) return;

  var currentPatientNo = null;
  for (var i = 1; i < data.length; i++) {
    var cellNo = data[i][0];
    if (cellNo !== '' && cellNo !== null && cellNo !== undefined && !isNaN(parseFloat(cellNo))) {
      currentPatientNo = parseInt(cellNo);
    }
    if (currentPatientNo === patientNo) {
      var rowPen = parseInt(data[i][14]);
      if (rowPen === penNumber && penNumber > 0) {
        sheet.deleteRow(i + 1);
        SpreadsheetApp.flush();
        return;
      }
    }
  }
}

// ============================================================
// DELETE PATIENT: Remove all rows for a patient and rewrite
// ============================================================
function deletePatientById(patientId) {
  var patients = readPatients();
  var filtered = [];
  for (var i = 0; i < patients.length; i++) {
    if (patients[i].id !== patientId) {
      patients[i].no = filtered.length + 1;
      filtered.push(patients[i]);
    }
  }
  writeAllPatients(filtered);
}

// ============================================================
// UPDATE PROGRAMME: Change a patient's programme
// ============================================================
function updatePatientProgram(patientId, program) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  var patientNo = parseInt(patientId.replace('patient-', ''));
  if (isNaN(patientNo)) return;

  for (var i = 1; i < data.length; i++) {
    var cellNo = data[i][0];
    if (cellNo !== '' && cellNo !== null && cellNo !== undefined && parseInt(cellNo) === patientNo) {
      sheet.getRange(i + 1, 14).setValue(program);
      SpreadsheetApp.flush();
      return;
    }
  }
}

// ============================================================
// SETUP: Run once to add Height column and missing columns
// ============================================================
function setupSpreadsheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  if (data.length === 0) return;

  var fullHeader = [
    'No', 'Name', 'DOB', 'WT(kg)', 'BMI', 'Fat Mass (kg)', 'Muscle Mass(kg)',
    'Waist Circumference (cm)', 'HbA1c(%)', 'Total cholesterol (mmol/L)',
    'HDL', 'LDL', 'Date', 'Programme', 'Pen Number', 'Height (cm)'
  ];

  sheet.getRange(1, 1, 1, fullHeader.length).setValues([fullHeader]);

  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      if (!data[i][12]) sheet.getRange(i + 1, 13).setValue(new Date().toISOString().split('T')[0]);
      if (!data[i][13]) sheet.getRange(i + 1, 14).setValue('Ozempic');
      if (data[i][14] === '' || data[i][14] === null || data[i][14] === undefined) {
        sheet.getRange(i + 1, 15).setValue(0);
      }
      if (data[i][15] === '' || data[i][15] === null || data[i][15] === undefined) {
        sheet.getRange(i + 1, 16).setValue(0);
      }
    }
  }

  sheet.getRange(1, 1, 1, fullHeader.length)
    .setFontWeight('bold')
    .setBackground('#e8f5e9');

  SpreadsheetApp.flush();
  Logger.log('Setup complete. Columns: ' + fullHeader.length);
}

// ============================================================
// TEST functions
// ============================================================
function testReadPatients() {
  var patients = readPatients();
  Logger.log('Found ' + patients.length + ' patients');
  Logger.log(JSON.stringify(patients, null, 2));
}

function testConnection() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();
  Logger.log('Rows: ' + data.length + ', Cols: ' + (data[0] ? data[0].length : 0));
}
