import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  SlidersHorizontal,
  Sparkles,
  ArrowRight,
  PieChart as PieIcon,
  Search,
  AlertCircle,
  HelpCircle,
  RotateCw,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  NumericStats,
  CategoricalStats,
  CorrelationPair,
  ColumnMeta,
} from '../../types';

interface DescriptiveInterpretation {
  hallazgos: string[];
  interpretaciones: string[];
  hipotesisComerciales: string[];
  recomendaciones: string[];
  resumenEjecutivo?: string;
}

interface Screen4DescriptiveProps {
  sector: string;
  columns: ColumnMeta[];
  numericStats: Record<string, NumericStats>;
  categoricalStats: Record<string, CategoricalStats>;
  correlationMatrix: { matrix: number[][]; pairs: CorrelationPair[] };
  interpretation: DescriptiveInterpretation | null;
  isLoadingAi: boolean;
  onRefreshInterpretation: () => void;
  onContinue: () => void;
}

export const Screen4Descriptive: React.FC<Screen4DescriptiveProps> = ({
  sector,
  columns,
  numericStats,
  categoricalStats,
  correlationMatrix,
  interpretation,
  isLoadingAi,
  onRefreshInterpretation,
  onContinue,
}) => {
  const numericCols = Object.keys(numericStats);
  const categoricalCols = Object.keys(categoricalStats);

  const [selectedNumCol, setSelectedNumCol] = useState<string>(
    numericCols[0] || ''
  );
  const [selectedCatCol, setSelectedCatCol] = useState<string>(
    categoricalCols[0] || ''
  );
  const [searchTable, setSearchTable] = useState('');
  const [activeTab, setActiveTab] = useState<'numerics' | 'categoricals' | 'correlations' | 'missing'>('numerics');

  const currentNumStat = numericStats[selectedNumCol];
  const currentCatStat = categoricalStats[selectedCatCol];

  const filteredNumericCols = numericCols.filter((c) =>
    c.toLowerCase().includes(searchTable.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-cyan-400" />
            <span>Exploración y Análisis Descriptivo</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Métricas exactas calculadas directamente sobre tu base de datos para el sector{' '}
            <span className="text-cyan-300 font-semibold">{sector}</span>.
          </p>
        </div>

        <button
          onClick={onContinue}
          className="self-start md:self-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20"
        >
          <span>Configurar segmentación</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('numerics')}
          className={`px-4 py-2 rounded-xl font-semibold transition ${
            activeTab === 'numerics'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Variables Numéricas ({numericCols.length})
        </button>
        {categoricalCols.length > 0 && (
          <button
            onClick={() => setActiveTab('categoricals')}
            className={`px-4 py-2 rounded-xl font-semibold transition ${
              activeTab === 'categoricals'
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Variables Categóricas ({categoricalCols.length})
          </button>
        )}
        {numericCols.length >= 2 && (
          <button
            onClick={() => setActiveTab('correlations')}
            className={`px-4 py-2 rounded-xl font-semibold transition ${
              activeTab === 'correlations'
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Matriz de Correlación
          </button>
        )}
        <button
          onClick={() => setActiveTab('missing')}
          className={`px-4 py-2 rounded-xl font-semibold transition ${
            activeTab === 'missing'
              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Calidad y Faltantes
        </button>
      </div>

      {/* TAB 1: Numeric Variables */}
      {activeTab === 'numerics' && (
        <div className="space-y-6">
          {/* Detailed Indicator Card for Selected Column */}
          {currentNumStat && (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Analizando variable:</span>
                  <select
                    value={selectedNumCol}
                    onChange={(e) => setSelectedNumCol(e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-cyan-300 font-bold text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
                  >
                    {numericCols.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-xs text-slate-400">
                  <span>{currentNumStat.validCount} observaciones válidas</span>
                  {currentNumStat.outliersCount > 0 && (
                    <span className="ml-2 text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded font-mono">
                      {currentNumStat.outliersCount} atípicos detectados
                    </span>
                  )}
                </div>
              </div>

              {/* Grid of Key Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Media (Promedio)</span>
                  <p className="text-lg font-bold text-white mt-0.5">{currentNumStat.mean}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Mediana (Q2)</span>
                  <p className="text-lg font-bold text-cyan-300 mt-0.5">{currentNumStat.median}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Desviación Estándar</span>
                  <p className="text-lg font-bold text-white mt-0.5">±{currentNumStat.stdDev}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Rango IQR (Q3 - Q1)</span>
                  <p className="text-lg font-bold text-white mt-0.5">{currentNumStat.iqr}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Asimetría (Skewness)</span>
                  <p className={`text-lg font-bold mt-0.5 ${
                    Math.abs(currentNumStat.skewness) > 1 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {currentNumStat.skewness}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Coef. Variación</span>
                  <p className="text-lg font-bold text-white mt-0.5">{currentNumStat.cv}%</p>
                </div>
              </div>

              {/* Boxplot & Quartile Bar Visualizer */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Diagrama de Distribución de Cuartiles y Rango</span>
                  <span className="font-mono text-[11px]">
                    Mín: {currentNumStat.min} | Q1: {currentNumStat.q1} | Med: {currentNumStat.median} | Q3: {currentNumStat.q3} | Máx: {currentNumStat.max}
                  </span>
                </div>

                {/* Visual Boxplot */}
                <div className="relative h-12 flex items-center px-4">
                  {/* Whisker line from min to max */}
                  <div className="absolute left-4 right-4 h-0.5 bg-slate-700" />
                  {/* IQR Box (Q1 to Q3) */}
                  <div
                    className="absolute h-8 bg-gradient-to-r from-cyan-600/60 to-blue-600/60 border border-cyan-400/80 rounded"
                    style={{
                      left: `${Math.max(4, Math.min(80, ((currentNumStat.q1 - currentNumStat.min) / Math.max(1e-6, currentNumStat.max - currentNumStat.min)) * 90 + 4))}%`,
                      width: `${Math.max(8, Math.min(85, ((currentNumStat.iqr) / Math.max(1e-6, currentNumStat.max - currentNumStat.min)) * 90))}%`,
                    }}
                  >
                    {/* Median Line */}
                    <div className="h-full w-1 bg-white mx-auto shadow" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Full Statistical Table for all numeric columns */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-lg">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Tabla Estadística Completa de Variables Numéricas
              </h3>
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filtrar variable..."
                  value={searchTable}
                  onChange={(e) => setSearchTable(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Variable</th>
                    <th className="py-2.5 px-3">Válidos</th>
                    <th className="py-2.5 px-3">Media</th>
                    <th className="py-2.5 px-3">Mediana</th>
                    <th className="py-2.5 px-3">Desv. Est.</th>
                    <th className="py-2.5 px-3">Mín - Máx</th>
                    <th className="py-2.5 px-3">IQR</th>
                    <th className="py-2.5 px-3">CV (%)</th>
                    <th className="py-2.5 px-3">Asimetría</th>
                    <th className="py-2.5 px-3">Atípicos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {filteredNumericCols.map((col) => {
                    const s = numericStats[col];
                    const isSelected = col === selectedNumCol;
                    return (
                      <tr
                        key={col}
                        onClick={() => setSelectedNumCol(col)}
                        className={`cursor-pointer transition ${
                          isSelected ? 'bg-cyan-950/30 text-cyan-200' : 'hover:bg-slate-800/20 text-slate-300'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-white">{col}</td>
                        <td className="py-2.5 px-3">{s.validCount}</td>
                        <td className="py-2.5 px-3 font-bold text-cyan-300">{s.mean}</td>
                        <td className="py-2.5 px-3">{s.median}</td>
                        <td className="py-2.5 px-3">±{s.stdDev}</td>
                        <td className="py-2.5 px-3">{s.min} – {s.max}</td>
                        <td className="py-2.5 px-3">{s.iqr}</td>
                        <td className="py-2.5 px-3">{s.cv}%</td>
                        <td className="py-2.5 px-3">{s.skewness}</td>
                        <td className="py-2.5 px-3">
                          {s.outliersCount > 0 ? (
                            <span className="text-amber-400">{s.outliersCount}</span>
                          ) : (
                            <span className="text-slate-600">0</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Categorical Variables */}
      {activeTab === 'categoricals' && currentCatStat && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Variable categórica:</span>
                <select
                  value={selectedCatCol}
                  onChange={(e) => setSelectedCatCol(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-purple-300 font-bold text-sm rounded-lg px-3 py-1.5 focus:outline-none"
                >
                  {categoricalCols.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-xs text-slate-400">
                <span>{currentCatStat.categoryCount} categorías | Predominante: </span>
                <span className="font-bold text-white">{currentCatStat.predominantCategory}</span>
              </div>
            </div>

            {/* Frequency Bars */}
            <div className="space-y-3 pt-2">
              {currentCatStat.relativeFreqs.map((rf) => (
                <div key={rf.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{rf.category}</span>
                    <span className="font-mono text-purple-400">{rf.percentage}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      style={{ width: `${rf.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Pearson Correlation Matrix & Heatmap */}
      {activeTab === 'correlations' && (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white">
              Matriz de Correlación de Pearson y Mapa de Calor
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifica pares de variables colineales (|r| &gt; 0.70). Las variables redundantes pueden distorsionar los clusters.
            </p>
          </div>

          {/* Correlation Heatmap Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-center text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 text-left">Variable</th>
                  {numericCols.map((c) => (
                    <th key={c} className="py-2.5 px-2 text-[10px] whitespace-nowrap">
                      {c.length > 10 ? c.slice(0, 8) + '..' : c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {numericCols.map((rowCol, i) => (
                  <tr key={rowCol}>
                    <td className="py-2 px-3 text-left font-semibold text-white whitespace-nowrap bg-slate-950/40">
                      {rowCol}
                    </td>
                    {numericCols.map((colCol, j) => {
                      const r = correlationMatrix.matrix[i]?.[j] ?? 0;
                      let bg = 'bg-slate-900/40 text-slate-400';
                      if (i === j) {
                        bg = 'bg-slate-800 text-slate-500 font-bold';
                      } else if (r > 0.6) {
                        bg = 'bg-cyan-900/70 text-cyan-200 font-bold';
                      } else if (r > 0.3) {
                        bg = 'bg-blue-950/60 text-blue-300';
                      } else if (r < -0.6) {
                        bg = 'bg-rose-950/70 text-rose-200 font-bold';
                      } else if (r < -0.3) {
                        bg = 'bg-purple-950/50 text-purple-300';
                      }
                      return (
                        <td key={colCol} className={`py-2 px-2 ${bg}`}>
                          {r.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top Correlated Pairs */}
          {correlationMatrix.pairs.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-semibold text-slate-300 mb-2">
                Pares con Mayor Fuerza de Asociación:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {correlationMatrix.pairs.slice(0, 3).map((p) => (
                  <div
                    key={`${p.colA}-${p.colB}`}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-semibold text-white">{p.colA}</span>
                      <span className="text-slate-500 mx-1">↔</span>
                      <span className="font-semibold text-white">{p.colB}</span>
                    </div>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                      Math.abs(p.correlation) > 0.7
                        ? 'bg-amber-950 text-amber-300'
                        : 'bg-cyan-950 text-cyan-300'
                    }`}>
                      r = {p.correlation}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Missing Values Analysis */}
      {activeTab === 'missing' && (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">
              Diagnóstico de Calidad y Valores Faltantes por Columna
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Porcentaje de registros vacíos detectados en cada variable.
            </p>
          </div>

          <div className="space-y-3">
            {columns.map((c) => (
              <div key={c.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{c.name}</span>
                  <span className="font-mono text-slate-400">
                    {c.missingCount} nulos ({c.missingPercentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      c.missingPercentage > 20
                        ? 'bg-rose-500'
                        : c.missingPercentage > 5
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(1, c.missingPercentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gemini AI Strategic Interpretation Card */}
      <div className="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-cyan-800/40 p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Interpretación Inteligente del Sector {sector}
              </h3>
              <p className="text-xs text-slate-400">
                Análisis contextual con Google Gemini diferenciando hallazgos, interpretaciones e hipótesis
              </p>
            </div>
          </div>

          <button
            onClick={onRefreshInterpretation}
            disabled={isLoadingAi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoadingAi ? 'animate-spin' : ''}`} />
            <span>{isLoadingAi ? 'Analizando...' : 'Regenerar interpretación'}</span>
          </button>
        </div>

        {isLoadingAi ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">
              Gemini está analizando la distribución estadística en el contexto de {sector}...
            </p>
          </div>
        ) : interpretation ? (
          <div className="space-y-6 text-xs">
            {/* Executive Summary */}
            {interpretation.resumenEjecutivo && (
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/50 text-cyan-200 leading-relaxed font-medium">
                {interpretation.resumenEjecutivo}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hallazgos Estadísticos */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                  <span>1. Hallazgos Estadísticos (Hechos Observados)</span>
                </div>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {interpretation.hallazgos.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>

              {/* Interpretaciones de Negocio */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-blue-400 font-bold uppercase tracking-wider text-[11px]">
                  <span>2. Interpretaciones para el Sector {sector}</span>
                </div>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {interpretation.interpretaciones.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>

              {/* Hipótesis Comerciales */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-purple-400 font-bold uppercase tracking-wider text-[11px]">
                  <span>3. Hipótesis Comerciales (A Validar)</span>
                </div>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {interpretation.hipotesisComerciales.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>

              {/* Recomendaciones Tácticas */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                  <span>4. Recomendaciones Tácticas</span>
                </div>
                <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                  {interpretation.recomendaciones.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-500">
            Haz clic en "Regenerar interpretación" para solicitar a Gemini el análisis contextual.
          </div>
        )}
      </div>
    </div>
  );
};
