import React, { useState } from 'react';
import {
  CalendarDays,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Users,
  AlertTriangle,
  Layers,
  Sparkles,
} from 'lucide-react';
import { MarketingStrategy, ClusterProfile } from '../../types';

interface Screen9CommunicationPlanProps {
  sector: string;
  profiles: ClusterProfile[];
  strategies: MarketingStrategy[];
  onContinue: () => void;
}

export const Screen9CommunicationPlan: React.FC<Screen9CommunicationPlanProps> = ({
  sector,
  profiles,
  strategies,
  onContinue,
}) => {
  const [filterClusterId, setFilterClusterId] = useState<number | 'all'>('all');
  const [activeView, setActiveView] = useState<'calendar' | 'matrix'>('calendar');

  const phases = [
    { name: 'Semanas 1 y 2: Preparación y Validación', weeks: 'Sem 1-2', badge: 'Setup & Tagging' },
    { name: 'Semanas 3 y 4: Pruebas Piloto', weeks: 'Sem 3-4', badge: 'Test A/B' },
    { name: 'Semanas 5 a 8: Ejecución y Optimización', weeks: 'Sem 5-8', badge: 'Escalamiento' },
    { name: 'Semanas 9 a 12: Medición y Evaluación', weeks: 'Sem 9-12', badge: 'ROI & Aprendizajes' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-cyan-400" />
            <span>Plan de Comunicación y Ejecución a 90 Días</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cronograma comercial estructurado en 4 fases secuenciales con matriz de priorización estratégica para {sector}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setActiveView('calendar')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeView === 'calendar' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cronograma 90d
            </button>
            <button
              onClick={() => setActiveView('matrix')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                activeView === 'matrix' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Matriz Prioridades
            </button>
          </div>

          <button
            onClick={onContinue}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20"
          >
            <span>Generar personificaciones</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cluster Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilterClusterId('all')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition ${
            filterClusterId === 'all'
              ? 'bg-cyan-500 text-slate-950'
              : 'bg-slate-900 text-slate-300 border border-slate-800'
          }`}
        >
          Todos los Segmentos ({profiles.length})
        </button>
        {profiles.map((p, idx) => (
          <button
            key={p.clusterId}
            onClick={() => setFilterClusterId(p.clusterId)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
              filterClusterId === p.clusterId
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-900 text-slate-300 border border-slate-800'
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* CALENDAR VIEW */}
      {activeView === 'calendar' && (
        <div className="space-y-6">
          {phases.map((ph, pIdx) => {
            return (
              <div
                key={pIdx}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4 shadow-lg"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 font-bold font-mono text-xs flex items-center justify-center border border-cyan-500/20">
                      {ph.weeks}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{ph.name}</h3>
                      <p className="text-[11px] text-slate-400">
                        {pIdx === 0
                          ? 'Auditoría de datos, listas de consentimiento (opt-in), parametrización de CRM'
                          : pIdx === 1
                          ? 'Despliegue controlado al 10-15% de cada segmento para verificar tasas de apertura y respuesta'
                          : pIdx === 2
                          ? 'Lanzamiento general, automatización de disparadores y optimización continua'
                          : 'Evaluación cuantitativa de impacto en retención, ARPU y conversión'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    {ph.badge}
                  </span>
                </div>

                {/* Activities Cards per Cluster */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {strategies
                    .filter((s) => filterClusterId === 'all' || s.clusterId === filterClusterId)
                    .map((s, idx) => {
                      const profile = profiles.find((p) => p.clusterId === s.clusterId);
                      const phaseData = s.plan90Dias[pIdx];

                      return (
                        <div
                          key={s.clusterId}
                          className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-cyan-300">
                              {profile?.name || `Segmento ${s.clusterId + 1}`}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Canal: {phaseData?.canal || s.canalesRecomendados[0]}
                            </span>
                          </div>

                          <p className="text-slate-200 leading-relaxed">
                            {phaseData?.actividades || 'Parametrización y ejecución de campaña adaptada al segmento.'}
                          </p>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                            <span>
                              KPI: <span className="text-emerald-400 font-medium">{phaseData?.kpi || 'Tasa de conversión'}</span>
                            </span>
                            <span>
                              Resp: <span className="text-slate-300 font-medium">{phaseData?.responsable || 'Equipo de Marketing'}</span>
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MATRIX VIEW: Impact vs Effort Priority Matrix */}
      {activeView === 'matrix' && (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white">
              Matriz Cualitativa de Prioridades Comerciales (Impacto Potencial vs. Esfuerzo de Implementación)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Clasificación de los segmentos para orientar el presupuesto y la cadencia de lanzamiento.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Quadrant 1: Quick Wins */}
            <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 text-sm">
                  1. Victorias Rápidas (Alto Impacto / Bajo Esfuerzo)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-900 text-emerald-200">
                  Prioridad 1
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Segmentos de alto volumen o fácil activación digital que no requieren cambios estructurales de producto.
              </p>
              <div className="space-y-1.5 pt-1">
                {profiles.slice(0, 2).map((p) => (
                  <div key={p.clusterId} className="p-2.5 rounded-lg bg-slate-950/60 text-white font-semibold">
                    {p.name} ({p.percentage}% de clientes)
                  </div>
                ))}
              </div>
            </div>

            {/* Quadrant 2: Strategic Initiatives */}
            <div className="p-5 rounded-xl bg-blue-950/20 border border-blue-800/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-400 text-sm">
                  2. Proyectos Estratégicos (Alto Impacto / Alto Esfuerzo)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-900 text-blue-200">
                  Prioridad 2
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Clientes de alto valor o alto riesgo de fuga que demandan ofertas personalizadas y seguimiento omnicanal.
              </p>
              <div className="space-y-1.5 pt-1">
                {profiles.slice(2, 4).map((p) => (
                  <div key={p.clusterId} className="p-2.5 rounded-lg bg-slate-950/60 text-white font-semibold">
                    {p.name} ({p.percentage}% de clientes)
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
