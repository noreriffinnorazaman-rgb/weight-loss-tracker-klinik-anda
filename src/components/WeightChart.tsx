"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
} from "recharts";
import { Patient } from "@/lib/types";

interface WeightChartProps {
  patient: Patient;
}

const penLabels = ["Baseline", "Pen 1", "Pen 2", "Pen 3", "Pen 4"];

export default function WeightChart({ patient }: WeightChartProps) {
  const data = patient.penRecords.map((record) => ({
    name: penLabels[record.penNumber],
    weight: record.measurement.weight,
    bmi: record.measurement.bmi,
    penNumber: record.penNumber,
  }));

  const baselineWeight = data[0]?.weight ?? 0;
  const minWeight = Math.min(...data.map((d) => d.weight));
  const maxWeight = Math.max(...data.map((d) => d.weight));
  const padding = (maxWeight - minWeight) * 0.2 || 5;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800">
          Weight Progress
        </h3>
        <p className="text-sm text-slate-500">
          Tracking weight changes across pen injections
        </p>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1" }}
            />
            <YAxis
              domain={[minWeight - padding, maxWeight + padding]}
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
              formatter={(value: unknown) => [`${Number(value).toFixed(1)} kg`, "Weight"]}
              labelStyle={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}
            />
            <ReferenceLine
              y={baselineWeight}
              stroke="#f59e0b"
              strokeDasharray="5 5"
              label={{
                value: `Baseline: ${baselineWeight} kg`,
                position: "insideTopRight",
                fill: "#f59e0b",
                fontSize: 11,
              }}
            />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#weightGradient)"
              dot={{
                r: 6,
                fill: "#fff",
                stroke: "#10b981",
                strokeWidth: 3,
              }}
              activeDot={{
                r: 8,
                fill: "#10b981",
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
