"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Patient } from "@/lib/types";

interface BodyCompositionChartProps {
  patient: Patient;
}

const penLabels = ["Baseline", "Pen 1", "Pen 2", "Pen 3", "Pen 4"];

export default function BodyCompositionChart({
  patient,
}: BodyCompositionChartProps) {
  const data = patient.penRecords.map((record) => ({
    name: penLabels[record.penNumber],
    "Fat Mass": record.measurement.fatMass,
    "Muscle Mass": record.measurement.muscleMass,
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800">
          Body Composition
        </h3>
        <p className="text-sm text-slate-500">
          Fat mass vs muscle mass per pen
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1" }}
              unit=" kg"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                padding: "12px 16px",
              }}
              formatter={(value: unknown) => [`${Number(value).toFixed(1)} kg`]}
              labelStyle={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              iconType="circle"
            />
            <Bar
              dataKey="Fat Mass"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
              barSize={32}
            />
            <Bar
              dataKey="Muscle Mass"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
