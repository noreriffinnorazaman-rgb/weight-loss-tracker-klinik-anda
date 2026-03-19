"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Patient } from "@/lib/types";

interface HealthMarkersChartProps {
  patient: Patient;
}

const penLabels = ["Baseline", "Pen 1", "Pen 2", "Pen 3", "Pen 4"];

export default function HealthMarkersChart({
  patient,
}: HealthMarkersChartProps) {
  const data = patient.penRecords.map((record) => ({
    name: penLabels[record.penNumber],
    HbA1c: record.measurement.hba1c,
    "Total Cholesterol": record.measurement.totalCholesterol,
    HDL: record.measurement.hdl,
    LDL: record.measurement.ldl,
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800">
          Health Markers
        </h3>
        <p className="text-sm text-slate-500">
          HbA1c & cholesterol levels over time
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
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
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                padding: "12px 16px",
              }}
              labelStyle={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="HbA1c"
              stroke="#ef4444"
              strokeWidth={2.5}
              dot={{ r: 5, fill: "#fff", stroke: "#ef4444", strokeWidth: 2 }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="Total Cholesterol"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              dot={{ r: 5, fill: "#fff", stroke: "#8b5cf6", strokeWidth: 2 }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="HDL"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 5, fill: "#fff", stroke: "#10b981", strokeWidth: 2 }}
              activeDot={{ r: 7 }}
            />
            <Line
              type="monotone"
              dataKey="LDL"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ r: 5, fill: "#fff", stroke: "#f59e0b", strokeWidth: 2 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
