import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  RotateCw,
  ArrowRight,
  Eye,
  CheckCircle2,
  X,
  AlertCircle,
  Cpu,
} from 'lucide-react';
import { ClusterProfile, PersonaImage } from '../../types';

interface Screen10PersonaGalleryProps {
  sector: string;
  profiles: ClusterProfile[];
  personaImages: Record<number, PersonaImage>;
  isGeneratingAll: boolean;
  onGenerateSingle: (clusterId: number) => void;
  onGenerateAll: () => void;
  onContinue: () => void;
}

export const Screen10PersonaGallery: React.FC<Screen10PersonaGalleryProps> = ({
  sector,
  profiles,
  personaImages,
  isGeneratingAll,
  onGenerateSingle,
  onGenerateAll,
  onContinue,
}) => {
  const [previewModalImg, setPreviewModalImg] = useState<{ url: string; name: string } | null>(null);

  const downloadImage = (dataUrl: string, clusterName: string, clusterIdx: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `SegmentaIA_Segmento_${clusterIdx + 1}_${clusterName.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-cyan-400" />
            <span>Galería de Personificaciones Visuales con IA</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Láminas verticales de dirección editorial (formato 4:5) que personifican el comportamiento real de cada segmento en {sector}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onGenerateAll}
            disabled={isGeneratingAll}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 transition disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAll ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isGeneratingAll ? 'Generando colección...' : 'Regenerar todas las imágenes'}</span>
          </button>

          <button
            onClick={onContinue}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20"
          >
            <span>Exportar resultados</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Information Banner on Direction & Typography Precision */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs text-slate-300">
        <Cpu className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Garantía de Fidelidad Tipográfica:</strong> Las láminas integran una capa gráfica de renderizado en alta definición
          con el nombre exacto de cada cluster, métricas calculadas y paleta armónica corporativa. Las ilustraciones visuales son generadas automáticamente
          a partir del perfil de centroides.
        </p>
      </div>

      {/* Persona Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile, idx) => {
          const persona = personaImages[profile.clusterId];
          const hasImage = !!persona?.imageUrl;
          const isLoading = persona?.loading || isGeneratingAll;

          return (
            <div
              key={profile.clusterId}
              className="group rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 p-5 space-y-4 flex flex-col justify-between transition-all duration-200 shadow-xl"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    Segmento {idx + 1} ({profile.percentage}%)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {profile.size} clientes
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-1">
                  {profile.name}
                </h3>

                {/* 4:5 Poster Image Frame */}
                <div className="relative aspect-[4/5] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
                  {isLoading ? (
                    <div className="text-center space-y-2 p-4">
                      <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-[11px] text-slate-400 font-medium">
                        Generando personificación con IA...
                      </p>
                    </div>
                  ) : hasImage ? (
                    <>
                      <img
                        src={persona.imageUrl}
                        alt={`Personificación de ${profile.name}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPreviewModalImg({ url: persona.imageUrl!, name: profile.name })}
                          className="p-2 rounded-xl bg-slate-800 text-white hover:bg-cyan-500 hover:text-slate-950 transition shadow-lg"
                          title="Ver en alta resolución"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadImage(persona.imageUrl!, profile.name, idx)}
                          className="p-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-500 transition shadow-lg"
                          title="Descargar PNG individual"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center space-y-2 p-4">
                      <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-[11px] text-slate-500">Pendiente de generación</p>
                    </div>
                  )}
                </div>

                {/* Main Trait Snippet */}
                <p className="text-[11px] text-slate-300 italic line-clamp-2">
                  "{profile.mainCharacteristic}"
                </p>
              </div>

              {/* Bottom Card Controls */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => onGenerateSingle(profile.clusterId)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition disabled:opacity-50 text-[11px]"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Regenerar</span>
                </button>

                {hasImage && (
                  <button
                    onClick={() => downloadImage(persona.imageUrl!, profile.name, idx)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition text-[11px] font-semibold"
                  >
                    <Download className="w-3 h-3 text-cyan-400" />
                    <span>Descargar PNG</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-res Zoom Modal */}
      {previewModalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="text-sm font-bold text-white mb-3 text-center">
              {previewModalImg.name}
            </h4>
            <img
              src={previewModalImg.url}
              alt={previewModalImg.name}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] w-auto rounded-2xl border border-slate-800 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
