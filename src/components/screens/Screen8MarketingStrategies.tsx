import React, { useState } from 'react';
import {
  Target,
  MessageSquare,
  Mail,
  Smartphone,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Compass,
  CheckCircle2,
  Copy,
  Check,
  RotateCw,
} from 'lucide-react';
import { MarketingStrategy, ClusterProfile } from '../../types';

interface Screen8MarketingStrategiesProps {
  sector: string;
  profiles: ClusterProfile[];
  strategies: MarketingStrategy[];
  isLoadingAi: boolean;
  onRefreshStrategies: () => void;
  onContinue: () => void;
}

export const Screen8MarketingStrategies: React.FC<Screen8MarketingStrategiesProps> = ({
  sector,
  profiles,
  strategies,
  isLoadingAi,
  onRefreshStrategies,
  onContinue,
}) => {
  const [selectedClusterIndex, setSelectedClusterIndex] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeStrategy = strategies[selectedClusterIndex];
  const activeProfile = profiles[selectedClusterIndex];

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Target className="w-6 h-6 text-cyan-400" />
            <span>Estrategias de Mercadeo y Comunicación</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Planes comerciales personalizados para el sector {sector}, orientados a la conversión, retención y aumento de valor.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshStrategies}
            disabled={isLoadingAi}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
            <span>{isLoadingAi ? 'Generando...' : 'Regenerar con Gemini'}</span>
          </button>

          <button
            onClick={onContinue}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20"
          >
            <span>Ver plan 90 días</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Segment Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {profiles.map((p, idx) => {
          const isSelected = selectedClusterIndex === idx;
          return (
            <button
              key={p.clusterId}
              onClick={() => setSelectedClusterIndex(idx)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-slate-950' : 'bg-cyan-400'}`} />
              <span>{p.name}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                isSelected ? 'bg-slate-900/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                {p.percentage}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Strategic Card for Selected Segment */}
      {activeStrategy && activeProfile && (
        <div className="space-y-6">
          {/* Strategy Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                A. Diagnóstico Comercial
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {activeStrategy.diagnosticoComercial}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                B. Objetivo Comercial (Medible)
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {activeStrategy.objetivoComercial}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                C. Estrategia Principal & Oferta
              </span>
              <p className="text-xs font-bold text-white">
                {activeStrategy.estrategiaMarketing}
              </p>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                {activeStrategy.propuestaValor}
              </p>
            </div>
          </div>

          {/* Recommended Channels Strip */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-slate-400">Canales de Contacto Recomendados:</span>
            {activeStrategy.canalesRecomendados.map((c) => (
              <span
                key={c}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-medium"
              >
                {c}
              </span>
            ))}
            <span className="text-[10px] text-slate-500 italic">
              (Hipótesis prioritarias para testeo A/B)
            </span>
          </div>

          {/* Multi-channel Copywriting & Messaging Suite */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <span>Mensajes Publicitarios y Copys Listos para Campaña</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Textos redactados específicamente para resonar con las motivaciones de {activeProfile.name}.
                </p>
              </div>
            </div>

            {/* Campaign Concept & Main Hook */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-blue-950/20 to-slate-950 border border-cyan-800/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Concepto Creativo de Campaña & Frase Central:
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Concepto: "{activeStrategy.mensajes.conceptoCampana}"
                </span>
              </div>
              <p className="text-base font-extrabold text-white">
                "{activeStrategy.mensajes.mensajePrincipal}"
              </p>
              <div className="pt-1 flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-400">Call to Action (CTA):</span>
                <span className="font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {activeStrategy.mensajes.cta}
                </span>
              </div>
            </div>

            {/* Copy Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* SMS Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Mensaje SMS</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {activeStrategy.mensajes.sms.length} caracteres
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 font-mono">
                    {activeStrategy.mensajes.sms}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy('sms', activeStrategy.mensajes.sms)}
                  className="self-end flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  {copiedKey === 'sms' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'sms' ? 'Copiado' : 'Copiar texto'}</span>
                </button>
              </div>

              {/* Email Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      <span>Email Marketing</span>
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 space-y-1.5 text-xs">
                    <p className="text-slate-400 font-semibold text-[11px]">
                      Asunto: <span className="text-white font-normal">{activeStrategy.mensajes.email.asunto}</span>
                    </p>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      {activeStrategy.mensajes.email.cuerpo}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    handleCopy(
                      'email',
                      `Asunto: ${activeStrategy.mensajes.email.asunto}\n\n${activeStrategy.mensajes.email.cuerpo}`
                    )
                  }
                  className="self-end flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  {copiedKey === 'email' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'email' ? 'Copiado' : 'Copiar email'}</span>
                </button>
              </div>

              {/* WhatsApp Card */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>WhatsApp (Con Opt-In)</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    {activeStrategy.mensajes.whatsapp}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy('wa', activeStrategy.mensajes.whatsapp)}
                  className="self-end flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  {copiedKey === 'wa' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'wa' ? 'Copiado' : 'Copiar mensaje'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* KPIs and Tentative Goals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                Indicadores KPI (Seguimiento Futuro):
              </span>
              <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                {activeStrategy.kpis.map((kpi, i) => (
                  <li key={i}>{kpi}</li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                Metas Tentativas Sugeridas (Para Validación):
              </span>
              <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                {activeStrategy.metasComerciales.map((meta, i) => (
                  <li key={i}>{meta}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
