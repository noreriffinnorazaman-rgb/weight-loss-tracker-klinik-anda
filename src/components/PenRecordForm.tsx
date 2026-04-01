"use client";

import { useState } from "react";
import { X, Syringe } from "lucide-react";
import { PenNumber, PenRecord, Measurement } from "@/lib/types";

interface PenRecordFormProps {
  patientName: string;
  patientHeight: number;
  nextPen: PenNumber;
  onClose: () => void;
  onSave: (penNumber: PenNumber, measurement: Measurement, dosage: number) => void;
  editRecord?: PenRecord; // if provided, form is in edit mode
}

function calcBmi(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm) return 0;
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(2));
}

export default function PenRecordForm({
  patientName,
  patientHeight,
  nextPen,
  onClose,
  onSave,
  editRecord,
}: PenRecordFormProps) {
  const isEdit = !!editRecord;
  const em = editRecord?.measurement;
  const [weight, setWeight] = useState(em ? String(em.weight) : "");
  const [dosage, setDosage] = useState(editRecord ? String(editRecord.dosage || "") : "");
  const [fatMass, setFatMass] = useState(em ? String(em.fatMass) : "");
  const [muscleMass, setMuscleMass] = useState(em ? String(em.muscleMass) : "");
  const [waist, setWaist] = useState(em ? String(em.waistCircumference) : "");
  const [hba1c, setHba1c] = useState(em ? String(em.hba1c) : "");
  const [cholesterol, setCholesterol] = useState(em ? String(em.totalCholesterol) : "");
  const [hdl, setHdl] = useState(em ? String(em.hdl) : "");
  const [ldl, setLdl] = useState(em ? String(em.ldl) : "");
  const [date, setDate] = useState(em?.date || new Date().toISOString().split("T")[0]);

  const autoBmi = calcBmi(parseFloat(weight) || 0, patientHeight);
  const activePen = isEdit ? editRecord.penNumber : nextPen;
  const penLabel = activePen === 0 ? "Baseline" : `Pen ${activePen}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(activePen as PenNumber, {
      weight: parseFloat(weight) || 0,
      bmi: autoBmi,
      fatMass: parseFloat(fatMass) || 0,
      muscleMass: parseFloat(muscleMass) || 0,
      waistCircumference: parseFloat(waist) || 0,
      hba1c: parseFloat(hba1c) || 0,
      totalCholesterol: parseFloat(cholesterol) || 0,
      hdl: parseFloat(hdl) || 0,
      ldl: parseFloat(ldl) || 0,
      date,
    }, parseFloat(dosage) || 0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 rounded-lg p-2">
              <Syringe className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isEdit ? `Edit ${penLabel} Data` : `Record ${penLabel} Data`}
              </h2>
              <p className="text-sm text-slate-500">{patientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date of Measurement
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Dosage (mg) *
              </label>
              <input
                type="number"
                step="0.25"
                required
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                placeholder="e.g. 0.25, 0.5, 1.0"
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">
              Measurements after {penLabel}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  BMI (auto)
                </label>
                <div className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm font-semibold text-slate-700">
                  {autoBmi > 0 ? autoBmi.toFixed(2) : "—"}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Fat Mass (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fatMass}
                  onChange={(e) => setFatMass(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Muscle Mass (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={muscleMass}
                  onChange={(e) => setMuscleMass(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Waist (cm)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  HbA1c (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={hba1c}
                  onChange={(e) => setHba1c(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  Total Cholesterol
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={cholesterol}
                  onChange={(e) => setCholesterol(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  HDL
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={hdl}
                  onChange={(e) => setHdl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  LDL
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={ldl}
                  onChange={(e) => setLdl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              {isEdit ? `Update ${penLabel}` : `Save ${penLabel} Record`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
