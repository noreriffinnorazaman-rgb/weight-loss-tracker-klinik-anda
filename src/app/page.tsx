"use client";

import { useState, useEffect, useCallback } from "react";
import { Patient, ProgramType, PenNumber, Measurement } from "@/lib/types";
import {
  getPatients,
  addPatient,
  deletePatient,
  resetData,
  addPenRecord,
  updatePatientProgram,
} from "@/lib/store";
import { ArrowLeft, User, Calendar, Pill } from "lucide-react";
import Header from "@/components/Header";
import StatsCards from "@/components/StatsCards";
import PatientTable from "@/components/PatientTable";
import AddPatientModal from "@/components/AddPatientModal";
import PenTimeline from "@/components/PenTimeline";
import WeightChart from "@/components/WeightChart";
import BodyCompositionChart from "@/components/BodyCompositionChart";
import HealthMarkersChart from "@/components/HealthMarkersChart";
import WaistChart from "@/components/WaistChart";
import MeasurementTable from "@/components/MeasurementTable";
import PenRecordForm from "@/components/PenRecordForm";

export default function Home() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const refresh = useCallback(async () => {
    const data = await getPatients();
    setPatients(data);
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh();
  }, [refresh]);

  const handleAddPatient = async (data: {
    name: string;
    dob: string;
    program: ProgramType;
    baseline: Measurement;
  }) => {
    await addPatient({
      name: data.name,
      dob: data.dob,
      program: data.program,
      penRecords: [
        {
          penNumber: 0,
          measurement: data.baseline,
        },
      ],
    });
    await refresh();
    setShowAddModal(false);
  };

  const handleDelete = async (id: string) => {
    await deletePatient(id);
    await refresh();
  };

  const handleReset = async () => {
    if (
      confirm(
        "Reset all data to original? This will remove all progress records."
      )
    ) {
      await resetData();
      await refresh();
    }
  };

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    window.scrollTo(0, 0);
  };

  const handleBackToDashboard = () => {
    setSelectedPatientId(null);
    refresh();
  };

  const handleSaveRecord = async (penNumber: PenNumber, measurement: Measurement) => {
    if (!selectedPatientId) return;
    await addPenRecord(selectedPatientId, penNumber, measurement);
    await refresh();
    setShowForm(false);
  };

  const handleProgramChange = async (program: ProgramType) => {
    if (!selectedPatientId) return;
    await updatePatientProgram(selectedPatientId, program);
    await refresh();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || null;

  // Patient Detail View
  if (selectedPatient) {
    const baseline = selectedPatient.penRecords[0]?.measurement;
    const latest = selectedPatient.penRecords[selectedPatient.penRecords.length - 1]?.measurement;
    const weightLoss = baseline && latest ? baseline.weight - latest.weight : 0;
    const completedPens = Math.max(0, selectedPatient.penRecords.length - 1);
    const nextPen = selectedPatient.penRecords.length <= 4 ? selectedPatient.penRecords.length : -1;

    return (
      <div className="min-h-screen bg-slate-50">
        <Header showActions={false} />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Back button + Patient info */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <button
                onClick={handleBackToDashboard}
                className="mt-1 p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-slate-500" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {selectedPatient.name}
                </h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedPatient.dob}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    Patient #{selectedPatient.no}
                  </span>
                </div>
              </div>
            </div>

            {/* Programme selector */}
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-slate-400" />
              <select
                value={selectedPatient.program}
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
            patient={selectedPatient}
            onAddRecord={() => setShowForm(true)}
          />

          {/* Charts */}
          {selectedPatient.penRecords.length >= 1 && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WeightChart patient={selectedPatient} />
                <BodyCompositionChart patient={selectedPatient} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WaistChart patient={selectedPatient} />
                <HealthMarkersChart patient={selectedPatient} />
              </div>
            </>
          )}

          {/* Measurement table */}
          <MeasurementTable patient={selectedPatient} />
        </main>

        {/* Pen record form modal */}
        {showForm && nextPen >= 0 && nextPen <= 4 && (
          <PenRecordForm
            patientName={selectedPatient.name}
            nextPen={nextPen as PenNumber}
            onClose={() => setShowForm(false)}
            onSave={handleSaveRecord}
          />
        )}
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        onAddPatient={() => setShowAddModal(true)}
        onReset={handleReset}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <StatsCards patients={patients} />
        <PatientTable patients={patients} onDelete={handleDelete} onSelect={handleSelectPatient} />
      </main>

      {showAddModal && (
        <AddPatientModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddPatient}
        />
      )}
    </div>
  );
}
