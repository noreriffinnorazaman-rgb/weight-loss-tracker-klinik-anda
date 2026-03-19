"use client";

import { useState, useEffect, use } from "react";
import { ArrowLeft, User, Calendar, Pill } from "lucide-react";
import Link from "next/link";
import { Patient, PenNumber, Measurement, ProgramType } from "@/lib/types";
import { getPatientById, addPenRecord, updatePatientProgram } from "@/lib/store";
import Header from "@/components/Header";
import PenTimeline from "@/components/PenTimeline";
import WeightChart from "@/components/WeightChart";
import BodyCompositionChart from "@/components/BodyCompositionChart";
import HealthMarkersChart from "@/components/HealthMarkersChart";
import WaistChart from "@/components/WaistChart";
import MeasurementTable from "@/components/MeasurementTable";
import PenRecordForm from "@/components/PenRecordForm";

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    getPatientById(id).then((p) => {
      if (p) setPatient(p);
    });
  }, [id]);

  const handleSaveRecord = async (penNumber: PenNumber, measurement: Measurement) => {
    await addPenRecord(id, penNumber, measurement);
    const updated = await getPatientById(id);
    setPatient(updated ?? null);
    setShowForm(false);
  };

  const handleProgramChange = async (program: ProgramType) => {
    await updatePatientProgram(id, program);
    const updated = await getPatientById(id);
    setPatient(updated ?? null);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-slate-500 text-lg">Patient not found</p>
        <Link
          href="/"
          className="text-emerald-600 hover:text-emerald-700 font-semibold"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const baseline = patient.penRecords[0]?.measurement;
  const latest = patient.penRecords[patient.penRecords.length - 1]?.measurement;
  const weightLoss = baseline && latest ? baseline.weight - latest.weight : 0;
  const completedPens = Math.max(0, patient.penRecords.length - 1);
  const nextPen = patient.penRecords.length <= 4 ? patient.penRecords.length : -1;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header showActions={false} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Back button + Patient info */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Link
              href="/"
              className="mt-1 p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {patient.name}
              </h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {patient.dob}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Patient #{patient.no}
                </span>
              </div>
            </div>
          </div>

          {/* Programme selector */}
          <div className="flex items-center gap-2">
            <Pill className="w-4 h-4 text-slate-400" />
            <select
              value={patient.program}
              onChange={(e) =>
                handleProgramChange(e.target.value as ProgramType)
              }
              className="text-sm font-semibold border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none cursor-pointer"
            >
              <option value="Ozempic">Ozempic</option>
              <option value="Wegovy">Wegovy</option>
              <option value="Mounjaro">Mounjaro</option>
            </select>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Starting Weight
            </p>
            <p className="text-xl font-bold text-slate-800 mt-1">
              {baseline?.weight.toFixed(1)} kg
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Current Weight
            </p>
            <p className="text-xl font-bold text-slate-800 mt-1">
              {latest?.weight.toFixed(1)} kg
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Weight Lost
            </p>
            <p
              className={`text-xl font-bold mt-1 ${
                weightLoss > 0 ? "text-emerald-600" : weightLoss < 0 ? "text-red-500" : "text-slate-400"
              }`}
            >
              {weightLoss > 0 ? "-" : weightLoss < 0 ? "+" : ""}
              {Math.abs(weightLoss).toFixed(1)} kg
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Pens Completed
            </p>
            <p className="text-xl font-bold text-slate-800 mt-1">
              {completedPens} / 4
            </p>
          </div>
        </div>

        {/* Pen timeline */}
        <PenTimeline
          patient={patient}
          onAddRecord={() => setShowForm(true)}
        />

        {/* Charts */}
        {patient.penRecords.length >= 1 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeightChart patient={patient} />
              <BodyCompositionChart patient={patient} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WaistChart patient={patient} />
              <HealthMarkersChart patient={patient} />
            </div>
          </>
        )}

        {/* Measurement table */}
        <MeasurementTable patient={patient} />
      </main>

      {/* Pen record form modal */}
      {showForm && nextPen >= 0 && nextPen <= 4 && (
        <PenRecordForm
          patientName={patient.name}
          nextPen={nextPen as PenNumber}
          onClose={() => setShowForm(false)}
          onSave={handleSaveRecord}
        />
      )}
    </div>
  );
}
