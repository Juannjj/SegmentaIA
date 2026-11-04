import React, { useState } from 'react';
import {
  Briefcase,
  Radio,
  ShoppingBag,
  Landmark,
  HeartPulse,
  GraduationCap,
  Plane,
  Truck,
  Factory,
  Cpu,
  HelpCircle,
  ArrowRight,
  Check,
} from 'lucide-react';

interface Screen3SectorProps {
  sector: string;
  onSectorSelected: (sector: string) => void;
  onContinue: () => void;
}

export const Screen3Sector: React.FC<Screen3SectorProps> = ({
  sector,
  onSectorSelected,
  onContinue,
}) => {
  const [customSector, setCustomSector] = useState('');
  const [isCustom, setIsCustom] = useState(
    sector !== '' &&
      ![
        'Telecomunicaciones',
        'Comercio minorista',
        'Servicios financieros',
        'Salud',
        'Educación',
        'Turismo',
        'Transporte',
        'Industria',
        'Tecnología',
      ].includes(sector)
  );

  const sectors = [
    {
      id: 'Telecomunicaciones',
      name: 'Telecomunicaciones',
      desc: 'Planes móviles, banda ancha, consumo de datos, minutos y ARPU.',
      icon: Radio,
      badge: 'Conectividad & Churn',
    },
    {
      id: 'Comercio minorista',
      name: 'Comercio minorista (Retail)',
      desc: 'Frecuencia de compra, ticket promedio, tiendas físicas y e-commerce.',
      icon: ShoppingBag,
      badge: 'Fidelización & Cesta',
    },
    {
      id: 'Servicios financieros',
      name: 'Servicios financieros',
      desc: 'Banca comercial, tarjetas, saldos promedio, créditos y canales digitales.',
      icon: Landmark,
      badge: 'Riesgo & Saldo',
    },
    {
      id: 'Salud',
      name: 'Salud y Farmacia',
      desc: 'Afiliados a planes médicos, uso de coberturas, copagos y telemedicina.',
      icon: HeartPulse,
      badge: 'Siniestralidad & Cuidado',
    },
    {
      id: 'Educación',
      name: 'Educación',
      desc: 'Estudiantes, cursos matriculados, retención académica y programas.',
      icon: GraduationCap,
      badge: 'Retención & Admisiones',
    },
    {
      id: 'Turismo',
      name: 'Turismo y Hospitalidad',
      desc: 'Viajeros, noches de estancia, paquetes turísticos y temporadas.',
      icon: Plane,
      badge: 'Estacionalidad & Gasto',
    },
    {
      id: 'Transporte',
      name: 'Transporte y Logística',
      desc: 'Fletes, envíos, rutas, flotas corporativas y tiempos de tránsito.',
      icon: Truck,
      badge: 'Volumen & SLAs',
    },
    {
      id: 'Industria',
      name: 'Industria y Manufactura',
      desc: 'Pedidos B2B, maquinaria, volumen de suministro y contratos.',
      icon: Factory,
      badge: 'Contratos & Cadencia',
    },
    {
      id: 'Tecnología',
      name: 'Tecnología y SaaS',
      desc: 'Suscripciones recurrentes MRR, usuarios activos y adopción de software.',
      icon: Cpu,
      badge: 'MRR & Adopción',
    },
  ];

  const handleSelect = (secId: string) => {
    setIsCustom(false);
    onSectorSelected(secId);
  };

  const handleCustomSubmit = () => {
    if (customSector.trim()) {
      setIsCustom(true);
      onSectorSelected(customSector.trim());
    }
  };

  const canContinue = sector.trim().length > 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <Briefcase className="w-6 h-6 text-cyan-400" />
          <span>Definición del Sector Económico</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          El sector permite que la Inteligencia Artificial contextualice las interpretaciones descriptivas,
          el bautizo comercial de los clusters, las propuestas de valor y las campañas a 90 días.
        </p>
      </div>

      {/* Grid of predefined sectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sectors.map((s) => {
          const Icon = s.icon;
          const isSelected = !isCustom && sector === s.id;

          return (
            <div
              key={s.id}
              onClick={() => handleSelect(s.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 relative group flex flex-col justify-between ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-slate-800">
                    {s.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition">
                    {s.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="mt-4 pt-3 border-t border-cyan-800/60 flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
                  <Check className="w-4 h-4" />
                  <span>Sector seleccionado</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Sector Box */}
      <div className={`p-6 rounded-2xl border transition ${
        isCustom ? 'bg-cyan-950/30 border-cyan-500' : 'bg-slate-900/40 border-slate-800'
      }`}>
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">¿Tu empresa opera en otro sector?</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Ingresa el nombre de tu industria personalizada (ej: "Energía Renovable", "Inmobiliaria", "Bienes Raíces", "Restaurantes y Gastronomía").
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Ejemplo: Seguros y Fianzas Corporativas"
            value={customSector}
            onChange={(e) => setCustomSector(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="button"
            onClick={handleCustomSubmit}
            disabled={!customSector.trim()}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-50 transition"
          >
            Aplicar sector personalizado
          </button>
        </div>
      </div>

      {/* Selected Sector Summary Banner */}
      {sector && (
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Sector configurado</span>
              <p className="text-sm font-bold text-white">{sector}</p>
            </div>
          </div>

          <button
            onClick={onContinue}
            disabled={!canContinue}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20"
          >
            <span>Analizar datos</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
