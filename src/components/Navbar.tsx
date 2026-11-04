import React from 'react';
import {
  Sparkles,
  Database,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

interface NavbarProps {
  currentStep: number;
  sector: string;
  rowCount: number;
  onOpenQualityModal: () => void;
  onReset: () => void;
  onLoadSample: (sampleId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  sector,
  rowCount,
  onOpenQualityModal,
  onReset,
  onLoadSample,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-white tracking-tight">Segmenta<span className="text-cyan-400">IA</span></span>
            <span className="text-[10px] font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Enterprise ML
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">Plataforma Inteligente de Segmentación y Marketing</p>
        </div>
      </div>

      {/* Center Metadata Badge */}
      <div className="hidden lg:flex items-center gap-4 text-xs">
        {sector && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Sector:</span>
            <span className="font-semibold text-white">{sector}</span>
          </div>
        )}
        {rowCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Registros:</span>
            <span className="font-semibold text-white">{rowCount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sample Datasets Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Ejemplos</span>
          </button>
          <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
            <p className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
              Bases de Datos Demo
            </p>
            <button
              onClick={() => onLoadSample('telecom')}
              className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-200 transition flex items-center justify-between"
            >
              <span>Telecomunicaciones (150 cl.)</span>
              <span className="text-[10px] text-cyan-400 font-mono">XLSX</span>
            </button>
            <button
              onClick={() => onLoadSample('retail')}
              className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-200 transition flex items-center justify-between"
            >
              <span>Comercio Minorista (140 cl.)</span>
              <span className="text-[10px] text-cyan-400 font-mono">XLSX</span>
            </button>
            <button
              onClick={() => onLoadSample('banking')}
              className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-200 transition flex items-center justify-between"
            >
              <span>Servicios Financieros (130 cl.)</span>
              <span className="text-[10px] text-cyan-400 font-mono">XLSX</span>
            </button>
            <button
              onClick={() => onLoadSample('health')}
              className="w-full text-left px-2.5 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-200 transition flex items-center justify-between"
            >
              <span>Salud y Afiliados (120 cl.)</span>
              <span className="text-[10px] text-cyan-400 font-mono">XLSX</span>
            </button>
          </div>
        </div>

        {/* Quality Audit Modal Trigger */}
        <button
          onClick={onOpenQualityModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
          title="Verificación de Calidad del Proyecto"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Auditoría</span>
        </button>

        {/* Reset Project */}
        {rowCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-900/40 transition"
            title="Reiniciar análisis con nueva base"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Nuevo</span>
          </button>
        )}
      </div>
    </header>
  );
};
