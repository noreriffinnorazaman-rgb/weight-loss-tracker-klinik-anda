// Google Apps Script for Weight Loss Tracker
// Deploy this as a Web App to handle Google Sheets operations

const SPREADSHEET_ID = '1H6_GeohQiH3ye0QrgYKMUu7BaWvERx6Y';
const SHEET_NAME = 'Sheet1';

// Handle GET requests - Read all patients
function doGet(e) {
  try {
    const patients = readPatients();
    return ContentService.createTextOutput(JSON.stringify(patients))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle POST requests - Write patients data
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'write') {
      writePatients(data.patients);
      return ContentService.createTextOutput(JSON.stringify({ success: true }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Read all patients from spreadsheet
function readPatients() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return [];
  }
  
  const patients = {};
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    const patientId = row[0] ? `patient-${row[0]}` : null;
    if (!patientId) continue;
    
    const name = row[1] || '';
    const dob = row[2] || '';
    const weight = parseFloat(row[3]) || 0;
    const bmi = parseFloat(row[4]) || 0;
    const fatMass = parseFloat(row[5]) || 0;
    const muscleMass = parseFloat(row[6]) || 0;
    const waistCircumference = parseFloat(row[7]) || 0;
    const hba1c = parseFloat(row[8]) || 0;
    const totalCholesterol = parseFloat(row[9]) || 0;
    const hdl = parseFloat(row[10]) || 0;
    const ldl = parseFloat(row[11]) || 0;
    const date = row[12] || '';
    const programme = row[13] || 'Ozempic';
    const penNumber = parseInt(row[14]) || 0;
    
    // Initialize patient if not exists
    if (!patients[patientId]) {
      patients[patientId] = {
        id: patientId,
        no: parseInt(row[0]),
        name: name,
        dob: dob,
        program: programme,
        penRecords: []
      };
    }
    
    // Add pen record
    patients[patientId].penRecords.push({
      penNumber: penNumber,
      measurement: {
        weight: weight,
        bmi: bmi,
        fatMass: fatMass,
        muscleMass: muscleMass,
        waistCircumference: waistCircumference,
        hba1c: hba1c,
        totalCholesterol: totalCholesterol,
        hdl: hdl,
        ldl: ldl,
        date: date
      }
    });
  }
  
  // Convert to array and sort pen records
  const patientArray = Object.values(patients);
  patientArray.forEach(patient => {
    patient.penRecords.sort((a, b) => a.penNumber - b.penNumber);
  });
  
  return patientArray;
}

// Write all patients to spreadsheet
function writePatients(patients) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  // Clear existing data (keep header)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  
  // Prepare rows
  const rows = [];
  
  patients.forEach(patient => {
    patient.penRecords.forEach(record => {
      const m = record.measurement;
      rows.push([
        patient.no,
        patient.name,
        patient.dob,
        m.weight,
        m.bmi,
        m.fatMass,
        m.muscleMass,
        m.waistCircumference,
        m.hba1c,
        m.totalCholesterol,
        m.hdl,
        m.ldl,
        m.date,
        patient.program,
        record.penNumber
      ]);
    });
  });
  
  // Write rows
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 15).setValues(rows);
  }
}

// Test function - run this to verify setup
function testReadPatients() {
  const patients = readPatients();
  Logger.log(JSON.stringify(patients, null, 2));
}
