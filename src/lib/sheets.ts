import { google } from "googleapis";
import { Patient, PenRecord } from "./types";

const SPREADSHEET_ID = process.env.NEXT_PUBLIC_SPREADSHEET_ID || "";

async function getAuthClient() {
  const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
  if (!credentials) {
    throw new Error("GOOGLE_SHEETS_CREDENTIALS not configured");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(credentials),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return auth.getClient();
}

export async function readPatientsFromSheet(): Promise<Patient[]> {
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: authClient as any });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A1:Z1000",
    });

    const rows = response.data.values || [];
    if (rows.length < 2) return [];

    const patients: Patient[] = [];
    let currentPatient: Patient | null = null;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;

      if (row[0] && row[1]) {
        if (currentPatient) {
          patients.push(currentPatient);
        }

        currentPatient = {
          id: `patient-${row[0]}`,
          no: parseInt(row[0] as string) || i,
          name: row[1] as string,
          dob: row[2] as string,
          program: (row[13] as string) || "Ozempic",
          penRecords: [],
        };

        const penNumber = parseInt((row[14] as string) || "0") || 0;
        currentPatient.penRecords.push({
          penNumber: penNumber as any,
          measurement: {
            weight: parseFloat(row[3] as string) || 0,
            bmi: parseFloat(row[4] as string) || 0,
            fatMass: parseFloat(row[5] as string) || 0,
            muscleMass: parseFloat(row[6] as string) || 0,
            waistCircumference: parseFloat(row[7] as string) || 0,
            hba1c: parseFloat(row[8] as string) || 0,
            totalCholesterol: parseFloat(row[9] as string) || 0,
            hdl: parseFloat(row[10] as string) || 0,
            ldl: parseFloat(row[11] as string) || 0,
            date: (row[12] as string) || new Date().toISOString().split("T")[0],
          },
        });
      } else if (currentPatient && row[14]) {
        const penNumber = parseInt(row[14] as string) || 0;
        currentPatient.penRecords.push({
          penNumber: penNumber as any,
          measurement: {
            weight: parseFloat(row[3] as string) || 0,
            bmi: parseFloat(row[4] as string) || 0,
            fatMass: parseFloat(row[5] as string) || 0,
            muscleMass: parseFloat(row[6] as string) || 0,
            waistCircumference: parseFloat(row[7] as string) || 0,
            hba1c: parseFloat(row[8] as string) || 0,
            totalCholesterol: parseFloat(row[9] as string) || 0,
            hdl: parseFloat(row[10] as string) || 0,
            ldl: parseFloat(row[11] as string) || 0,
            date: (row[12] as string) || new Date().toISOString().split("T")[0],
          },
        });
      }
    }

    if (currentPatient) {
      patients.push(currentPatient);
    }

    return patients;
  } catch (error) {
    console.error("Error reading from Google Sheets:", error);
    return [];
  }
}

export async function writePatientsToSheet(patients: Patient[]): Promise<void> {
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: authClient as any });

    const rows: any[][] = [
      [
        "No",
        "Name",
        "DOB",
        "WT(kg)",
        "BMI",
        "Fat Mass (kg)",
        "Muscle Mass(kg)",
        "Waist Circumference (cm)",
        "HbA1c(%)",
        "Total cholesterol (mmol/L)",
        "HDL",
        "LDL",
        "Date",
        "Programme",
        "Pen Number",
      ],
    ];

    patients.forEach((patient) => {
      patient.penRecords.forEach((record, index) => {
        rows.push([
          index === 0 ? patient.no : "",
          index === 0 ? patient.name : "",
          index === 0 ? patient.dob : "",
          record.measurement.weight,
          record.measurement.bmi,
          record.measurement.fatMass,
          record.measurement.muscleMass,
          record.measurement.waistCircumference,
          record.measurement.hba1c,
          record.measurement.totalCholesterol,
          record.measurement.hdl,
          record.measurement.ldl,
          record.measurement.date,
          index === 0 ? patient.program : "",
          record.penNumber,
        ]);
      });
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A1:O1000",
      valueInputOption: "RAW",
      requestBody: {
        values: rows,
      },
    });
  } catch (error) {
    console.error("Error writing to Google Sheets:", error);
    throw error;
  }
}

export async function appendPatientToSheet(patient: Patient): Promise<void> {
  try {
    const authClient = await getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: authClient as any });

    const rows: any[][] = [];
    patient.penRecords.forEach((record, index) => {
      rows.push([
        index === 0 ? patient.no : "",
        index === 0 ? patient.name : "",
        index === 0 ? patient.dob : "",
        record.measurement.weight,
        record.measurement.bmi,
        record.measurement.fatMass,
        record.measurement.muscleMass,
        record.measurement.waistCircumference,
        record.measurement.hba1c,
        record.measurement.totalCholesterol,
        record.measurement.hdl,
        record.measurement.ldl,
        record.measurement.date,
        index === 0 ? patient.program : "",
        record.penNumber,
      ]);
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A:O",
      valueInputOption: "RAW",
      requestBody: {
        values: rows,
      },
    });
  } catch (error) {
    console.error("Error appending to Google Sheets:", error);
    throw error;
  }
}
