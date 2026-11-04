import React, { useState } from 'react';
import {
  PieChart,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { KMeansResult, ClusterProfile } from '../../types';

interface Screen6KMeansResultsProps {
  kMeansResult: KMeansResult;
  profiles: ClusterProfile[];
  onContinue: () => void;
  onReconfigure: () => void;
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

export const Screen6KMeansResults: React.FC<Screen6KMeansResultsProps> = ({
  kMeansResult,
  profiles,
  onContinue,
  onReconfigure,
}) => {
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<number | 'all'>('all');
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  const {
    k,
    inertia,
    silhouetteScore,
    daviesBouldinIndex,
    calinskiHarabaszIndex,
    clusterSizes,
    clusterPercentages,
    centroidsOriginal,
    centroidsStandardized,
    smallClusterWarnings,
    pcaCoordinates,
    pcaVariance,
    originalNumericFeatures,
    iterations,
    converged,
  } = kMeansResult;

  // Filter PCA points
  const displayedPca = selectedClusterFilter === 'all'
    ? pcaCoordinates
    : pcaCoordinates.filter((p) => p.cluster === selectedClusterFilter);

  // PCA Plot Dimensions
  const plotWidth = 700;
  const plotHeight = 380;
  const padding = 40;

  // Compute scale boundaries for PCA
  const xs = pcaCoordinates.map((p) => p.x);
  const ys = pcaCoordinates.map((p) => p.y);
  const minX = Math.min(...xs, -1);
  const maxX = Math.max(...xs, 1);
  const minY = Math.min(...ys, -1);
  const maxY = Math.max(...ys, 1);

  const scaleX = (x: number) =>
    padding + ((x - minX) / (maxX - minX || 1)) * (plotWidth - 2 * padding);
  const scaleY = (y: number) =>
    plotHeight - padding - ((y - minY) / (maxY - minY || 1)) * (plotHeight - 2 * padding);

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <PieChart className="w-6 h-6 text-cyan-400" />
            <span>Resultados de Clustering K-Means</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Segmentación matemática completada en {iterations} iteraciones ({converged ? 'Convergencia alcanzada' : 'Límite de iteraciones'}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onReconfigure}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Probar otro K</span>
          </button>

          <button
            onClick={onContinue}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20"
          >
            <span>Interpretar segmentos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Validation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Silhouette Score</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              silhouetteScore > 0.4 ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
            }`}>
              {silhouetteScore > 0.4 ? 'Buena Separación' : 'Aceptable'}
            </span>
          </div>
          <p className="text-2xl font-bold text-cyan-400 font-mono mt-1">{silhouetteScore}</p>
          <span className="text-[10px] text-slate-500 block">Rango [-1 a +1]</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Davies-Bouldin</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              Menor es mejor
            </span>
          </div>
          <p className="text-2xl font-bold text-white font-mono mt-1">{daviesBouldinIndex}</p>
          <span className="text-[10px] text-slate-500 block">Similitud inter-cluster</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Calinski-Harabasz</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              Mayor es mejor
            </span>
          </div>
          <p className="text-2xl font-bold text-white font-mono mt-1">{calinskiHarabaszIndex}</p>
          <span className="text-[10px] text-slate-500 block">Varianza inter/intra</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Inercia (WCSS)</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
              Suma Cuadrados
            </span>
          </div>
          <p className="text-2xl font-bold text-white font-mono mt-1">{inertia}</p>
          <span className="text-[10px] text-slate-500 block">Dispersión intra-cluster</span>
        </div>
      </div>

      {/* Warnings if small clusters */}
      {smallClusterWarnings.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Advertencia sobre tamaño de segmentos:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-200 text-[11px]">
            {smallClusterWarnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Cluster Size Distribution Bar */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">
          Distribución de Población por Segmento (Total: {pcaCoordinates.length} clientes)
        </h3>

        {/* Stacked Percentage Bar */}
        <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex shadow-inner">
          {clusterPercentages.map((pct, idx) => (
            <div
              key={idx}
              title={`Segmento ${idx + 1}: ${clusterSizes[idx]} clientes (${pct}%)`}
              className="h-full transition-all duration-300"
              style={{
                width: `${pct}%`,
                backgroundColor: CLUSTER_COLORS[idx % CLUSTER_COLORS.length],
              }}
            />
          ))}
        </div>

        {/* Legend Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {clusterSizes.map((size, idx) => {
            const color = CLUSTER_COLORS[idx % CLUSTER_COLORS.length];
            const isSelected = selectedClusterFilter === idx;
            const profile = profiles[idx];

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedClusterFilter(isSelected ? 'all' : idx)}
                className={`p-3 rounded-xl border text-left transition ${
                  isSelected
                    ? 'border-white bg-slate-800 shadow'
                    : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-bold text-white truncate">
                    {profile ? profile.name : `Cluster ${idx + 1}`}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline justify-between text-xs">
                  <span className="font-mono text-slate-300 font-bold">{size} clientes</span>
                  <span className="font-mono text-cyan-400 font-semibold">{clusterPercentages[idx]}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2D PCA Interactive Projection */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Proyección Bidimensional PCA (Análisis de Componentes Principales)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualización aproximada reducida a 2 dimensiones.
              Componente 1 explica el {pcaVariance[0]}% de la varianza | Componente 2 explica el {pcaVariance[1]}%.
            </p>
          </div>

          <div className="text-xs text-slate-400">
            {selectedClusterFilter !== 'all' ? (
              <button
                onClick={() => setSelectedClusterFilter('all')}
                className="text-cyan-400 hover:underline"
              >
                Mostrando Cluster {selectedClusterFilter + 1} (Ver todos)
              </button>
            ) : (
              <span>Mostrando todos los registros</span>
            )}
          </div>
        </div>

        {/* SVG PCA Scatter Plot */}
        <div className="relative rounded-xl bg-slate-950 border border-slate-800 p-2 overflow-hidden">
          <svg
            viewBox={`0 0 ${plotWidth} ${plotHeight}`}
            className="w-full h-auto max-h-[420px]"
          >
            {/* Grid Lines */}
            <line
              x1={padding}
              y1={plotHeight / 2}
              x2={plotWidth - padding}
              y2={plotHeight / 2}
              stroke="#1e293b"
              strokeDasharray="4 4"
            />
            <line
              x1={plotWidth / 2}
              y1={padding}
              x2={plotWidth / 2}
              y2={plotHeight - padding}
              stroke="#1e293b"
              strokeDasharray="4 4"
            />

            {/* Axis Labels */}
            <text
              x={plotWidth - padding}
              y={plotHeight / 2 - 8}
              fill="#64748b"
              fontSize="10"
              textAnchor="end"
              fontFamily="monospace"
            >
              PC1 ({pcaVariance[0]}% var) →
            </text>
            <text
              x={plotWidth / 2 + 8}
              y={padding + 12}
              fill="#64748b"
              fontSize="10"
              fontFamily="monospace"
            >
              ↑ PC2 ({pcaVariance[1]}% var)
            </text>

            {/* Points */}
            {displayedPca.map((pt, pIdx) => {
              const cx = scaleX(pt.x);
              const cy = scaleY(pt.y);
              const color = CLUSTER_COLORS[pt.cluster % CLUSTER_COLORS.length];
              const isHovered = hoveredPoint?.id === pt.id;

              return (
                <circle
                  key={pIdx}
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 3.5}
                  fill={color}
                  opacity={isHovered ? 1 : 0.75}
                  className="cursor-pointer transition-all duration-100 hover:opacity-100"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}
          </svg>

          {/* Hover tooltip for client point */}
          {hoveredPoint && (
            <div className="absolute top-4 right-4 p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-xl text-xs space-y-1 pointer-events-none">
              <p className="font-bold text-white">ID: {hoveredPoint.id}</p>
              <p className="text-slate-300">
                Segmento Asignado:{' '}
                <span
                  className="font-bold font-mono"
                  style={{ color: CLUSTER_COLORS[hoveredPoint.cluster % CLUSTER_COLORS.length] }}
                >
                  Cluster {hoveredPoint.cluster + 1}
                </span>
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                PC1: {hoveredPoint.x} | PC2: {hoveredPoint.y}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Heatmap of Standardized Centroids (Z-Scores) */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white">
            Mapa de Calor de Centroides Estandarizados (Desviaciones Z respecto a la media global)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Valores positivos (+z) indican niveles por encima de la media del mercado. Valores negativos (-z) indican niveles inferiores.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-center text-xs">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 text-left">Segmento</th>
                {originalNumericFeatures.map((f) => (
                  <th key={f} className="py-2.5 px-3 whitespace-nowrap">
                    {f}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {centroidsStandardized.map((cent, cIdx) => (
                <tr key={cIdx}>
                  <td className="py-2.5 px-3 text-left font-bold text-white whitespace-nowrap bg-slate-950/40">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: CLUSTER_COLORS[cIdx % CLUSTER_COLORS.length] }}
                      />
                      <span>Cluster {cIdx + 1}</span>
                    </div>
                  </td>
                  {originalNumericFeatures.map((f) => {
                    const z = cent[f] ?? 0;
                    let bg = 'bg-slate-900/40 text-slate-300';
                    if (z > 1.0) bg = 'bg-cyan-900/80 text-cyan-200 font-bold';
                    else if (z > 0.3) bg = 'bg-blue-950/60 text-blue-300 font-medium';
                    else if (z < -1.0) bg = 'bg-rose-950/80 text-rose-200 font-bold';
                    else if (z < -0.3) bg = 'bg-purple-950/60 text-purple-300 font-medium';

                    return (
                      <td key={f} className={`py-2 px-3 ${bg}`}>
                        {z > 0 ? `+${z}` : z}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
