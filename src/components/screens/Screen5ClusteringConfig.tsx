import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Activity,
  Layers,
  HelpCircle,
  Play,
  RotateCw,
} from 'lucide-react';
import { PreprocessingConfig, ElbowPoint } from '../../types';

interface Screen5ClusteringConfigProps {
  k: number;
  config: PreprocessingConfig;
  numericFeatures: string[];
  categoricalFeatures: string[];
  elbowPoints: ElbowPoint[];
  recommendedK: number | null;
  isEvaluatingElbow: boolean;
  onKChanged: (k: number) => void;
  onConfigChanged: (config: PreprocessingConfig) => void;
  onEvaluateElbow: () => void;
  onExecuteKMeans: () => void;
}

export const Screen5ClusteringConfig: React.FC<Screen5ClusteringConfigProps> = ({
  k,
  config,
  numericFeatures,
  categoricalFeatures,
  elbowPoints,
  recommendedK,
  isEvaluatingElbow,
  onKChanged,
  onConfigChanged,
  onEvaluateElbow,
  onExecuteKMeans,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleLogTransform = (col: string) => {
    const list = [...config.logTransformColumns];
    const idx = list.indexOf(col);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(col);
    }
    onConfigChanged({ ...config, logTransformColumns: list });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Sliders className="w-6 h-6 text-cyan-400" />
          <span>Configuración del Algoritmo K-Means</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Define el número de segmentos (K) o consulta la recomendación estadística automática basada en el método del codo y siluetas.
        </p>
      </div>

      {/* Cluster Number Selection (K: 2 to 10) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Número de Segmentos Deseados (K)
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl font-extrabold text-cyan-400 font-mono">{k}</span>
              <span className="text-sm font-medium text-slate-300">grupos o perfiles de clientes</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onEvaluateElbow}
            disabled={isEvaluatingElbow}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white transition shadow-lg shadow-cyan-600/20 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isEvaluatingElbow ? 'animate-spin' : ''}`} />
            <span>{isEvaluatingElbow ? 'Evaluando K=2 a 8...' : 'Recomendar K estadístico (Codo y Silueta)'}</span>
          </button>
        </div>

        {/* Segment Buttons (2 to 10) */}
        <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
          {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
            const isSelected = k === num;
            const isRecommended = recommendedK === num;

            return (
              <button
                key={num}
                type="button"
                onClick={() => onKChanged(num)}
                className={`py-3 rounded-xl font-mono text-sm font-bold transition flex flex-col items-center justify-center relative ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{num}</span>
                {isRecommended && (
                  <span className={`text-[9px] font-sans font-bold uppercase tracking-tight mt-0.5 ${
                    isSelected ? 'text-slate-950' : 'text-cyan-400'
                  }`}>
                    Óptimo
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Statistical Recommendation Box (If calculated) */}
        {elbowPoints.length > 0 && (
          <div className="p-5 rounded-xl bg-slate-950/70 border border-cyan-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Evaluación Comparativa de Métricas por Valor de K (2 a 8)
                </h4>
              </div>
              {recommendedK && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Recomendación matemática: K = {recommendedK}
                </span>
              )}
            </div>

            {/* Metrics Comparison Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-center text-xs">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2 px-3">K</th>
                    <th className="py-2 px-3">Inercia (WCSS)</th>
                    <th className="py-2 px-3">Silhouette Score</th>
                    <th className="py-2 px-3">Davies-Bouldin</th>
                    <th className="py-2 px-3">Calinski-Harabasz</th>
                    <th className="py-2 px-3">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {elbowPoints.map((ep) => {
                    const isSelected = k === ep.k;
                    return (
                      <tr
                        key={ep.k}
                        className={isSelected ? 'bg-cyan-950/40 text-cyan-200' : 'text-slate-300'}
                      >
                        <td className="py-2 px-3 font-bold text-white">K = {ep.k}</td>
                        <td className="py-2 px-3">{ep.inertia}</td>
                        <td className={`py-2 px-3 font-bold ${ep.silhouette > 0.4 ? 'text-emerald-400' : 'text-slate-300'}`}>
                          {ep.silhouette}
                        </td>
                        <td className="py-2 px-3">{ep.daviesBouldin}</td>
                        <td className="py-2 px-3">{ep.calinskiHarabasz}</td>
                        <td className="py-2 px-3 font-sans">
                          <button
                            onClick={() => onKChanged(ep.k)}
                            className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 transition"
                          >
                            Seleccionar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              * El Silhouette Score evalúa la cohesión interna y la separación entre clusters (-1 a +1; más cercano a 1 es mejor).
              Davies-Bouldin mide la similitud promedio entre clusters (menor es mejor).
            </p>
          </div>
        )}
      </div>

      {/* Preprocessing & Scaling Settings */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Técnicas de Preprocesamiento y Escalamiento Matemático</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              La estandarización evita que variables con escalas grandes (ej. ingresos o bytes) dominen la distancia euclidiana.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Scaler Options */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-200">
              Método de Escalamiento Numérico:
            </label>
            <div className="space-y-2 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="scaler"
                  value="standard"
                  checked={config.scaler === 'standard'}
                  onChange={() => onConfigChanged({ ...config, scaler: 'standard' })}
                  className="mt-0.5 text-cyan-500 focus:ring-0"
                />
                <div>
                  <span className="font-semibold text-white">StandardScaler (z = (x - μ) / σ)</span>
                  <p className="text-[11px] text-slate-400">
                    Estandariza a media 0 y varianza unitaria. Recomendado por defecto.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="scaler"
                  value="robust"
                  checked={config.scaler === 'robust'}
                  onChange={() => onConfigChanged({ ...config, scaler: 'robust' })}
                  className="mt-0.5 text-cyan-500 focus:ring-0"
                />
                <div>
                  <span className="font-semibold text-white">RobustScaler (z = (x - Mediana) / IQR)</span>
                  <p className="text-[11px] text-slate-400">
                    Utiliza mediana y rango intercuartílico, ideal ante valores extremos (outliers).
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Random Seed & Convergence */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-slate-200">
              Reproducibilidad y Semilla Aleatoria (Seed):
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={config.seed}
                onChange={(e) =>
                  onConfigChanged({
                    ...config,
                    seed: parseInt(e.target.value) || 42,
                  })
                }
                className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 font-mono text-xs text-cyan-300 font-bold focus:outline-none"
              />
              <span className="text-xs text-slate-400">
                Garantiza asignaciones 100% reproducibles (PRNG Mulberry32)
              </span>
            </div>
            <div className="text-[11px] text-slate-500">
              Reinicios automáticos K-Means++ (n_init = 20) para evitar mínimos locales.
            </div>
          </div>
        </div>

        {/* Log Transformations for Skewed Features */}
        {numericFeatures.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <span className="block text-xs font-semibold text-slate-300 mb-2">
              Transformación Logarítmica Opcional (log1p) para Variables Asimétricas:
            </span>
            <div className="flex flex-wrap gap-2">
              {numericFeatures.map((col) => {
                const isSelected = config.logTransformColumns.includes(col);
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => toggleLogTransform(col)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      isSelected
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {col} (log)
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Launch Execution Button */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-slate-950 border border-cyan-800/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">¿Todo listo para ejecutar la segmentación?</h4>
          <p className="text-xs text-slate-400">
            Se calculará K-Means con {k} clusters sobre {numericFeatures.length} variables numéricas
            {categoricalFeatures.length > 0 && ` y ${categoricalFeatures.length} categóricas (One-Hot)`}.
          </p>
        </div>

        <button
          type="button"
          onClick={onExecuteKMeans}
          className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition shadow-xl shadow-cyan-500/25"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>Ejecutar K-Means ({k} Clusters)</span>
        </button>
      </div>
    </div>
  );
};
