export interface SampleDataset {
  id: string;
  name: string;
  sector: string;
  description: string;
  fileName: string;
  rows: Record<string, any>[];
}

export const SAMPLE_DATASETS: SampleDataset[] = [
  {
    id: 'telecom',
    name: 'Telecomunicaciones — Clientes Móviles y Hogar',
    sector: 'Telecomunicaciones',
    description: '150 clientes con variables de consumo de datos, minutos de voz, facturación ARPU, antigüedad y servicios adicionales.',
    fileName: 'telecom_clientes_consumo.xlsx',
    rows: generateTelecomData(150),
  },
  {
    id: 'retail',
    name: 'Comercio Minorista — Hábitos de Compra y Fidelización',
    sector: 'Comercio minorista',
    description: '140 clientes de retail con ticket promedio, frecuencia de compra, gasto anual, tasa de devolución y compras en línea.',
    fileName: 'retail_clientes_fidelizacion.xlsx',
    rows: generateRetailData(140),
  },
  {
    id: 'banking',
    name: 'Servicios Financieros — Tarjetahabientes y Depósitos',
    sector: 'Servicios financieros',
    description: '130 clientes bancarios con saldo promedio, transacciones mensuales, score crediticio, uso de canales digitales y mora.',
    fileName: 'banca_tarjetahabientes.xlsx',
    rows: generateBankingData(130),
  },
  {
    id: 'health',
    name: 'Salud — Afiliados a Planes Médicos',
    sector: 'Salud',
    description: '120 afiliados con consultas anuales, gasto en medicamentos, copagos, edad del titular y uso de telemedicina.',
    fileName: 'salud_afiliados_planes.xlsx',
    rows: generateHealthData(120),
  },
];

function generateTelecomData(count: number): Record<string, any>[] {
  const archetypes = [
    { weight: 0.35, arpu: [22, 38], gb: [5, 18], min: [80, 250], months: [4, 24], addOns: ['Básico', 'Estándar'], billType: 'Digital' },
    { weight: 0.25, arpu: [65, 110], gb: [40, 120], min: [300, 900], months: [18, 60], addOns: ['Premium', 'Ilimitado'], billType: 'Digital' },
    { weight: 0.20, arpu: [14, 24], gb: [1, 4], min: [250, 650], months: [36, 110], addOns: ['Ninguno', 'Básico'], billType: 'Física' },
    { weight: 0.20, arpu: [45, 75], gb: [20, 50], min: [120, 400], months: [10, 48], addOns: ['Estándar', 'Streaming'], billType: 'Digital' },
  ];

  const rows: Record<string, any>[] = [];
  for (let i = 1; i <= count; i++) {
    const r = Math.random();
    let arch = archetypes[0];
    if (r > 0.8) arch = archetypes[3];
    else if (r > 0.6) arch = archetypes[2];
    else if (r > 0.35) arch = archetypes[1];

    const arpu = Number((arch.arpu[0] + Math.random() * (arch.arpu[1] - arch.arpu[0])).toFixed(2));
    const consumoGb = Number((arch.gb[0] + Math.random() * (arch.gb[1] - arch.gb[0])).toFixed(1));
    const minutosVoz = Math.round(arch.min[0] + Math.random() * (arch.min[1] - arch.min[0]));
    const antiguedadMeses = Math.round(arch.months[0] + Math.random() * (arch.months[1] - arch.months[0]));
    const planAdicional = arch.addOns[Math.floor(Math.random() * arch.addOns.length)];
    const scoreSatisfaccion = Math.min(10, Math.max(1, Math.round(5 + Math.random() * 5 - (arpu > 80 && consumoGb < 20 ? 2 : 0))));
    const reclamosUltimoAno = Math.random() > 0.75 ? Math.floor(Math.random() * 4) + 1 : 0;

    rows.push({
      cliente_id: `TEL-${1000 + i}`,
      arpu_mensual: arpu,
      consumo_datos_gb: consumoGb,
      minutos_voz: minutosVoz,
      antiguedad_meses: antiguedadMeses,
      plan_adicional: planAdicional,
      tipo_factura: arch.billType,
      satisfaccion_csat: scoreSatisfaccion,
      reclamos_anuales: reclamosUltimoAno,
    });
  }
  return rows;
}

function generateRetailData(count: number): Record<string, any>[] {
  const rows: Record<string, any>[] = [];
  for (let i = 1; i <= count; i++) {
    const group = i % 3;
    let ticket = 35;
    let compras = 4;
    let pctOnline = 20;

    if (group === 0) {
      ticket = 140 + Math.random() * 120;
      compras = 15 + Math.random() * 25;
      pctOnline = 60 + Math.random() * 35;
    } else if (group === 1) {
      ticket = 65 + Math.random() * 45;
      compras = 8 + Math.random() * 12;
      pctOnline = 30 + Math.random() * 40;
    } else {
      ticket = 20 + Math.random() * 30;
      compras = 1 + Math.random() * 4;
      pctOnline = Math.random() * 30;
    }

    const gastoAnual = Number((ticket * compras).toFixed(2));
    const recenciaDias = Math.round(5 + Math.random() * (group === 2 ? 180 : 45));

    rows.push({
      codigo_cliente: `RET-${2000 + i}`,
      ticket_promedio: Number(ticket.toFixed(2)),
      frecuencia_anual: Math.round(compras),
      gasto_total_anual: gastoAnual,
      recencia_ult_compra_dias: recenciaDias,
      porcentaje_compras_online: Number(pctOnline.toFixed(1)),
      categoria_favorita: ['Moda', 'Electrónica', 'Hogar', 'Alimentos'][Math.floor(Math.random() * 4)],
      devoluciones_anuales: Math.random() > 0.6 ? Math.floor(Math.random() * 3) : 0,
    });
  }
  return rows;
}

function generateBankingData(count: number): Record<string, any>[] {
  const rows: Record<string, any>[] = [];
  for (let i = 1; i <= count; i++) {
    const isPremium = i % 4 === 0;
    const isCreditIntensive = i % 4 === 1;

    let saldo = isPremium ? 8500 + Math.random() * 25000 : 800 + Math.random() * 3500;
    let transacciones = isCreditIntensive ? 35 + Math.random() * 40 : 10 + Math.random() * 25;
    let score = isPremium ? 760 + Math.random() * 90 : 580 + Math.random() * 170;

    rows.push({
      nro_cuenta: `BNC-${5000 + i}`,
      saldo_promedio_usd: Number(saldo.toFixed(2)),
      transacciones_mes: Math.round(transacciones),
      score_crediticio: Math.round(score),
      edad_titular: Math.round(24 + Math.random() * 45),
      tipo_tarjeta: isPremium ? 'Black' : isCreditIntensive ? 'Gold' : 'Clásica',
      uso_app_bancaria_pct: Number((50 + Math.random() * 50).toFixed(1)),
      dias_mora_max: Math.random() > 0.85 ? Math.floor(Math.random() * 30) : 0,
    });
  }
  return rows;
}

function generateHealthData(count: number): Record<string, any>[] {
  const rows: Record<string, any>[] = [];
  for (let i = 1; i <= count; i++) {
    const isSenior = i % 3 === 0;
    const consultas = isSenior ? 8 + Math.random() * 14 : 1 + Math.random() * 6;
    const copago = consultas * (25 + Math.random() * 30);
    const medicamentos = isSenior ? 400 + Math.random() * 1200 : 50 + Math.random() * 300;

    rows.push({
      id_afiliado: `MED-${8000 + i}`,
      consultas_medicas_ano: Math.round(consultas),
      gasto_medicamentos_usd: Number(medicamentos.toFixed(2)),
      copagos_totales_usd: Number(copago.toFixed(2)),
      edad_afiliado: Math.round(isSenior ? 58 + Math.random() * 24 : 21 + Math.random() * 35),
      tipo_cobertura: isSenior ? 'Integral' : ['Básica', 'Preferencial'][Math.floor(Math.random() * 2)],
      sesiones_telemedicina: Math.floor(Math.random() * 5),
    });
  }
  return rows;
}
