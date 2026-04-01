import { Patient, ProgramType, PenNumber, Measurement } from "./types";

const STORAGE_KEY = "klinik-anda-weight-loss-data";
const APPS_SCRIPT_URL =
  process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbyaony637VGduYUBC_VxP-SijfK1ZxZqysvannYcmsGHz22Cj1Scdo6IMB4ha6j9i25BQ/exec";

// ============================================================
// Fallback initial data (only used if Sheets is unreachable)
// ============================================================
const initialPatients: Patient[] = [
  {
    id: "patient-1",
    no: 1,
    name: "Che Azizah bte Hj Ahmad",
    dob: "12th Oct 1968",
    height: 150,
    program: "Ozempic",
    penRecords: [
      {
        penNumber: 0,
        dosage: 0,
        measurement: {
          weight: 64.9, bmi: 28.84, fatMass: 16.9, muscleMass: 18.9,
          waistCircumference: 81.28, hba1c: 7.9, totalCholesterol: 4.35,
          hdl: 1.4, ldl: 2.21, date: "2026-01-15",
        },
      },
    ],
  },
  {
    id: "patient-2",
    no: 2,
    name: "Muhamad Izzat Bin Zulkifli",
    dob: "23rd November 1991",
    height: 170,
    program: "Ozempic",
    penRecords: [
      {
        penNumber: 0,
        dosage: 0,
        measurement: {
          weight: 98.4, bmi: 34, fatMass: 38.9, muscleMass: 23.4,
          waistCircumference: 111.7, hba1c: 5.8, totalCholesterol: 4.95,
          hdl: 0.83, ldl: 3.54, date: "2026-01-15",
        },
      },
    ],
  },
  {
    id: "patient-3",
    no: 3,
    name: "Noreriffin Bin Norazaman",
    dob: "21st Oct 1986",
    height: 168,
    program: "Ozempic",
    penRecords: [
      {
        penNumber: 0,
        dosage: 0,
        measurement: {
          weight: 120.4, bmi: 42.7, fatMass: 53.1, muscleMass: 26.5,
          waistCircumference: 132, hba1c: 5.4, totalCholesterol: 5.93,
          hdl: 1.14, ldl: 4.16, date: "2026-01-15",
        },
      },
    ],
  },
];

// ============================================================
// CORE: Send a write command to Apps Script via GET ?action=save
// This is the RELIABLE method — GET requests follow redirects
// automatically and avoid CORS issues with Apps Script.
// ============================================================
async function sendToSheet(payload: Record<string, unknown>): Promise<boolean> {
  if (!APPS_SCRIPT_URL) return false;

  try {
    const encoded = encodeURIComponent(JSON.stringify(payload));
    const url = `${APPS_SCRIPT_URL}?action=save&data=${encoded}`;

    // GET requests to Apps Script follow 302 redirects cleanly
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
    });

    if (response.ok) {
      const result = await response.json();
      if (result.error) {
        console.error("Apps Script error:", result.error);
        return false;
      }
      console.log("Sheet sync OK:", result);
      return true;
    }
    console.error("Sheet sync failed, status:", response.status);
    return false;
  } catch (error) {
    console.error("Sheet sync error:", error);
    return false;
  }
}

// ============================================================
// Save to localStorage (always, as backup)
// ============================================================
function saveLocal(patients: Patient[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  }
}

function loadLocal(): Patient[] | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

// ============================================================
// READ: Fetch patients from Google Sheets (fallback to local)
// ============================================================
export async function getPatients(): Promise<Patient[]> {
  if (APPS_SCRIPT_URL) {
    try {
      const response = await fetch(APPS_SCRIPT_URL, { redirect: "follow" });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          saveLocal(data); // Keep local in sync
          return data;
        }
      }
    } catch (error) {
      console.error("Fetch from Sheets failed, using local:", error);
    }
  }

  const local = loadLocal();
  if (local && local.length > 0) return local;
  saveLocal(initialPatients);
  return initialPatients;
}

// ============================================================
// ADD PATIENT: Sends to Sheet AND saves locally
// ============================================================
export async function addPatient(
  patient: Omit<Patient, "id" | "no">
): Promise<Patient> {
  // Try to add directly to the spreadsheet first
  const sheetOk = await sendToSheet({
    action: "addPatient",
    patient: {
      name: patient.name,
      dob: patient.dob,
      height: patient.height,
      program: patient.program,
      penRecords: patient.penRecords,
    },
  });

  if (sheetOk) {
    // Re-read from sheet to get the real patient ID assigned by the sheet
    const freshData = await getPatients();
    return freshData[freshData.length - 1];
  }

  // Fallback: save locally
  const patients = loadLocal() || initialPatients;
  const maxNo = patients.reduce((max, p) => Math.max(max, p.no), 0);
  const newPatient: Patient = {
    ...patient,
    id: `patient-${maxNo + 1}`,
    no: maxNo + 1,
  };
  patients.push(newPatient);
  saveLocal(patients);

  // Try full sync in background
  sendToSheet({ action: "writeAll", patients });

  return newPatient;
}

// ============================================================
// ADD PEN RECORD: Sends to Sheet AND saves locally
// ============================================================
export async function addPenRecord(
  patientId: string,
  penNumber: PenNumber,
  measurement: Measurement,
  dosage: number = 0
): Promise<void> {
  // Send directly to sheet — adds a row for this pen
  const sheetOk = await sendToSheet({
    action: "addPenRecord",
    patientId,
    penNumber,
    measurement,
    dosage,
  });

  // Also update local cache
  const patients = (loadLocal() || await getPatients());
  const patient = patients.find((p) => p.id === patientId);
  if (patient) {
    const existingIndex = patient.penRecords.findIndex(
      (r) => r.penNumber === penNumber
    );
    if (existingIndex >= 0) {
      patient.penRecords[existingIndex] = { penNumber, dosage, measurement };
    } else {
      patient.penRecords.push({ penNumber, dosage, measurement });
    }
    patient.penRecords.sort((a, b) => a.penNumber - b.penNumber);
    saveLocal(patients);
  }

  // If sheet write failed, do full sync
  if (!sheetOk) {
    sendToSheet({ action: "writeAll", patients });
  }
}

// ============================================================
// UPDATE PROGRAMME: Sends to Sheet AND saves locally
// ============================================================
export async function updatePatientProgram(
  patientId: string,
  program: ProgramType
): Promise<void> {
  // Send directly to sheet
  const sheetOk = await sendToSheet({
    action: "updateProgram",
    patientId,
    program,
  });

  // Update local
  const patients = (loadLocal() || await getPatients());
  const patient = patients.find((p) => p.id === patientId);
  if (patient) {
    patient.program = program;
    saveLocal(patients);
  }

  if (!sheetOk) {
    sendToSheet({ action: "writeAll", patients });
  }
}

// ============================================================
// DELETE PATIENT: Sends to Sheet AND saves locally
// ============================================================
export async function deletePatient(patientId: string): Promise<void> {
  // Send to sheet
  const sheetOk = await sendToSheet({
    action: "deletePatient",
    patientId,
  });

  // Update local
  const patients = (loadLocal() || await getPatients());
  const filtered = patients.filter((p) => p.id !== patientId);
  filtered.forEach((p, i) => (p.no = i + 1));
  saveLocal(filtered);

  if (!sheetOk) {
    sendToSheet({ action: "writeAll", patients: filtered });
  }
}

// ============================================================
// EDIT PEN RECORD: Update an existing pen record in-place
// ============================================================
export async function editPenRecord(
  patientId: string,
  penNumber: PenNumber,
  measurement: Measurement,
  dosage: number = 0
): Promise<void> {
  // Send editPenRecord to sheet — updates the row in-place
  const sheetOk = await sendToSheet({
    action: "editPenRecord",
    patientId,
    penNumber,
    measurement,
    dosage,
  });

  // Update local cache
  const patients = (loadLocal() || await getPatients());
  const patient = patients.find((p) => p.id === patientId);
  if (patient) {
    const existingIndex = patient.penRecords.findIndex(
      (r) => r.penNumber === penNumber
    );
    if (existingIndex >= 0) {
      patient.penRecords[existingIndex] = { penNumber, dosage, measurement };
    }
    saveLocal(patients);
  }

  if (!sheetOk) {
    sendToSheet({ action: "writeAll", patients });
  }
}

// ============================================================
// DELETE PEN RECORD: Remove a specific pen record (undo)
// ============================================================
export async function deletePenRecord(
  patientId: string,
  penNumber: PenNumber
): Promise<void> {
  const sheetOk = await sendToSheet({
    action: "deletePenRecord",
    patientId,
    penNumber,
  });

  const patients = (loadLocal() || await getPatients());
  const patient = patients.find((p) => p.id === patientId);
  if (patient) {
    patient.penRecords = patient.penRecords.filter(
      (r) => r.penNumber !== penNumber
    );
    saveLocal(patients);
  }

  if (!sheetOk) {
    sendToSheet({ action: "writeAll", patients });
  }
}

// ============================================================
// RESET: Overwrites sheet with initial data
// ============================================================
export async function resetData(): Promise<void> {
  saveLocal(initialPatients);
  await sendToSheet({ action: "writeAll", patients: initialPatients });
}

// ============================================================
// FULL SYNC: Write all local patients to sheet (manual trigger)
// ============================================================
export async function fullSyncToSheet(): Promise<boolean> {
  const patients = loadLocal() || initialPatients;
  return sendToSheet({ action: "writeAll", patients });
}
