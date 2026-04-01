"use client";

import { Trash2, Undo2 } from "lucide-react";
import { Patient, PenNumber } from "@/lib/types";

interface MeasurementTableProps {
  patient: Patient;
  onDeletePenRecord?: (penNumber: PenNumber) => void;
}

const penLabels = ["Baseline", "Pen 1", "Pen 2", "Pen 3", "Pen 4"];

const metrics = [
  { key: "weight", label: "Weight", unit: "kg" },
  { key: "bmi", label: "BMI", unit: "" },
  { key: "fatMass", label: "Fat Mass", unit: "kg" },
  { key: "muscleMass", label: "Muscle Mass", unit: "kg" },
  { key: "waistCircumference", label: "Waist Circumference", unit: "cm" },
  { key: "hba1c", label: "HbA1c", unit: "%" },
  { key: "totalCholesterol", label: "Total Cholesterol", unit: "mmol/L" },
  { key: "hdl", label: "HDL", unit: "mmol/L" },
  { key: "ldl", label: "LDL", unit: "mmol/L" },
] as const;

export default function MeasurementTable({ patient, onDeletePenRecord }: MeasurementTableProps) {
  const records = patient.penRecords;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-lg font-bold text-slate-800">
          All Measurements
        </h3>
        <p className="text-sm text-slate-500">
          Detailed comparison across all pen stages — click <Undo2 className="w-3.5 h-3.5 inline" /> to undo/delete a record
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-48">
                Metric
              </th>
              {records.map((record) => (
                <th
                  key={record.penNumber}
                  className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>{penLabels[record.penNumber]}</span>
                    {onDeletePenRecord && record.penNumber > 0 && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete ${penLabels[record.penNumber]} record? This will undo this pen data.`)) {
                            onDeletePenRecord(record.penNumber as PenNumber);
                          }
                        }}
                        className="p-0.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                        title={`Delete ${penLabels[record.penNumber]} record`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="text-slate-400 font-normal normal-case mt-0.5">
                    {record.measurement.date}
                  </div>
                </th>
              ))}
              {records.length >= 2 && (
                <th className="px-4 py-3 text-center text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                  Change
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {metrics.map((metric) => {
              const baseline = records[0]?.measurement[metric.key] ?? 0;
              const latest =
                records[records.length - 1]?.measurement[metric.key] ?? 0;
              const change = latest - baseline;

              return (
                <tr key={metric.key} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-slate-700">
                    {metric.label}
                    {metric.unit && (
                      <span className="text-slate-400 ml-1">
                        ({metric.unit})
                      </span>
                    )}
                  </td>
                  {records.map((record) => (
                    <td
                      key={record.penNumber}
                      className="px-4 py-3 text-center text-sm font-medium text-slate-700"
                    >
                      {record.measurement[metric.key].toFixed(
                        metric.key === "bmi" ||
                          metric.key === "totalCholesterol" ||
                          metric.key === "hdl" ||
                          metric.key === "ldl"
                          ? 2
                          : 1
                      )}
                    </td>
                  ))}
                  {records.length >= 2 && (
                    <td className="px-4 py-3 text-center text-sm font-bold">
                      <span
                        className={
                          metric.key === "muscleMass" || metric.key === "hdl"
                            ? change > 0
                              ? "text-emerald-600"
                              : change < 0
                              ? "text-red-500"
                              : "text-slate-400"
                            : change < 0
                            ? "text-emerald-600"
                            : change > 0
                            ? "text-red-500"
                            : "text-slate-400"
                        }
                      >
                        {change > 0 ? "+" : ""}
                        {change.toFixed(
                          metric.key === "bmi" ||
                            metric.key === "totalCholesterol" ||
                            metric.key === "hdl" ||
                            metric.key === "ldl"
                            ? 2
                            : 1
                        )}
                      </span>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
