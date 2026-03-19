"use client";

import { Users, TrendingDown, Syringe, Target } from "lucide-react";
import { Patient } from "@/lib/types";

interface StatsCardsProps {
  patients: Patient[];
}

export default function StatsCards({ patients }: StatsCardsProps) {
  const totalPatients = patients.length;

  const completedPrograms = patients.filter(
    (p) => p.penRecords.length === 5
  ).length;

  const avgWeightLoss =
    patients.reduce((acc, p) => {
      if (p.penRecords.length < 2) return acc;
      const baseline = p.penRecords[0].measurement.weight;
      const latest = p.penRecords[p.penRecords.length - 1].measurement.weight;
      return acc + (baseline - latest);
    }, 0) / Math.max(patients.filter((p) => p.penRecords.length >= 2).length, 1);

  const totalPensUsed = patients.reduce(
    (acc, p) => acc + Math.max(0, p.penRecords.length - 1),
    0
  );

  const stats = [
    {
      label: "Total Patients",
      value: totalPatients,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      label: "Total Pens Used",
      value: totalPensUsed,
      icon: Syringe,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      label: "Avg Weight Loss",
      value: `${avgWeightLoss.toFixed(1)} kg`,
      icon: TrendingDown,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
    },
    {
      label: "Completed (4 Pens)",
      value: completedPrograms,
      icon: Target,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="card-hover bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4"
        >
          <div
            className={`${stat.bgColor} rounded-xl p-3 flex items-center justify-center`}
          >
            <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
