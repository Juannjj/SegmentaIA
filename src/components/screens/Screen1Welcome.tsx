import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Database,
  BarChart2,
  PieChart,
  Target,
  FileSpreadsheet,
  CheckCircle2,
  Layers,
  Cpu,
} from 'lucide-react';
import { SAMPLE_DATASETS } from '../../utils/sampleDatasets';

interface Screen1WelcomeProps {
  onStart: () => void;
  onLoadSample: (sampleId: string) => void;
}

export const Screen1Welcome: React.FC<Screen1WelcomeProps> = ({
  onStart,
  onLoadSample,
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-12 py-4">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-950 border border-slate-800/80 p-8 sm:p-12 overflow-hidden shadow-2xl">
        {/* Glow ambient circle */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-300 text-xs font-semibold">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Motor Estadístico K-Means & IA Generativa Integrada</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            SegmentaIA
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 mt-1">
              Plataforma Inteligente de Segmentación de Mercados
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Transforma bases de datos de clientes en grupos estratégicos de alto valor comercial.
            Ejecuta algoritmos matemáticos verificables de clustering K-Means, análisis descriptivo sectorial,
            interpretación cualitativa asistida por IA y planes tácticos de marketing a 90 días con personificaciones visuales.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Comenzar análisis</span>
              <ArrowRight className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </button>
            <span className="text-xs text-slate-400">
              o selecciona una base de prueba preconfigurada abajo
            </span>
          </div>
        </div>

        {/* Feature Badges Grid */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Cálculo Matemático Real</p>
              <p className="text-slate-400 text-[11px]">K-Means Lloyd, Silueta y PCA 2D</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Soporte Excel, CSV y TXT</p>
              <p className="text-slate-400 text-[11px]">Lectura directa de archivos locales</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Marketing y Plan 90 Días</p>
              <p className="text-slate-400 text-[11px]">Estrategias, mensajes y KPIs</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Exportación Profesional</p>
              <p className="text-slate-400 text-[11px]">Excel 12 hojas, PDF Ejecutivo y ZIP</p>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Datasets Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              <span>Bases de Datos de Muestra Listas para Analizar</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Haz clic en cualquiera de estos conjuntos reales para ejecutar el flujo completo al instante
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAMPLE_DATASETS.map((ds) => (
            <div
              key={ds.id}
              className="group p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                    {ds.sector}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {ds.rows.length} registros
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                  {ds.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {ds.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-500 truncate">
                  {ds.fileName}
                </span>
                <button
                  onClick={() => onLoadSample(ds.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 transition flex items-center gap-1.5"
                >
                  <span>Cargar muestra</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6 Steps Overview */}
      <div className="p-8 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-6">
        <h3 className="text-lg font-bold text-white text-center">
          Metodología Científica de Segmentación en 6 Fases
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <span className="text-xs font-bold text-cyan-400">01</span>
            <p className="font-semibold text-white">Carga & Diagnóstico</p>
            <p className="text-[10px] text-slate-400">Validación de tipos y faltantes</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <span className="text-xs font-bold text-cyan-400">02</span>
            <p className="font-semibold text-white">Análisis Descriptivo</p>
            <p className="text-[10px] text-slate-400">Estadísticas y correlaciones</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <span className="text-xs font-bold text-cyan-400">03</span>
            <p className="font-semibold text-white">Clustering K-Means</p>
            <p className="text-[10px] text-slate-400">Lloyd K-Means++ y Siluetas</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <span className="text-xs font-bold text-cyan-400">04</span>
            <p className="font-semibold text-white">Perfiles de Negocio</p>
            <p className="text-[10px] text-slate-400">Nombres comerciales y z-scores</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <span className="text-xs font-bold text-cyan-400">05</span>
            <p className="font-semibold text-white">Estrategias & 90 Días</p>
            <p className="text-[10px] text-slate-400">Mensajes multicanal y KPIs</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <span className="text-xs font-bold text-cyan-400">06</span>
            <p className="font-semibold text-white">Exportación Total</p>
            <p className="text-[10px] text-slate-400">Excel 12 hojas, PDF y ZIP</p>
          </div>
        </div>
      </div>
    </div>
  );
};
