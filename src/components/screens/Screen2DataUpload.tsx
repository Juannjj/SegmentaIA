import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Database,
  Filter,
  Eye,
  SlidersHorizontal,
  Info,
  Trash2,
} from 'lucide-react';
import { ColumnMeta, ColumnRole, PreprocessingConfig } from '../../types';
import { parseFile, ParseResult } from '../../utils/fileParser';

interface Screen2DataUploadProps {
  fileName: string;
  sheets: string[];
  selectedSheet: string;
  rows: Record<string, any>[];
  columns: ColumnMeta[];
  duplicateCount: number;
  config: PreprocessingConfig;
  onFileParsed: (result: ParseResult) => void;
  onSheetChanged: (sheetName: string) => void;
  onColumnRoleChanged: (colName: string, role: ColumnRole) => void;
  onConfigChanged: (config: PreprocessingConfig) => void;
  onContinue: () => void;
}

export const Screen2DataUpload: React.FC<Screen2DataUploadProps> = ({
  fileName,
  sheets,
  selectedSheet,
  rows,
  columns,
  duplicateCount,
  config,
  onFileParsed,
  onSheetChanged,
  onColumnRoleChanged,
  onConfigChanged,
  onContinue,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await parseFile(file);
      onFileParsed(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar el archivo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const featureCount = columns.filter((c) => c.role === 'feature').length;
  const hasMinData = rows.length >= 10;
  const canContinue = hasMinData && featureCount >= 1;

  // Total missing values across all cells
  const totalCells = rows.length * columns.length;
  const totalMissing = columns.reduce((acc, c) => acc + c.missingCount, 0);
  const overallMissingPct = totalCells > 0 ? ((totalMissing / totalCells) * 100).toFixed(1) : '0';

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <UploadCloud className="w-6 h-6 text-cyan-400" />
          <span>Carga y Validación de la Base de Datos</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Sube tu archivo real en formato Excel (.xlsx, .xls), CSV o TXT. Tus datos se procesan en tu entorno de forma segura.
        </p>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20 shadow-xl shadow-cyan-500/10'
            : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.txt"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-cyan-400">
            {isLoading ? (
              <div className="w-7 h-7 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileSpreadsheet className="w-8 h-8" />
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-white">
              {fileName ? `Archivo cargado: ${fileName}` : 'Arrastra tu archivo aquí o explora'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Compatible con Excel (.xlsx, .xls), CSV delimitado o TXT tabulado
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition shadow-lg shadow-cyan-600/25"
            >
              Seleccionar archivo local
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs flex items-center gap-2 text-left">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dataset Technical Sheet & Diagnostics (Only if data loaded) */}
      {rows.length > 0 && (
        <div className="space-y-6">
          {/* Sheet Selector if multiple sheets in Excel */}
          {sheets.length > 1 && (
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-white">Hoja de cálculo activa:</span>
              </div>
              <select
                value={selectedSheet}
                onChange={(e) => onSheetChanged(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-cyan-300 font-medium focus:outline-none focus:border-cyan-500"
              >
                {sheets.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Ficha Técnica Indicator Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400">Total de Registros</span>
              <p className="text-2xl font-bold text-white mt-1">{rows.length.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3 h-3" /> Base suficiente (&gt; 10)
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400">Variables Detectadas</span>
              <p className="text-2xl font-bold text-white mt-1">{columns.length}</p>
              <span className="text-[10px] text-cyan-400 mt-1 block">
                {featureCount} activas para K-Means
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400">Valores Faltantes</span>
              <p className="text-2xl font-bold text-white mt-1">{totalMissing}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {overallMissingPct}% de la matriz
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400">Filas Duplicadas</span>
              <p className="text-2xl font-bold text-white mt-1">{duplicateCount}</p>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {duplicateCount > 0 ? 'Opción de depuración activa' : 'Base sin duplicados'}
              </span>
            </div>
          </div>

          {/* Data Preview Table (First 2-5 rows) */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-lg">
            <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Vista Previa de Registros (Primeras 3 filas)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Mostrando {Math.min(3, rows.length)} de {rows.length} filas
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-slate-600">#</th>
                    {columns.map((c) => (
                      <th key={c.name} className="py-2.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{c.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            {c.type}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {rows.slice(0, 3).map((r, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-slate-600">{rIdx + 1}</td>
                      {columns.map((c) => (
                        <td key={c.name} className="py-2 px-3 text-slate-300 whitespace-nowrap">
                          {r[c.name] !== null && r[c.name] !== undefined ? String(r[c.name]) : <span className="text-red-400 italic">null</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Column Roles & Preprocessing Setup */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                  <span>Configuración de Roles de Variables y Limpieza</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Selecciona qué variables alimentarán K-Means, cuáles identificarán al cliente y el tratamiento de nulos.
                </p>
              </div>
            </div>

            {/* Global cleaning options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tratamiento de Valores Faltantes (Nulos):
                </label>
                <select
                  value={config.missingHandling}
                  onChange={(e) =>
                    onConfigChanged({
                      ...config,
                      missingHandling: e.target.value as any,
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                >
                  <option value="mean">Imputar con la Media (Recomendado para numéricas continuas)</option>
                  <option value="median">Imputar con la Mediana (Robusto ante valores extremos)</option>
                  <option value="mode">Imputar con la Moda (Valor más frecuente)</option>
                  <option value="drop">Eliminar registros con valores faltantes</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  La imputación conserva el tamaño de muestra sin sesgar centroides.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tratamiento de Registros Duplicados:
                </label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="dropDupes"
                    checked={config.dropDuplicates}
                    onChange={(e) =>
                      onConfigChanged({
                        ...config,
                        dropDuplicates: e.target.checked,
                      })
                    }
                    className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                  />
                  <label htmlFor="dropDupes" className="text-slate-300 text-xs cursor-pointer">
                    Excluir automáticamente {duplicateCount} filas idénticas
                  </label>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Evita que registros redundantes sobredimensionen centroides de forma artificial.
                </p>
              </div>
            </div>

            {/* Column Role Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Variable</th>
                    <th className="py-2.5 px-3">Tipo Detectado</th>
                    <th className="py-2.5 px-3">Faltantes</th>
                    <th className="py-2.5 px-3">Unicidad</th>
                    <th className="py-2.5 px-3">Rol en la Segmentación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {columns.map((c) => (
                    <tr key={c.name} className="hover:bg-slate-800/20">
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {c.name}
                        {c.isConstant && (
                          <span className="ml-2 text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded">
                            Constante
                          </span>
                        )}
                        {c.isHighCardinality && c.type !== 'id' && (
                          <span className="ml-2 text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded">
                            Alta Cardinalidad
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          c.type === 'numeric'
                            ? 'bg-blue-950 text-blue-300'
                            : c.type === 'categorical'
                            ? 'bg-purple-950 text-purple-300'
                            : c.type === 'id'
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {c.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {c.missingCount} ({c.missingPercentage}%)
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 font-mono">
                        {c.uniqueCount} únicos
                      </td>
                      <td className="py-2.5 px-3">
                        <select
                          value={c.role}
                          onChange={(e) => onColumnRoleChanged(c.name, e.target.value as ColumnRole)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium border focus:outline-none ${
                            c.role === 'feature'
                              ? 'bg-cyan-950 border-cyan-700 text-cyan-200'
                              : c.role === 'id'
                              ? 'bg-emerald-950 border-emerald-700 text-emerald-200'
                              : c.role === 'interpret_only'
                              ? 'bg-indigo-950 border-indigo-700 text-indigo-200'
                              : 'bg-slate-900 border-slate-800 text-slate-400'
                          }`}
                        >
                          <option value="feature">Variable de Clustering (K-Means)</option>
                          <option value="id">Identificador del Cliente (ID)</option>
                          <option value="interpret_only">Solo para Interpretar (Perfil)</option>
                          <option value="excluded">Excluir del Modelo</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {featureCount === 0 && (
              <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-800/80 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Debes asignar al menos 1 variable con el rol "Variable de Clustering (K-Means)" para continuar.</span>
              </div>
            )}
          </div>

          {/* Bottom Action */}
          <div className="flex items-center justify-between pt-4">
            <div className="text-xs text-slate-400">
              <span>{featureCount} variables seleccionadas para clustering</span>
            </div>

            <button
              onClick={onContinue}
              disabled={!canContinue}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition shadow-lg ${
                canContinue
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Continuar: Seleccionar Sector Económico</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
