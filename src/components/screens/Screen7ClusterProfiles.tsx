import React, { useState } from 'react';
import {
  Users,
  Edit2,
  Check,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  ShieldAlert,
  RotateCw,
} from 'lucide-react';
import { ClusterProfile, KMeansResult } from '../../types';

interface Screen7ClusterProfilesProps {
  sector: string;
  profiles: ClusterProfile[];
  kMeansResult: KMeansResult;
  isLoadingAi: boolean;
  onUpdateClusterName: (clusterId: number, newName: string) => void;
  onRefreshProfiles: () => void;
  onContinue: () => void;
}

const CLUSTER_COLORS = [
  '#0284c7', // Sky
  '#0d9488', // Teal
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#10b981', // Emerald
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#e11d48', // Rose
];

export const Screen7ClusterProfiles: React.FC<Screen7ClusterProfilesProps> = ({
  sector,
  profiles,
  kMeansResult,
  isLoadingAi,
  onUpdateClusterName,
  onRefreshProfiles,
  onContinue,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNameText, setEditNameText] = useState('');

  const startEdit = (id: number, currentName: string) => {
    setEditingId(id);
    setEditNameText(currentName);
  };

  const saveEdit = (id: number) => {
    if (editNameText.trim()) {
      onUpdateClusterName(id, editNameText.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Perfiles de Clientes y Bautizo Comercial</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Nombres de mercado asignados automáticamente a partir de los centroides en el sector {sector}.
            Puedes editar cualquier nombre haciendo clic en el icono de lápiz.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefreshProfiles}
            disabled={isLoadingAi}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
            <span>{isLoadingAi ? 'Interpretando...' : 'Reinterpretar con Gemini'}</span>
          </button>

          <button
            onClick={onContinue}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20"
          >
            <span>Generar estrategias comerciales</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cluster Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profiles.map((profile, idx) => {
          const color = CLUSTER_COLORS[idx % CLUSTER_COLORS.length];
          const isEditing = editingId === profile.clusterId;
          const origCentroid = kMeansResult.centroidsOriginal[idx] || {};

          return (
            <div
              key={profile.clusterId}
              className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-5 flex flex-col justify-between shadow-xl relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: color }}
              />

              <div className="space-y-4">
                {/* Header: Cluster ID, Name and Edit */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Segmento {idx + 1}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={editNameText}
                          onChange={(e) => setEditNameText(e.target.value)}
                          className="bg-slate-950 border border-cyan-500 rounded-lg px-3 py-1 text-sm font-bold text-white focus:outline-none w-full"
                          autoFocus
                        />
                        <button
                          onClick={() => saveEdit(profile.clusterId)}
                          className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group cursor-pointer" onClick={() => startEdit(profile.clusterId, profile.name)}>
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition">
                          {profile.name}
                        </h3>
                        <Edit2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition" />
                      </div>
                    )}
                  </div>

                  {/* Size & Percentage Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-white font-mono block">
                      {profile.size} clientes
                    </span>
                    <span className="text-xs font-semibold text-cyan-400 font-mono">
                      {profile.percentage}% del total
                    </span>
                  </div>
                </div>

                {/* Main Characteristic Box */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-0.5">
                    Comportamiento Predominante:
                  </span>
                  <p className="text-slate-200 font-medium leading-relaxed">
                    "{profile.mainCharacteristic}"
                  </p>
                </div>

                {/* Differentiating Features (|z-score|) */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Variables Más Diferenciadoras vs Mercado:
                  </span>
                  <div className="space-y-1.5">
                    {profile.differentiatingFeatures.slice(0, 3).map((feat) => (
                      <div
                        key={feat.variable}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs font-mono"
                      >
                        <span className="text-slate-300 font-sans">{feat.variable}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[11px]">
                            Media: {origCentroid[feat.variable] ?? feat.clusterMean}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            feat.direction === 'superior'
                              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                              : 'bg-purple-950 text-purple-300 border border-purple-800'
                          }`}>
                            {feat.direction === 'superior' ? '▲' : '▼'} {feat.zScore > 0 ? `+${feat.zScore}` : feat.zScore}σ
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Profile Description */}
                <div className="text-xs text-slate-300 leading-relaxed">
                  <p>{profile.description}</p>
                </div>

                {/* Needs & Commercial Opportunities */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                  {profile.potentialNeeds.length > 0 && (
                    <div>
                      <span className="font-semibold text-cyan-400 block mb-1">
                        Necesidades Clave:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                        {profile.potentialNeeds.map((n, i) => (
                          <li key={i}>{n}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {profile.commercialOpportunities.length > 0 && (
                    <div>
                      <span className="font-semibold text-emerald-400 block mb-1">
                        Oportunidades Comerciales:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-300 text-[11px]">
                        {profile.commercialOpportunities.map((o, i) => (
                          <li key={i}>{o}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Warnings / Caveats */}
                {profile.caveats && (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/40 text-amber-300 text-[11px] flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{profile.caveats}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
