"use client";

import { Check, Circle, Syringe } from "lucide-react";
import { Patient, PenNumber } from "@/lib/types";

interface PenTimelineProps {
  patient: Patient;
  onAddRecord: () => void;
}

const penLabels = ["Baseline", "Pen 1", "Pen 2", "Pen 3", "Pen 4"];

export default function PenTimeline({ patient, onAddRecord }: PenTimelineProps) {
  const completedPens = patient.penRecords.map((r) => r.penNumber);
  const nextPen = (completedPens.length <= 4
    ? completedPens.length
    : -1) as PenNumber;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">
            Programme Timeline
          </h3>
          <p className="text-sm text-slate-500">
            {patient.program} — {completedPens.length - 1} of 4 pens completed
          </p>
        </div>
        {nextPen >= 0 && nextPen <= 4 && (
          <button
            onClick={onAddRecord}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Syringe className="w-4 h-4" />
            Record {nextPen === 0 ? "Baseline" : `Pen ${nextPen}`}
          </button>
        )}
      </div>

      <div className="flex items-center gap-0">
        {[0, 1, 2, 3, 4].map((pen, index) => {
          const isCompleted = completedPens.includes(pen as PenNumber);
          const isNext = pen === nextPen;
          const record = patient.penRecords.find(
            (r) => r.penNumber === pen
          );

          return (
            <div key={pen} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-200"
                      : isNext
                      ? "bg-emerald-100 text-emerald-600 border-2 border-emerald-400 animate-pulse"
                      : "bg-slate-100 text-slate-400 border-2 border-slate-200"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-semibold ${
                    isCompleted
                      ? "text-emerald-600"
                      : isNext
                      ? "text-emerald-500"
                      : "text-slate-400"
                  }`}
                >
                  {penLabels[pen]}
                </span>
                {record && (
                  <span className="text-xs text-slate-400 mt-0.5">
                    {record.measurement.weight} kg
                  </span>
                )}
              </div>
              {index < 4 && (
                <div
                  className={`h-1 flex-1 rounded-full mx-1 ${
                    completedPens.includes((pen + 1) as PenNumber)
                      ? "bg-emerald-400"
                      : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
