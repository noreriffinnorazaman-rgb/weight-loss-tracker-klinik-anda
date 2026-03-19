// Google Apps Script for Weight Loss Tracker - Klinik Anda Kangar 2026
// Deploy this as a Web App to handle Google Sheets operations
// 
// SPREADSHEET COLUMNS (A-O):
// A: No | B: Name | C: DOB | D: WT(kg) | E: BMI | F: Fat Mass (kg) | G: Muscle Mass(kg)
// H: Waist Circumference (cm) | I: HbA1c(%) | J: Total cholesterol (mmol/L)
// K: HDL | L: LDL | M: Date | N: Programme | O: Pen Number

const SPREADSHEET_ID = '1eq_mwt8gzjeLamRLv76l_nBB-wu4zNJjhZ6at3FTXnA';
const SHEET_NAME = 'Sheet1';

// Column indices (0-based)
const COL = {
  NO: 0, NAME: 1, DOB: 2, WEIGHT: 3, BMI: 4, FAT_MASS: 5, MUSCLE_MASS: 6,
  WAIST: 7, HBA1C: 8, CHOLESTEROL: 9, HDL: 10, LDL: 11, DATE: 12,
  PROGRAMME: 13, PEN_NUMBER: 14
};

// Handle GET requests - Read all patients
function doGet(e) {
  try {
    const action = e && e.parameter && e.parameter.action ? e.parameter.action : 'read';
    
    if (action === 'ping') {
      return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
    }
    
    const patients = readPatients();
    return jsonResponse(patients);
  } catch (error) {
    return jsonResponse({ error: error.message });
  }
}

// Handle POST requests - Write patients data
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'write') {
      writePatients(data.patients);
      return jsonResponse({ success: true, count: data.patients.length, timestamp: new Date().toISOString() });
    }
    
    if (data.action === 'addPatient') {
      return jsonResponse(addSinglePatient(data.patient));
    }
    
    if (data.action === 'deletePatient') {
      deletePatientById(data.patientId);
      return jsonResponse({ success: true });
    }
    
    return jsonResponse({ error: 'Invalid action. Use: write, addPatient, deletePatient' });
  } catch (error) {
    return jsonResponse({ error: error.message });
  }
}

// Helper: Return JSON response with CORS headers
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Read all patients from spreadsheet
function readPatients() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return [];
  
  const patients = {};
  let lastPatientId = null;
  
  // Skip header row (row 0)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.every(cell => cell === '' || cell === null || cell === undefined)) continue;
    
    // Determine patient ID: if col A has a number, it's a new patient
    // If col A is empty but other data exists, it's a continuation (pen record) of the last patient
    const hasNo = row[COL.NO] !== '' && row[COL.NO] !== null && row[COL.NO] !== undefined;
    let patientId;
    
    if (hasNo) {
      patientId = `patient-${row[COL.NO]}`;
      lastPatientId = patientId;
    } else if (lastPatientId) {
      patientId = lastPatientId;
    } else {
      continue;
    }
    
    const weight = parseFloat(row[COL.WEIGHT]) || 0;
    if (weight === 0) continue; // Skip rows with no weight data
    
    // Initialize patient if first time seeing this ID
    if (!patients[patientId]) {
      patients[patientId] = {
        id: patientId,
        no: parseInt(row[COL.NO]) || Object.keys(patients).length + 1,
        name: String(row[COL.NAME] || '').trim(),
        dob: String(row[COL.DOB] || '').trim(),
        program: String(row[COL.PROGRAMME] || 'Ozempic').trim(),
        penRecords: []
      };
    }
    
    // Build measurement
    const measurement = {
      weight: weight,
      bmi: parseFloat(row[COL.BMI]) || 0,
      fatMass: parseFloat(row[COL.FAT_MASS]) || 0,
      muscleMass: parseFloat(row[COL.MUSCLE_MASS]) || 0,
      waistCircumference: parseFloat(row[COL.WAIST]) || 0,
      hba1c: parseFloat(row[COL.HBA1C]) || 0,
      totalCholesterol: parseFloat(row[COL.CHOLESTEROL]) || 0,
      hdl: parseFloat(row[COL.HDL]) || 0,
      ldl: parseFloat(row[COL.LDL]) || 0,
      date: row[COL.DATE] ? String(row[COL.DATE]) : ''
    };
    
    const penNumber = parseInt(row[COL.PEN_NUMBER]) || 0;
    
    patients[patientId].penRecords.push({
      penNumber: penNumber,
      measurement: measurement
    });
  }
  
  // Convert to array, sort pen records, and sort patients by no
  const patientArray = Object.values(patients);
  patientArray.forEach(p => {
    p.penRecords.sort((a, b) => a.penNumber - b.penNumber);
  });
  patientArray.sort((a, b) => a.no - b.no);
  
  return patientArray;
}

// Write all patients to spreadsheet (full overwrite)
function writePatients(patients) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  // Ensure header row exists with full columns
  const header = [
    'No', 'Name', 'DOB', 'WT(kg)', 'BMI', 'Fat Mass (kg)', 'Muscle Mass(kg)',
    'Waist Circumference (cm)', 'HbA1c(%)', 'Total cholesterol (mmol/L)',
    'HDL', 'LDL', 'Date', 'Programme', 'Pen Number'
  ];
  
  // Clear all data
  sheet.clear();
  
  // Write header with formatting
  sheet.getRange(1, 1, 1, header.length).setValues([header]);
  sheet.getRange(1, 1, 1, header.length)
    .setFontWeight('bold')
    .setBackground('#e8f5e9')
    .setHorizontalAlignment('center');
  
  // Prepare data rows
  const rows = [];
  
  patients.forEach((patient, pIdx) => {
    if (!patient.penRecords || patient.penRecords.length === 0) return;
    
    patient.penRecords.forEach((record, rIdx) => {
      const m = record.measurement || {};
      rows.push([
        rIdx === 0 ? (patient.no || pIdx + 1) : '',
        rIdx === 0 ? (patient.name || '') : '',
        rIdx === 0 ? (patient.dob || '') : '',
        m.weight || '',
        m.bmi || '',
        m.fatMass || '',
        m.muscleMass || '',
        m.waistCircumference || '',
        m.hba1c || '',
        m.totalCholesterol || '',
        m.hdl || '',
        m.ldl || '',
        m.date || '',
        rIdx === 0 ? (patient.program || 'Ozempic') : '',
        record.penNumber !== undefined ? record.penNumber : 0
      ]);
    });
  });
  
  // Write all data rows at once
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 15).setValues(rows);
  }
  
  // Auto-resize columns
  for (let i = 1; i <= 15; i++) {
    sheet.autoResizeColumn(i);
  }
}

// Add a single patient (append to sheet)
function addSinglePatient(patient) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  // Find next patient number
  const data = sheet.getDataRange().getValues();
  let maxNo = 0;
  for (let i = 1; i < data.length; i++) {
    const no = parseInt(data[i][COL.NO]);
    if (no > maxNo) maxNo = no;
  }
  
  const newNo = maxNo + 1;
  const m = patient.penRecords[0].measurement;
  
  const row = [
    newNo,
    patient.name,
    patient.dob,
    m.weight, m.bmi, m.fatMass, m.muscleMass, m.waistCircumference,
    m.hba1c, m.totalCholesterol, m.hdl, m.ldl,
    m.date || new Date().toISOString().split('T')[0],
    patient.program || 'Ozempic',
    0
  ];
  
  sheet.appendRow(row);
  
  return {
    success: true,
    patient: {
      id: `patient-${newNo}`,
      no: newNo,
      name: patient.name,
      dob: patient.dob,
      program: patient.program || 'Ozempic',
      penRecords: patient.penRecords
    }
  };
}

// Delete patient by ID
function deletePatientById(patientId) {
  const patients = readPatients();
  const filtered = patients.filter(p => p.id !== patientId);
  filtered.forEach((p, i) => { p.no = i + 1; });
  writePatients(filtered);
}

// Setup: Run this once to add header columns if missing
function setupSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  if (data.length === 0) return;
  
  const currentHeader = data[0];
  const fullHeader = [
    'No', 'Name', 'DOB', 'WT(kg)', 'BMI', 'Fat Mass (kg)', 'Muscle Mass(kg)',
    'Waist Circumference (cm)', 'HbA1c(%)', 'Total cholesterol (mmol/L)',
    'HDL', 'LDL', 'Date', 'Programme', 'Pen Number'
  ];
  
  // Only add missing columns
  if (currentHeader.length < fullHeader.length) {
    // Update header row
    sheet.getRange(1, 1, 1, fullHeader.length).setValues([fullHeader]);
    
    // For existing data rows, fill in defaults for new columns
    for (let i = 1; i < data.length; i++) {
      if (data[i][COL.NO]) {
        // Set default Date column
        if (!data[i][COL.DATE]) {
          sheet.getRange(i + 1, COL.DATE + 1).setValue(new Date().toISOString().split('T')[0]);
        }
        // Set default Programme
        if (!data[i][COL.PROGRAMME]) {
          sheet.getRange(i + 1, COL.PROGRAMME + 1).setValue('Ozempic');
        }
        // Set default Pen Number (0 = baseline)
        if (!data[i][COL.PEN_NUMBER] && data[i][COL.PEN_NUMBER] !== 0) {
          sheet.getRange(i + 1, COL.PEN_NUMBER + 1).setValue(0);
        }
      }
    }
    
    // Format header
    sheet.getRange(1, 1, 1, fullHeader.length)
      .setFontWeight('bold')
      .setBackground('#e8f5e9');
    
    for (let i = 1; i <= fullHeader.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }
  
  Logger.log('Setup complete. Header now has ' + fullHeader.length + ' columns.');
}

// Test function - run this to verify setup
function testReadPatients() {
  const patients = readPatients();
  Logger.log('Found ' + patients.length + ' patients');
  Logger.log(JSON.stringify(patients, null, 2));
}

// Test function - verify spreadsheet connection
function testConnection() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  Logger.log('Rows: ' + data.length);
  Logger.log('Columns: ' + (data[0] ? data[0].length : 0));
  Logger.log('Header: ' + data[0]);
}
