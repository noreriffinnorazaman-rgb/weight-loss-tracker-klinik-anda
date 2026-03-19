// Google Apps Script for Weight Loss Tracker - Klinik Anda Kangar 2026
// Deploy this as a Web App to handle Google Sheets operations
//
// IMPORTANT: All WRITE operations use doPost with JSON body.
// The frontend must send POST with redirect:"follow" to handle Apps Script 302 redirect.
//
// SPREADSHEET COLUMNS (A-O):
// A: No | B: Name | C: DOB | D: WT(kg) | E: BMI | F: Fat Mass (kg) | G: Muscle Mass(kg)
// H: Waist Circumference (cm) | I: HbA1c(%) | J: Total cholesterol (mmol/L)
// K: HDL | L: LDL | M: Date | N: Programme | O: Pen Number

var SPREADSHEET_ID = '1eq_mwt8gzjeLamRLv76l_nBB-wu4zNJjhZ6at3FTXnA';
var SHEET_NAME = 'Sheet1';

// ============================================================
// doGet: READ patients or handle action via URL params
// ============================================================
function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'read';

    if (action === 'ping') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // WRITE via GET (reliable for cross-origin) — data passed as encoded JSON in ?data= param
    if (action === 'save') {
      var jsonData = e.parameter.data;
      if (!jsonData) return jsonResponse({ error: 'Missing data parameter' });
      var payload = JSON.parse(decodeURIComponent(jsonData));
      return handleWrite(payload);
    }

    // Default: read all patients
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
// Unified write handler for both GET?action=save and POST
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
    var result = addSinglePatient(data.patient);
    return jsonResponse(result);
  }

  if (data.action === 'addPenRecord') {
    var result2 = addPenRecordToSheet(data.patientId, data.penNumber, data.measurement);
    return jsonResponse(result2);
  }

  if (data.action === 'deletePatient') {
    deletePatientById(data.patientId);
    return jsonResponse({ success: true, action: 'deletePatient' });
  }

  if (data.action === 'updateProgram') {
    updatePatientProgram(data.patientId, data.program);
    return jsonResponse({ success: true, action: 'updateProgram' });
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

    // Check if row is completely empty
    var isEmpty = true;
    for (var c = 0; c < row.length; c++) {
      if (row[c] !== '' && row[c] !== null && row[c] !== undefined) { isEmpty = false; break; }
    }
    if (isEmpty) continue;

    // Determine patient: col A has a number = new patient, empty = continuation
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
    'HDL', 'LDL', 'Date', 'Programme', 'Pen Number'
  ];

  // Clear everything
  sheet.clear();

  // Write header
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
        patient.penRecords[ri].penNumber !== undefined ? patient.penRecords[ri].penNumber : 0
      ]);
    }
  }

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 15).setValues(rows);
  }
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
    0
  ];

  sheet.appendRow(row);

  // Force spreadsheet to save
  SpreadsheetApp.flush();

  return {
    success: true,
    action: 'addPatient',
    patient: {
      id: 'patient-' + newNo,
      no: newNo,
      name: patient.name,
      dob: patient.dob,
      program: patient.program || 'Ozempic',
      penRecords: [{ penNumber: 0, measurement: m }]
    }
  };
}

// ============================================================
// ADD PEN RECORD: Append a new pen measurement row for an existing patient
// ============================================================
function addPenRecordToSheet(patientId, penNumber, measurement) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  // Find the patient number from the ID (e.g. "patient-3" => 3)
  var patientNo = parseInt(patientId.replace('patient-', ''));
  if (isNaN(patientNo)) {
    return { success: false, error: 'Invalid patient ID: ' + patientId };
  }

  // Find the last row belonging to this patient
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
    '',  // No column empty for continuation rows
    '',  // Name empty
    '',  // DOB empty
    m.weight || 0, m.bmi || 0, m.fatMass || 0, m.muscleMass || 0,
    m.waistCircumference || 0, m.hba1c || 0, m.totalCholesterol || 0,
    m.hdl || 0, m.ldl || 0,
    m.date || new Date().toISOString().split('T')[0],
    '',  // Programme empty for continuation
    penNumber || 0
  ];

  // Insert after the last row of this patient
  sheet.insertRowAfter(lastRowIndex + 1);
  sheet.getRange(lastRowIndex + 2, 1, 1, 15).setValues([newRow]);

  SpreadsheetApp.flush();

  return { success: true, action: 'addPenRecord', patientId: patientId, penNumber: penNumber };
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
  SpreadsheetApp.flush();
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
      sheet.getRange(i + 1, 14).setValue(program);  // Column N = Programme
      SpreadsheetApp.flush();
      return;
    }
  }
}

// ============================================================
// SETUP: Run once to add missing Date/Programme/PenNumber columns
// ============================================================
function setupSpreadsheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  if (data.length === 0) return;

  var fullHeader = [
    'No', 'Name', 'DOB', 'WT(kg)', 'BMI', 'Fat Mass (kg)', 'Muscle Mass(kg)',
    'Waist Circumference (cm)', 'HbA1c(%)', 'Total cholesterol (mmol/L)',
    'HDL', 'LDL', 'Date', 'Programme', 'Pen Number'
  ];

  if (data[0].length < fullHeader.length) {
    sheet.getRange(1, 1, 1, fullHeader.length).setValues([fullHeader]);

    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) {
        if (!data[i][12]) sheet.getRange(i + 1, 13).setValue(new Date().toISOString().split('T')[0]);
        if (!data[i][13]) sheet.getRange(i + 1, 14).setValue('Ozempic');
        if (data[i][14] === '' || data[i][14] === null || data[i][14] === undefined) {
          sheet.getRange(i + 1, 15).setValue(0);
        }
      }
    }

    sheet.getRange(1, 1, 1, fullHeader.length)
      .setFontWeight('bold')
      .setBackground('#e8f5e9');

    SpreadsheetApp.flush();
  }

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

function testAddPatient() {
  var result = addSinglePatient({
    name: 'Test Patient',
    dob: '1st Jan 2000',
    program: 'Ozempic',
    penRecords: [{
      penNumber: 0,
      measurement: { weight: 80, bmi: 25, fatMass: 20, muscleMass: 30, waistCircumference: 90, hba1c: 5.5, totalCholesterol: 4.0, hdl: 1.2, ldl: 2.5, date: '2026-03-20' }
    }]
  });
  Logger.log(JSON.stringify(result));
}

function testAddPenRecord() {
  var result = addPenRecordToSheet('patient-1', 1, {
    weight: 63, bmi: 28, fatMass: 15, muscleMass: 19, waistCircumference: 79, hba1c: 7.5, totalCholesterol: 4.2, hdl: 1.5, ldl: 2.1, date: '2026-03-20'
  });
  Logger.log(JSON.stringify(result));
}
