import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  Archive,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ExportDataPayload,
  generateExcelWorkbook,
  generateExecutivePDF,
  generateFullZipPackage,
} from '../../utils/exportEngine';
import { QualityValidationItem } from '../../types';

interface Screen11ExportCenterProps {
  payload: ExportDataPayload;
  personaPosters: { clusterId: number; name: string; dataUrl: string }[];
  validations: QualityValidationItem[];
  onOpenQualityModal: () => void;
}

export const Screen11ExportCenter: React.FC<Screen11ExportCenterProps> = ({
  payload,
  personaPosters,
  validations,
  onOpenQualityModal,
}) => {
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isExportingCollage, setIsExportingCollage] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const passedValidations = validations.filter((v) => v.passed).length;
  const isAuditComplete = passedValidations === validations.length;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }
  };

  const handleDownloadExcel = () => {
    setIsExportingExcel(true);
    try {
      const blob = generateExcelWorkbook(payload);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SegmentaIA_${payload.sector.replace(/\s+/g, '_')}_Analisis_12Hojas.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess('Excel multi-hoja generado exitosamente.');
      triggerConfetti();
    } catch (err: any) {
      alert('Error generando Excel: ' + err.message);
    } finally {
      setIsExportingExcel(false);
    }
  };

  const handleDownloadPDF = () => {
    setIsExportingPdf(true);
    try {
      const blob = generateExecutivePDF(payload);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SegmentaIA_${payload.sector.replace(/\s+/g, '_')}_Informe_Ejecutivo.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess('Informe Ejecutivo en PDF generado exitosamente.');
      triggerConfetti();
    } catch (err: any) {
      alert('Error generando PDF: ' + err.message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleDownloadFullZip = async () => {
    setIsExportingZip(true);
    try {
      const blob = await generateFullZipPackage(payload, personaPosters);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SegmentaIA_Proyecto_Completo_${payload.sector.replace(/\s+/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadSuccess('Paquete ZIP completo descargado con éxito.');
      triggerConfetti();
    } catch (err: any) {
      alert('Error generando ZIP: ' + err.message);
    } finally {
      setIsExportingZip(false);
    }
  };

  // Generate a composite summary sheet (collage) of all persona cards
  const handleDownloadSummarySheet = () => {
    if (personaPosters.length === 0) return;
    setIsExportingCollage(true);

    try {
      const canvas = document.createElement('canvas');
      const cardWidth = 600;
      const cardHeight = 750;
      const cols = Math.min(personaPosters.length, 3);
      const rows = Math.ceil(personaPosters.length / cols);

      canvas.width = cols * cardWidth;
      canvas.height = rows * cardHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let loaded = 0;
      personaPosters.forEach((p, idx) => {
        const img = new Image();
        img.src = p.dataUrl;
        img.onload = () => {
          const cX = (idx % cols) * cardWidth;
          const cY = Math.floor(idx / cols) * cardHeight;
          ctx.drawImage(img, cX, cY, cardWidth, cardHeight);
          loaded++;

          if (loaded === personaPosters.length) {
            const collageUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = collageUrl;
            a.download = `SegmentaIA_Coleccion_Completa_${payload.sector.replace(/\s+/g, '_')}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setIsExportingCollage(false);
            setDownloadSuccess('Lámina resumen de personificaciones descargada.');
            triggerConfetti();
          }
        };
      });
    } catch (err: any) {
      alert('Error generando lámina resumen: ' + err.message);
      setIsExportingCollage(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Download className="w-6 h-6 text-cyan-400" />
          <span>Centro de Exportación y Descargas Profesionales</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Descarga los archivos finales del análisis: hojas de cálculo verificables, informe en PDF para directivos y láminas gráficas.
        </p>
      </div>

      {/* Success notification */}
      {downloadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
          <button
            onClick={() => setDownloadSuccess(null)}
            className="text-emerald-400 font-bold hover:underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Hero Master Download Button (ZIP Completo) */}
      <div className="relative rounded-3xl bg-gradient-to-r from-cyan-950/60 via-blue-950/40 to-slate-950 border border-cyan-800/60 p-8 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-900/60 border border-cyan-700/60 text-cyan-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Paquete Consolidado Todo-en-Uno</span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">
            Descargar Proyecto Completo (ZIP)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Empaqueta en un único archivo comprimido: el Libro de Excel con las 12 hojas oficiales,
            el Informe Ejecutivo en PDF con formato directivo, las láminas gráficas individuales en PNG y la ficha metodológica.
          </p>
        </div>

        <button
          onClick={handleDownloadFullZip}
          disabled={isExportingZip}
          className="shrink-0 flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition shadow-xl shadow-cyan-500/30 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
        >
          <Archive className={`w-5 h-5 ${isExportingZip ? 'animate-spin' : ''}`} />
          <span>{isExportingZip ? 'Generando ZIP...' : 'Descargar Proyecto Completo'}</span>
        </button>
      </div>

      {/* Individual Export Formats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Format 1: Excel 12 Sheets */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4 flex flex-col justify-between shadow-xl">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">
              Libro de Excel Oficial (.xlsx)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              12 hojas con datos originales, clientes segmentados con trazabilidad de IDs, estadísticas descriptivas, centroides y matrices.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside">
              <li>12 hojas estructuradas</li>
              <li>Centroides originales y estandarizados</li>
              <li>Métricas de validación de K-Means</li>
            </ul>
          </div>

          <button
            onClick={handleDownloadExcel}
            disabled={isExportingExcel}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 transition"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingExcel ? 'Generando...' : 'Descargar Excel (.xlsx)'}</span>
          </button>
        </div>

        {/* Format 2: Executive PDF Report */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4 flex flex-col justify-between shadow-xl">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">
              Informe Ejecutivo (.pdf)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Documento formateado para comités directivos: portada, diagnóstico, validación de clusters, perfiles comerciales y cronograma 90 días.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside">
              <li>Portada con métricas clave</li>
              <li>Tablas de centroides y perfiles</li>
              <li>Plan táctico de marketing</li>
            </ul>
          </div>

          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPdf}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-rose-600 hover:text-white text-slate-200 transition"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingPdf ? 'Generando...' : 'Descargar PDF Ejecutivo'}</span>
          </button>
        </div>

        {/* Format 3: Composite Persona Sheet */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4 flex flex-col justify-between shadow-xl">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">
              Lámina Resumen de Personas (.png)
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lámina gráfica consolidada con todas las personificaciones visuales en alta resolución para presentaciones y marketing.
            </p>
            <ul className="text-[11px] text-slate-500 space-y-1 list-disc list-inside">
              <li>Formato visual editorial</li>
              <li>Tipografía y títulos exactos</li>
              <li>{personaPosters.length} segmentos personificados</li>
            </ul>
          </div>

          <button
            onClick={handleDownloadSummarySheet}
            disabled={isExportingCollage || personaPosters.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-200 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingCollage ? 'Componiendo...' : 'Descargar Lámina Resumen'}</span>
          </button>
        </div>
      </div>

      {/* Project Validation Audit Checklist Summary */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isAuditComplete ? 'bg-emerald-500/10 text-emerald-400' : 'bg-cyan-500/10 text-cyan-400'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Validación de Calidad del Proyecto (Control Automático)
              </h3>
              <p className="text-xs text-slate-400">
                Verificación de integridad de 12 puntos antes del cierre del análisis.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenQualityModal}
            className="self-start sm:self-auto text-xs font-semibold text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>Ver auditoría detallada ({passedValidations}/12)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mini Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {validations.slice(0, 8).map((v) => (
            <div
              key={v.id}
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                v.passed
                  ? 'bg-slate-950/60 border-slate-800 text-slate-200'
                  : 'bg-slate-950/30 border-slate-800/40 text-slate-500'
              }`}
            >
              {v.passed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-slate-600 shrink-0" />
              )}
              <span className="truncate text-[11px] font-medium">{v.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Executive Final Summary */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
        <p className="font-semibold text-white">Resumen Final del Estudio:</p>
        <p className="leading-relaxed">
          Se procesaron con éxito {payload.rawRows.length} clientes en el sector {payload.sector},
          segmentados matemáticamente en {payload.kMeansResult.k} clusters utilizando Lloyd K-Means++ con semilla determinista {payload.kMeansResult.seed}.
          Se obtuvieron un Silhouette Score de {payload.kMeansResult.silhouetteScore} y un índice Davies-Bouldin de {payload.kMeansResult.daviesBouldinIndex}.
          Todas las estrategias comerciales y cronogramas de comunicación a 90 días quedan registrados con trazabilidad de identificadores individuales.
        </p>
      </div>
    </div>
  );
};
