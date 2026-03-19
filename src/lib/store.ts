import { Patient, ProgramType, PenNumber, Measurement } from "./types";

const STORAGE_KEY = "klinik-anda-weight-loss-data";
const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || "";

const initialPatients: Patient[] = [
  {
    id: "patient-1",
    no: 1,
    name: "Che Azizah bte Hj Ahmad",
    dob: "12th Oct 1968",
    program: "Ozempic",
    penRecords: [
      {
        penNumber: 0,
        measurement: {
          weight: 64.9,
          bmi: 28.84,
          fatMass: 16.9,
          muscleMass: 18.9,
          waistCircumference: 81.28,
          hba1c: 7.9,
          totalCholesterol: 4.35,
          hdl: 1.4,
          ldl: 2.21,
          date: "2026-01-15",
        },
      },
    ],
  },
  {
    id: "patient-2",
    no: 2,
    name: "Muhamad Izzat Bin Zulkifli",
    dob: "23rd November 1991",
    program: "Ozempic",
    penRecords: [
      {
        penNumber: 0,
        measurement: {
          weight: 98.4,
          bmi: 34,
          fatMass: 38.9,
          muscleMass: 23.4,
          waistCircumference: 111.7,
          hba1c: 5.8,
          totalCholesterol: 4.95,
          hdl: 0.83,
          ldl: 3.54,
          date: "2026-01-15",
        },
      },
    ],
  },
  {
    id: "patient-3",
    no: 3,
    name: "Noreriffin Bin Norazaman",
    dob: "21st Oct 1986",
    program: "Ozempic",
    penRecords: [
      {
        penNumber: 0,
        measurement: {
          weight: 120.4,
          bmi: 42.7,
          fatMass: 53.1,
          muscleMass: 26.5,
          waistCircumference: 132,
          hba1c: 5.4,
          totalCholesterol: 5.93,
          hdl: 1.14,
          ldl: 4.16,
          date: "2026-01-15",
        },
      },
    ],
  },
];

export async function getPatients(): Promise<Patient[]> {
  if (APPS_SCRIPT_URL) {
    try {
      const response = await fetch(APPS_SCRIPT_URL);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (error) {
      console.error("Error fetching from Apps Script, using localStorage:", error);
    }
  }

  if (typeof window === "undefined") return initialPatients;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPatients));
    return initialPatients;
  }
  return JSON.parse(stored);
}

export async function savePatients(patients: Patient[]): Promise<void> {
  if (APPS_SCRIPT_URL) {
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "write", patients }),
      });
    } catch (error) {
      console.error("Error saving to Apps Script:", error);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
  }
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  const patients = await getPatients();
  return patients.find((p) => p.id === id);
}

export async function addPatient(patient: Omit<Patient, "id" | "no">): Promise<Patient> {
  const patients = await getPatients();
  const newPatient: Patient = {
    ...patient,
    id: `patient-${Date.now()}`,
    no: patients.length + 1,
  };
  patients.push(newPatient);
  await savePatients(patients);
  return newPatient;
}

export async function addPenRecord(
  patientId: string,
  penNumber: PenNumber,
  measurement: Measurement
): Promise<void> {
  const patients = await getPatients();
  const patient = patients.find((p) => p.id === patientId);
  if (!patient) return;

  const existingIndex = patient.penRecords.findIndex(
    (r) => r.penNumber === penNumber
  );
  if (existingIndex >= 0) {
    patient.penRecords[existingIndex] = { penNumber, measurement };
  } else {
    patient.penRecords.push({ penNumber, measurement });
  }

  patient.penRecords.sort((a, b) => a.penNumber - b.penNumber);
  await savePatients(patients);
}

export async function updatePatientProgram(
  patientId: string,
  program: ProgramType
): Promise<void> {
  const patients = await getPatients();
  const patient = patients.find((p) => p.id === patientId);
  if (!patient) return;
  patient.program = program;
  await savePatients(patients);
}

export async function deletePatient(patientId: string): Promise<void> {
  const patients = await getPatients();
  const filtered = patients.filter((p) => p.id !== patientId);
  filtered.forEach((p, i) => (p.no = i + 1));
  await savePatients(filtered);
}

export async function resetData(): Promise<void> {
  await savePatients(initialPatients);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPatients));
  }
}
