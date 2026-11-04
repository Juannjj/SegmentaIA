import React from 'react';
import {
  Home,
  UploadCloud,
  Briefcase,
  BarChart3,
  Sliders,
  PieChart,
  Users,
  Target,
  CalendarDays,
  Image as ImageIcon,
  Download,
  CheckCircle,
} from 'lucide-react';

export interface StepItem {
  number: number;
  title: string;
  shortTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  isUnlocked: boolean;
  isCompleted: boolean;
}

interface StepSidebarProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  completedSteps: number[];
  unlockedMaxStep: number;
}

export const StepSidebar: React.FC<StepSidebarProps> = ({
  currentStep,
  onSelectStep,
  completedSteps,
  unlockedMaxStep,
}) => {
  const steps: StepItem[] = [
    { number: 1, title: 'Bienvenida', shortTitle: 'Inicio', icon: Home, isUnlocked: true, isCompleted: completedSteps.includes(1) },
    { number: 2, title: 'Carga de Datos', shortTitle: 'Carga', icon: UploadCloud, isUnlocked: unlockedMaxStep >= 2, isCompleted: completedSteps.includes(2) },
    { number: 3, title: 'Sector Económico', shortTitle: 'Sector', icon: Briefcase, isUnlocked: unlockedMaxStep >= 3, isCompleted: completedSteps.includes(3) },
    { number: 4, title: 'Análisis Descriptivo', shortTitle: 'Descriptivo', icon: BarChart3, isUnlocked: unlockedMaxStep >= 4, isCompleted: completedSteps.includes(4) },
    { number: 5, title: 'Configuración K-Means', shortTitle: 'K-Means', icon: Sliders, isUnlocked: unlockedMaxStep >= 5, isCompleted: completedSteps.includes(5) },
    { number: 6, title: 'Resultados de Clustering', shortTitle: 'Resultados', icon: PieChart, isUnlocked: unlockedMaxStep >= 6, isCompleted: completedSteps.includes(6) },
    { number: 7, title: 'Perfiles de Clientes', shortTitle: 'Perfiles', icon: Users, isUnlocked: unlockedMaxStep >= 7, isCompleted: completedSteps.includes(7) },
    { number: 8, title: 'Estrategias de Marketing', shortTitle: 'Estrategias', icon: Target, isUnlocked: unlockedMaxStep >= 8, isCompleted: completedSteps.includes(8) },
    { number: 9, title: 'Plan de Comunicación', shortTitle: 'Plan 90d', icon: CalendarDays, isUnlocked: unlockedMaxStep >= 9, isCompleted: completedSteps.includes(9) },
    { number: 10, title: 'Personificación con IA', shortTitle: 'Personas IA', icon: ImageIcon, isUnlocked: unlockedMaxStep >= 10, isCompleted: completedSteps.includes(10) },
    { number: 11, title: 'Centro de Exportación', shortTitle: 'Descargas', icon: Download, isUnlocked: unlockedMaxStep >= 11, isCompleted: completedSteps.includes(11) },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-950/70 border-r border-slate-800/80 p-3 lg:p-4 shrink-0 flex flex-col justify-between">
      <div>
        <div className="hidden lg:block mb-4 px-3">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Flujo de Segmentación
          </span>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>Progreso</span>
            <span className="font-semibold text-cyan-400">
              {Math.round((completedSteps.length / 11) * 100)}%
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-1.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300 rounded-full"
              style={{ width: `${(completedSteps.length / 11) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps List */}
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
          {steps.map((st) => {
            const Icon = st.icon;
            const isCurrent = currentStep === st.number;
            const isAllowed = st.isUnlocked;

            return (
              <button
                key={st.number}
                onClick={() => isAllowed && onSelectStep(st.number)}
                disabled={!isAllowed}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left whitespace-nowrap lg:whitespace-normal group ${
                  isCurrent
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                    : st.isCompleted
                    ? 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    : isAllowed
                    ? 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
                    : 'text-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-semibold transition ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : st.isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isAllowed
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-slate-900 text-slate-700'
                  }`}
                >
                  {st.isCompleted && !isCurrent ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    st.number
                  )}
                </div>

                <div className="hidden lg:block truncate">
                  <span className="block truncate">{st.title}</span>
                </div>
                <span className="block lg:hidden truncate">{st.shortTitle}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="hidden lg:block pt-4 border-t border-slate-800/80 px-2 text-[11px] text-slate-500">
        <p>Motor Estadístico: Lloyd K-Means++</p>
        <p className="text-[10px] text-slate-600 mt-0.5">Semilla determinista y validación silueta</p>
      </div>
    </aside>
  );
};
