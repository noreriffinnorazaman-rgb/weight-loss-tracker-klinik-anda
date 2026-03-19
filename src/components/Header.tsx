"use client";

import { Activity, Plus, RotateCcw } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  onAddPatient?: () => void;
  onReset?: () => void;
  showActions?: boolean;
}

export default function Header({
  onAddPatient,
  onReset,
  showActions = true,
}: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <Activity className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Klinik Anda Kangar
              </h1>
              <p className="text-emerald-100 text-xs font-medium">
                Weight Loss Programme 2026 — Dr Izazi
              </p>
            </div>
          </Link>

          {showActions && (
            <div className="flex items-center gap-2">
              {onReset && (
                <button
                  onClick={onReset}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}
              {onAddPatient && (
                <button
                  onClick={onAddPatient}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white text-emerald-700 hover:bg-emerald-50 rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Add Patient
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
