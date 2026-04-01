"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Patient, ProgramType, PenNumber, PenRecord, Measurement } from "@/lib/types";
import {
  getPatients,
  addPatient,
  deletePatient,
  resetData,
  addPenRecord,
  editPenRecord,
  updatePatientProgram,
  deletePenRecord,
} from "@/lib/store";
import { ArrowLeft, User, Calendar, Pill, Search, Filter } from "lucide-react";
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

type SyncStatus = "synced" | "syncing" | "offline" | "error";

export default function Home() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPenRecord, setEditingPenRecord] = useState<PenRecord | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("syncing");
  const [lastSync, setLastSync] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProgram, setFilterProgram] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = () => {
    return new Date().toLocaleTimeString("en-MY", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const refresh = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    setSyncStatus("syncing");
    try {
      const data = await getPatients();
      setPatients(data);
      setSyncStatus("synced");
      setLastSync(formatTime());
    } catch {
      setSyncStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    refresh(true);

    // Auto-refresh every 30 seconds
    autoRefreshRef.current = setInterval(() => {
      refresh(false);
    }, 30000);

    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [refresh]);

  const handleAddPatient = async (data: {
    name: string;
    dob: string;
    height: number;
    program: ProgramType;
    baseline: Measurement;
    dosage: number;
  }) => {
    setSyncStatus("syncing");
    await addPatient({
      name: data.name,
      dob: data.dob,
      height: data.height,
      program: data.program,
      penRecords: [
        {
          penNumber: 0,
          dosage: data.dosage,
          measurement: data.baseline,
        },
      ],
    });
    await refresh();
    setShowAddModal(false);
  };

  const handleDelete = async (id: string) => {
    setSyncStatus("syncing");
    await deletePatient(id);
    await refresh();
  };

  const handleReset = async () => {
    if (
      confirm(
        "Reset all data to original? This will remove all progress records."
      )
    ) {
      setSyncStatus("syncing");
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

  const handleSaveRecord = async (penNumber: PenNumber, measurement: Measurement, dosage: number = 0) => {
    if (!selectedPatientId) return;
    setSyncStatus("syncing");
    if (editingPenRecord) {
      // Editing an existing pen record — update in-place
      await editPenRecord(selectedPatientId, penNumber, measurement, dosage);
    } else {
      // Adding a new pen record
      await addPenRecord(selectedPatientId, penNumber, measurement, dosage);
    }
    await refresh();
    setShowForm(false);
    setEditingPenRecord(null);
  };

  const handleEditPenRecord = (penNumber: PenNumber) => {
    if (!selectedPatient) return;
    const record = selectedPatient.penRecords.find((r) => r.penNumber === penNumber);
    if (record) {
      setEditingPenRecord(record);
      setShowForm(true);
    }
  };

  const handleProgramChange = async (program: ProgramType) => {
    if (!selectedPatientId) return;
    setSyncStatus("syncing");
    await updatePatientProgram(selectedPatientId, program);
    await refresh();
  };

  const handleDeletePenRecord = async (penNumber: PenNumber) => {
    if (!selectedPatientId) return;
    setSyncStatus("syncing");
    await deletePenRecord(selectedPatientId, penNumber);
    await refresh();
  };

  // Filter patients by search and program
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.dob.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.no).includes(searchQuery);
    const matchesProgram =
      filterProgram === "all" || p.program === filterProgram;
    return matchesSearch && matchesProgram;
  });

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full" />
        <p className="text-slate-500 text-sm font-medium animate-pulse">
          Loading patient data from Google Sheets...
        </p>
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
        <Header
          showActions={false}
          syncStatus={syncStatus}
          lastSync={lastSync}
          onBack={handleBackToDashboard}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Back button + Patient info */}
          <div className="flex items-start justify-between flex-wrap gap-4">
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
                  {selectedPatient.height > 0 && (
                    <span className="flex items-center gap-1 font-medium text-slate-600">
                      {selectedPatient.height} cm
                    </span>
                  )}
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
            onAddRecord={() => { setEditingPenRecord(null); setShowForm(true); }}
            onDeletePenRecord={handleDeletePenRecord}
            onEditPenRecord={handleEditPenRecord}
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
          <MeasurementTable patient={selectedPatient} onDeletePenRecord={handleDeletePenRecord} onEditPenRecord={handleEditPenRecord} />
        </main>

        {/* Pen record form modal */}
        {showForm && (editingPenRecord || (nextPen >= 0 && nextPen <= 4)) && (
          <PenRecordForm
            patientName={selectedPatient.name}
            patientHeight={selectedPatient.height || 0}
            patientProgram={selectedPatient.program}
            nextPen={nextPen as PenNumber}
            onClose={() => { setShowForm(false); setEditingPenRecord(null); }}
            onSave={handleSaveRecord}
            editRecord={editingPenRecord || undefined}
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
        onRefresh={() => refresh(true)}
        syncStatus={syncStatus}
        lastSync={lastSync}
        onBack={handleBackToDashboard}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <StatsCards patients={patients} />

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients by name, DOB, or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none cursor-pointer"
            >
              <option value="all">All Programmes</option>
              <option value="Ozempic">Ozempic</option>
              <option value="Wegovy">Wegovy</option>
              <option value="Mounjaro">Mounjaro</option>
            </select>
          </div>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-4">
            <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full" />
            <span className="text-sm text-slate-500">Fetching latest data...</span>
          </div>
        )}

        <PatientTable
          patients={filteredPatients}
          onDelete={handleDelete}
          onSelect={handleSelectPatient}
        />

        {/* Filtered results count */}
        {(searchQuery || filterProgram !== "all") && (
          <p className="text-center text-sm text-slate-400">
            Showing {filteredPatients.length} of {patients.length} patients
            {searchQuery && <span> matching &quot;{searchQuery}&quot;</span>}
            {filterProgram !== "all" && <span> in {filterProgram}</span>}
          </p>
        )}
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
