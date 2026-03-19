"use client";

import { ChevronRight, Trash2 } from "lucide-react";
import { Patient } from "@/lib/types";
import Link from "next/link";

interface PatientTableProps {
  patients: Patient[];
  onDelete: (id: string) => void;
}

function getPenProgress(patient: Patient) {
  const maxPen = patient.penRecords.length - 1;
  return maxPen;
}

function getBadgeColor(program: string) {
  switch (program) {
    case "Ozempic":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Wegovy":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "Mounjaro":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}

export default function PatientTable({ patients, onDelete }: PatientTableProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-lg font-semibold text-slate-800">
          Patient List
        </h2>
        <p className="text-sm text-slate-500">
          Click on a patient to view detailed progress
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                No
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Patient Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                DOB
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Programme
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Baseline WT
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Current WT
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pen
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map((patient) => {
              const baseline = patient.penRecords[0]?.measurement.weight ?? 0;
              const latest =
                patient.penRecords[patient.penRecords.length - 1]?.measurement
                  .weight ?? baseline;
              const diff = baseline - latest;
              const penProgress = getPenProgress(patient);

              return (
                <tr
                  key={patient.id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    {patient.no}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/patient/${patient.id}`}
                      className="text-sm font-semibold text-slate-800 hover:text-emerald-600 transition-colors"
                    >
                      {patient.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {patient.dob}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeColor(
                        patient.program
                      )}`}
                    >
                      {patient.program}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    {baseline.toFixed(1)} kg
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">
                    {latest.toFixed(1)} kg
                  </td>
                  <td className="px-6 py-4">
                    {diff > 0 ? (
                      <span className="text-sm font-semibold text-emerald-600">
                        -{diff.toFixed(1)} kg
                      </span>
                    ) : diff < 0 ? (
                      <span className="text-sm font-semibold text-red-500">
                        +{Math.abs(diff).toFixed(1)} kg
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      {[1, 2, 3, 4].map((pen) => (
                        <div
                          key={pen}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            pen <= penProgress
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          {pen}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (
                            confirm(
                              `Delete ${patient.name} from the programme?`
                            )
                          ) {
                            onDelete(patient.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/patient/${patient.id}`}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {patients.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-6 py-12 text-center text-slate-400"
                >
                  No patients enrolled yet. Click &quot;Add Patient&quot; to get
                  started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
