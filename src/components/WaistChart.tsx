"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Patient } from "@/lib/types";

interface WaistChartProps {
  patient: Patient;
}

const penLabels = ["Baseline", "Pen 1", "Pen 2", "Pen 3", "Pen 4"];

export default function WaistChart({ patient }: WaistChartProps) {
  const data = patient.penRecords.map((record) => ({
    name: penLabels[record.penNumber],
    waist: record.measurement.waistCircumference,
  }));

  const minVal = Math.min(...data.map((d) => d.waist));
  const maxVal = Math.max(...data.map((d) => d.waist));
  const padding = (maxVal - minVal) * 0.2 || 5;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800">
          Waist Circumference
        </h3>
        <p className="text-sm text-slate-500">
          Tracking waist measurement changes
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="waistGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1" }}
            />
            <YAxis
              domain={[minVal - padding, maxVal + padding]}
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1" }}
              unit=" cm"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                padding: "12px 16px",
              }}
              formatter={(value: unknown) => [`${Number(value).toFixed(1)} cm`, "Waist"]}
              labelStyle={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}
            />
            <Area
              type="monotone"
              dataKey="waist"
              stroke="#8b5cf6"
              strokeWidth={3}
              fill="url(#waistGradient)"
              dot={{
                r: 6,
                fill: "#fff",
                stroke: "#8b5cf6",
                strokeWidth: 3,
              }}
              activeDot={{
                r: 8,
                fill: "#8b5cf6",
                stroke: "#fff",
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
