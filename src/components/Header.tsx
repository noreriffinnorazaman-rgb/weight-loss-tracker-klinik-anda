"use client";

import { Activity, Plus, RotateCcw, RefreshCw, Wifi, WifiOff, Cloud, CloudOff } from "lucide-react";

interface HeaderProps {
  onAddPatient?: () => void;
  onReset?: () => void;
  onRefresh?: () => void;
  showActions?: boolean;
  syncStatus?: "synced" | "syncing" | "offline" | "error";
  lastSync?: string;
  onBack?: () => void;
}

export default function Header({
  onAddPatient,
  onReset,
  onRefresh,
  showActions = true,
  syncStatus = "synced",
  lastSync,
  onBack,
}: HeaderProps) {
  const getSyncBadge = () => {
    switch (syncStatus) {
      case "syncing":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-400/20 text-yellow-100 rounded-full text-xs font-medium">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Syncing...
          </span>
        );
      case "offline":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-400/20 text-red-200 rounded-full text-xs font-medium">
            <CloudOff className="w-3 h-3" />
            Offline
          </span>
        );
      case "error":
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-400/20 text-red-200 rounded-full text-xs font-medium">
            <WifiOff className="w-3 h-3" />
            Sync Error
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-400/20 text-emerald-100 rounded-full text-xs font-medium">
            <Cloud className="w-3 h-3" />
            Live
          </span>
        );
    }
  };

  return (
    <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-3 cursor-pointer">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2">
              <Activity className="w-7 h-7" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">
                  Klinik Anda Kangar
                </h1>
                {getSyncBadge()}
              </div>
              <p className="text-emerald-100 text-xs font-medium">
                Weight Loss Programme 2026 — Dr Izazi
                {lastSync && (
                  <span className="ml-2 text-emerald-200/70">
                    • Last sync: {lastSync}
                  </span>
                )}
              </p>
            </div>
          </button>

          {showActions && (
            <div className="flex items-center gap-2">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                  title="Refresh data from Google Sheets"
                >
                  <RefreshCw className={`w-4 h-4 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
                </button>
              )}
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
