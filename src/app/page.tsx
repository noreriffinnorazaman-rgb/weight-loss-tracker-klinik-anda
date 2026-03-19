"use client";

import { useState, useEffect, useCallback } from "react";
import { Patient, ProgramType, Measurement } from "@/lib/types";
import {
  getPatients,
  addPatient,
  deletePatient,
  resetData,
} from "@/lib/store";
import Header from "@/components/Header";
import StatsCards from "@/components/StatsCards";
import PatientTable from "@/components/PatientTable";
import AddPatientModal from "@/components/AddPatientModal";

export default function Home() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        onAddPatient={() => setShowAddModal(true)}
        onReset={handleReset}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <StatsCards patients={patients} />
        <PatientTable patients={patients} onDelete={handleDelete} />
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
