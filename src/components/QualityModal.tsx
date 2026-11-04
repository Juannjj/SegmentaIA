import React from 'react';
import { X, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { QualityValidationItem } from '../types';

interface QualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  validations: QualityValidationItem[];
}

export const QualityModal: React.FC<QualityModalProps> = ({
  isOpen,
  onClose,
  validations,
}) => {
  if (!isOpen) return null;

  const passedCount = validations.filter((v) => v.passed).length;
  const totalCount = validations.length;
  const isAllPassed = passedCount === totalCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isAllPassed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Validación de Calidad del Proyecto</h2>
              <p className="text-xs text-slate-400">
                Auditoría automática de 12 criterios de fiabilidad estadística y completitud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="px-6 py-4 bg-slate-950/30 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Estado global:</span>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              isAllPassed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {passedCount} de {totalCount} Verificaciones Aprobadas
            </span>
          </div>
          <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isAllPassed ? 'bg-emerald-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${(passedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Validation List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {validations.map((item, index) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition ${
                item.passed
                  ? 'bg-slate-950/40 border-slate-800/80 text-slate-200'
                  : 'bg-slate-950/20 border-slate-800/40 text-slate-400'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {item.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-slate-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-semibold ${item.passed ? 'text-white' : 'text-slate-400'}`}>
                    {index + 1}. {item.label}
                  </h4>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                    item.passed ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {item.passed ? 'Aprobado' : 'Pendiente'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {item.details}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-lg shadow-cyan-600/20"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
