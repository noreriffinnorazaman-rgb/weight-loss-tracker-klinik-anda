export type ProgramType = "Ozempic" | "Wegovy" | "Mounjaro";

export type PenNumber = 0 | 1 | 2 | 3 | 4;

export interface Measurement {
  weight: number;
  bmi: number;
  fatMass: number;
  muscleMass: number;
  waistCircumference: number;
  hba1c: number;
  totalCholesterol: number;
  hdl: number;
  ldl: number;
  date: string;
}

export interface PenRecord {
  penNumber: PenNumber;
  measurement: Measurement;
}

export interface Patient {
  id: string;
  no: number;
  name: string;
  dob: string;
  program: ProgramType;
  penRecords: PenRecord[];
}
