"use client";

import {
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

/* eslint-disable @typescript-eslint/no-explicit-any */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-bold text-slate-800 mb-1">{label}</p>
      <p className="text-slate-600">Weight: <span className="font-semibold">{d.weight.toFixed(1)} kg</span></p>
      {d.programme && (
        <p className="text-slate-500 mt-0.5">Programme: <span className="font-semibold">{d.programme}</span></p>
      )}
      {d.dosage > 0 && (
        <p className="text-slate-500">Dosage: <span className="font-semibold">{d.dosage} mg</span></p>
      )}
    </div>
  );
}

function CustomXTick({ x, y, payload, chartData }: any) {
  const entry = chartData?.find((d: any) => d.name === payload?.value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={14} textAnchor="middle" fontSize={11} fontWeight={600} fill="#64748b">
        {payload?.value}
      </text>
      {entry?.dosage > 0 && (
        <text x={0} y={0} dy={28} textAnchor="middle" fontSize={10} fill="#8b5cf6" fontWeight={600}>
          {entry.dosage} mg
        </text>
      )}
      {entry?.programme && entry?.penNumber > 0 && (
        <text x={0} y={0} dy={entry?.dosage > 0 ? 40 : 28} textAnchor="middle" fontSize={9} fill="#94a3b8">
          {entry.programme}
        </text>
      )}
    </g>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function WeightChart({ patient }: WeightChartProps) {
  const data = patient.penRecords.map((record) => ({
    name: penLabels[record.penNumber],
    weight: record.measurement.weight,
    bmi: record.measurement.bmi,
    penNumber: record.penNumber,
    dosage: record.dosage || 0,
    programme: patient.program,
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
          Tracking weight changes across pen injections — showing programme &amp; dosage
        </p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 45 }}>
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tick={<CustomXTick chartData={data} />}
              axisLine={{ stroke: "#cbd5e1" }}
              height={50}
            />
            <YAxis
              domain={[minWeight - padding, maxWeight + padding]}
              tick={{ fontSize: 12, fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1" }}
              unit=" kg"
            />
            <Tooltip content={<CustomTooltip />} />
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
