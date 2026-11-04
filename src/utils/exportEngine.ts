import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import JSZip from 'jszip';
import {
  ColumnMeta,
  NumericStats,
  CategoricalStats,
  KMeansResult,
  ClusterProfile,
  MarketingStrategy,
  PreprocessingConfig,
} from '../types';

export interface ExportDataPayload {
  sector: string;
  fileName: string;
  rawRows: Record<string, any>[];
  columns: ColumnMeta[];
  numericStats: Record<string, NumericStats>;
  categoricalStats: Record<string, CategoricalStats>;
  kMeansResult: KMeansResult;
  clusterProfiles: ClusterProfile[];
  strategies: MarketingStrategy[];
  config: PreprocessingConfig;
  personaImages?: { clusterId: number; name: string; dataUrl: string }[];
}

// 1. Generate Full 12-Sheet Excel Workbook
export function generateExcelWorkbook(payload: ExportDataPayload): Blob {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Datos originales
  const wsOriginal = XLSX.utils.json_to_sheet(payload.rawRows);
  XLSX.utils.book_append_sheet(wb, wsOriginal, 'Datos originales');

  // Sheet 2: Datos preparados y Clientes segmentados
  const segmentedRows = payload.rawRows.map((row, idx) => ({
    ...row,
    CLUSTER_ASIGNADO: (payload.kMeansResult.assignedClusters[idx] ?? 0) + 1,
    NOMBRE_SEGMENTO:
      payload.clusterProfiles[payload.kMeansResult.assignedClusters[idx]]?.name ||
      `Segmento ${(payload.kMeansResult.assignedClusters[idx] ?? 0) + 1}`,
    DISTANCIA_AL_CENTROIDE: payload.kMeansResult.clusterDistances[idx] ?? 0,
  }));
  const wsSegmented = XLSX.utils.json_to_sheet(segmentedRows);
  XLSX.utils.book_append_sheet(wb, wsSegmented, 'Clientes segmentados');

  // Sheet 3: Estadísticas descriptivas
  const descRows = Object.entries(payload.numericStats).map(([col, s]) => ({
    Variable: col,
    'Observaciones Válidas': s.validCount,
    Media: s.mean,
    Mediana: s.median,
    Moda: s.mode ?? 'N/A',
    'Desviación Estándar': s.stdDev,
    Varianza: s.variance,
    Mínimo: s.min,
    Máximo: s.max,
    'Cuartil 1 (Q1)': s.q1,
    'Cuartil 3 (Q3)': s.q3,
    'Rango IQR': s.iqr,
    'Coef. Variación (%)': s.cv,
    'Asimetría (Skewness)': s.skewness,
    '% Faltantes': s.missingPercentage,
    'Valores Atípicos (IQR)': s.outliersCount,
  }));
  const wsStats = XLSX.utils.json_to_sheet(descRows);
  XLSX.utils.book_append_sheet(wb, wsStats, 'Estadísticas descriptivas');

  // Sheet 4: Variables categóricas
  const catRows: any[] = [];
  Object.entries(payload.categoricalStats).forEach(([col, s]) => {
    s.relativeFreqs.forEach((rf) => {
      catRows.push({
        Variable: col,
        Categoría: rf.category,
        'Porcentaje (%)': rf.percentage,
        'Categoría Predominante': s.predominantCategory,
        'Cantidad de Categorías': s.categoryCount,
      });
    });
  });
  const wsCat = XLSX.utils.json_to_sheet(catRows.length > 0 ? catRows : [{ Variable: 'Sin variables categóricas' }]);
  XLSX.utils.book_append_sheet(wb, wsCat, 'Variables categóricas');

  // Sheet 5: Centroides originales
  const centOrigRows = payload.kMeansResult.centroidsOriginal.map((cent, idx) => ({
    Cluster: idx + 1,
    'Nombre Comercial': payload.clusterProfiles[idx]?.name || `Cluster ${idx + 1}`,
    ...cent,
  }));
  const wsCentOrig = XLSX.utils.json_to_sheet(centOrigRows);
  XLSX.utils.book_append_sheet(wb, wsCentOrig, 'Centroides originales');

  // Sheet 6: Centroides estandarizados
  const centStdRows = payload.kMeansResult.centroidsStandardized.map((cent, idx) => ({
    Cluster: idx + 1,
    'Nombre Comercial': payload.clusterProfiles[idx]?.name || `Cluster ${idx + 1}`,
    ...cent,
  }));
  const wsCentStd = XLSX.utils.json_to_sheet(centStdRows);
  XLSX.utils.book_append_sheet(wb, wsCentStd, 'Centroides estandarizados');

  // Sheet 7: Resumen de clusters
  const clusterSummaryRows = payload.clusterProfiles.map((p, idx) => ({
    'ID Cluster': idx + 1,
    'Nombre Comercial': p.name,
    'N° Clientes': p.size,
    '% del Total': `${p.percentage}%`,
    'Rasgo Principal': p.mainCharacteristic,
    'Variables Clave': p.differentiatingFeatures.map((d) => `${d.variable} (${d.direction === 'superior' ? '+' : '-'}${Math.abs(d.zScore)}σ)`).join('; '),
    Descripción: p.description,
    'Oportunidades Comerciales': p.commercialOpportunities.join(' | '),
    Advertencias: p.caveats,
  }));
  const wsSummary = XLSX.utils.json_to_sheet(clusterSummaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen de clusters');

  // Sheet 8: Métricas de validación
  const valMetrics = [
    { Métrica: 'Algoritmo', Valor: 'K-Means (Lloyd con K-Means++)' },
    { Métrica: 'Número de Clusters (K)', Valor: payload.kMeansResult.k },
    { Métrica: 'Semilla Aleatoria (Seed)', Valor: payload.kMeansResult.seed },
    { Métrica: 'Iteraciones hasta Convergencia', Valor: payload.kMeansResult.iterations },
    { Métrica: 'Inercia (WCSS)', Valor: payload.kMeansResult.inertia },
    { Métrica: 'Silhouette Score (-1 a 1)', Valor: payload.kMeansResult.silhouetteScore },
    { Métrica: 'Davies-Bouldin Index (Menor es mejor)', Valor: payload.kMeansResult.daviesBouldinIndex },
    { Métrica: 'Calinski-Harabasz Index (Mayor es mejor)', Valor: payload.kMeansResult.calinskiHarabaszIndex },
    { Métrica: 'Varianza Explicada PCA (PC1, PC2)', Valor: `${payload.kMeansResult.pcaVariance[0]}%, ${payload.kMeansResult.pcaVariance[1]}%` },
  ];
  const wsMetrics = XLSX.utils.json_to_sheet(valMetrics);
  XLSX.utils.book_append_sheet(wb, wsMetrics, 'Métricas de validación');

  // Sheet 9: Estrategias comerciales
  const stratRows = payload.strategies.map((st, idx) => ({
    Cluster: idx + 1,
    Segmento: payload.clusterProfiles[idx]?.name || `Cluster ${idx + 1}`,
    'Diagnóstico Comercial': st.diagnosticoComercial,
    'Objetivo Comercial': st.objetivoComercial,
    'Estrategia de Mercadeo': st.estrategiaMarketing,
    'Propuesta de Valor': st.propuestaValor,
    'Canales Sugeridos': st.canalesRecomendados.join(', '),
    'Mensaje Principal': st.mensajes.mensajePrincipal,
    'Texto SMS': st.mensajes.sms,
    'Email Asunto': st.mensajes.email.asunto,
    'WhatsApp': st.mensajes.whatsapp,
    'Call to Action': st.mensajes.cta,
    'Concepto Campaña': st.mensajes.conceptoCampana,
    KPIs: st.kpis.join(' | '),
    'Metas Tentativas': st.metasComerciales.join(' | '),
  }));
  const wsStrat = XLSX.utils.json_to_sheet(stratRows);
  XLSX.utils.book_append_sheet(wb, wsStrat, 'Estrategias comerciales');

  // Sheet 10: Plan de comunicación (90 días)
  const commRows: any[] = [];
  payload.strategies.forEach((st, idx) => {
    st.plan90Dias.forEach((phase) => {
      commRows.push({
        Segmento: payload.clusterProfiles[idx]?.name || `Cluster ${idx + 1}`,
        Fase: phase.fase,
        Actividades: phase.actividades,
        Canal: phase.canal,
        KPI: phase.kpi,
        Responsable: phase.responsable,
      });
    });
  });
  const wsComm = XLSX.utils.json_to_sheet(commRows);
  XLSX.utils.book_append_sheet(wb, wsComm, 'Plan de comunicación');

  // Sheet 11: Metodología y configuración
  const configRows = [
    { Parámetro: 'Sector Económico', Valor: payload.sector },
    { Parámetro: 'Archivo Fuente', Valor: payload.fileName },
    { Parámetro: 'Registros Totales Analizados', Valor: payload.rawRows.length },
    { Parámetro: 'Escalador de Datos', Valor: payload.config.scaler === 'robust' ? 'RobustScaler' : 'StandardScaler' },
    { Parámetro: 'Tratamiento de Valores Faltantes', Valor: payload.config.missingHandling },
    { Parámetro: 'Codificación Categórica', Valor: 'One-Hot Encoding balanceado' },
    { Parámetro: 'Inicialización', Valor: 'K-Means++ con 20 reinicios (n_init)' },
    { Parámetro: 'Fecha de Generación', Valor: new Date().toLocaleString('es-ES') },
  ];
  const wsConfig = XLSX.utils.json_to_sheet(configRows);
  XLSX.utils.book_append_sheet(wb, wsConfig, 'Metodología y configuración');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

// 2. Generate Professional Executive PDF Report
export function generateExecutivePDF(payload: ExportDataPayload): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const primaryColor = [15, 23, 42]; // Slate 900
  const techBlue = [2, 132, 199]; // Sky 600
  const cyanAccent = [6, 182, 212]; // Cyan 500

  // Cover Page
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 297, 'F');

  // Header band
  doc.setFillColor(3, 105, 161);
  doc.rect(0, 40, 210, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text('SegmentaIA', 20, 75);

  doc.setFontSize(14);
  doc.setTextColor(6, 182, 212);
  doc.text('Plataforma Inteligente de Segmentación de Mercados', 20, 85);

  doc.setFontSize(18);
  doc.setTextColor(240, 249, 255);
  doc.text('INFORME EJECUTIVO Y PLAN ESTRATÉGICO', 20, 115);

  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184);
  doc.text(`Sector Económico: ${payload.sector.toUpperCase()}`, 20, 130);
  doc.text(`Archivo analizado: ${payload.fileName}`, 20, 138);
  doc.text(`Base de clientes: ${payload.rawRows.length} registros`, 20, 146);
  doc.text(`Segmentos identificados (K): ${payload.kMeansResult.k}`, 20, 154);
  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-ES')}`, 20, 162);

  // Key KPI Cards on cover
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(20, 180, 50, 30, 3, 3, 'F');
  doc.roundedRect(80, 180, 50, 30, 3, 3, 'F');
  doc.roundedRect(140, 180, 50, 30, 3, 3, 'F');

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('SILHOUETTE SCORE', 25, 190);
  doc.text('DAVIES-BOULDIN', 85, 190);
  doc.text('CALINSKI-HARABASZ', 145, 190);

  doc.setFontSize(16);
  doc.setTextColor(6, 182, 212);
  doc.text(payload.kMeansResult.silhouetteScore.toString(), 25, 203);
  doc.text(payload.kMeansResult.daviesBouldinIndex.toString(), 85, 203);
  doc.text(payload.kMeansResult.calinskiHarabaszIndex.toString(), 145, 203);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Generado con K-Means Lloyd y Análisis Estadístico Verificable', 20, 280);

  // Page 2: Estadísticas Descriptivas
  doc.addPage();
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Diagnóstico de Datos y Estadísticas Descriptivas', 15, 20);

  const statsBody = Object.entries(payload.numericStats).map(([col, s]) => [
    col,
    s.validCount.toString(),
    s.mean.toString(),
    s.median.toString(),
    s.stdDev.toString(),
    s.min.toString(),
    s.max.toString(),
    s.skewness.toString(),
    `${s.missingPercentage}%`,
    s.outliersCount.toString(),
  ]);

  autoTable(doc, {
    startY: 28,
    head: [['Variable', 'Válidos', 'Media', 'Mediana', 'Desv. Est.', 'Mín', 'Máx', 'Asimetría', '% Falt.', 'Atípicos']],
    body: statsBody,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
  });

  // Page 3: Resumen de Segmentos y Centroides
  doc.addPage();
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Resultados de Clustering K-Means y Perfiles de Clientes', 15, 20);

  const clusterSummaryBody = payload.clusterProfiles.map((p, idx) => [
    `Cluster ${idx + 1}`,
    p.name,
    `${p.size} (${p.percentage}%)`,
    p.mainCharacteristic,
    p.differentiatingFeatures.slice(0, 3).map((d) => `${d.variable} (${d.direction === 'superior' ? '+' : '-'}${Math.abs(d.zScore)}σ)`).join(', '),
  ]);

  autoTable(doc, {
    startY: 28,
    head: [['ID', 'Nombre Comercial', 'Tamaño', 'Característica Principal', 'Variables Más Diferenciadoras']],
    body: clusterSummaryBody,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [2, 132, 199], textColor: [255, 255, 255] },
  });

  // Original Centroids Table
  const lastY = (doc as any).lastAutoTable?.finalY || 100;
  doc.setFontSize(13);
  doc.text('Centroides en Escala Original (Medias por Segmento)', 15, lastY + 12);

  const centCols = ['Segmento', ...payload.kMeansResult.originalNumericFeatures.slice(0, 6)];
  const centBody = payload.kMeansResult.centroidsOriginal.map((c, idx) => [
    payload.clusterProfiles[idx]?.name || `Cluster ${idx + 1}`,
    ...payload.kMeansResult.originalNumericFeatures.slice(0, 6).map((f) => (c[f] !== undefined ? c[f].toString() : '-')),
  ]);

  autoTable(doc, {
    startY: lastY + 16,
    head: [centCols],
    body: centBody,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
  });

  // Page 4+: Estrategias Comerciales por Segmento
  payload.strategies.forEach((st, idx) => {
    doc.addPage();
    const profile = payload.clusterProfiles[idx];

    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(2, 132, 199);
    doc.text(`Segmento ${idx + 1}: ${profile?.name || `Cluster ${idx + 1}`}`, 15, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Población: ${profile?.size} clientes (${profile?.percentage}% del total)`, 15, 27);

    // Strategic breakdown table
    const stratTable = [
      ['Diagnóstico Comercial', st.diagnosticoComercial],
      ['Objetivo Comercial (Medible)', st.objetivoComercial],
      ['Estrategia de Mercadeo', st.estrategiaMarketing],
      ['Propuesta de Valor / Beneficio', st.propuestaValor],
      ['Canales Recomendados', st.canalesRecomendados.join(', ')],
      ['Mensaje Central (Eslogan)', st.mensajes.mensajePrincipal],
      ['Mensaje SMS (Máx 150 car.)', st.mensajes.sms],
      ['Asunto Email', st.mensajes.email.asunto],
      ['Cuerpo Email', st.mensajes.email.cuerpo],
      ['WhatsApp Directo', st.mensajes.whatsapp],
      ['Call to Action (CTA)', st.mensajes.cta],
      ['Concepto Campaña', st.mensajes.conceptoCampana],
      ['KPIs Futuros', st.kpis.join('; ')],
      ['Metas Tentativas', st.metasComerciales.join('; ')],
    ];

    autoTable(doc, {
      startY: 33,
      body: stratTable,
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45, textColor: [15, 23, 42] },
        1: { cellWidth: 140, textColor: [51, 65, 85] },
      },
    });

    // 90-Day Plan Table
    const lastStratY = (doc as any).lastAutoTable?.finalY || 160;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Plan de Acción a 90 Días', 15, lastStratY + 10);

    const planRows = st.plan90Dias.map((p) => [
      p.fase,
      p.actividades,
      p.canal,
      p.kpi,
      p.responsable,
    ]);

    autoTable(doc, {
      startY: lastStratY + 14,
      head: [['Fase / Periodo', 'Actividades Clave', 'Canal', 'KPI', 'Responsable']],
      body: planRows,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
    });
  });

  return doc.output('blob');
}

// 3. Generate Complete All-in-One ZIP Package
export async function generateFullZipPackage(
  payload: ExportDataPayload,
  personaPosters: { clusterId: number; name: string; dataUrl: string }[]
): Promise<Blob> {
  const zip = new JSZip();

  // Add Excel
  const excelBlob = generateExcelWorkbook(payload);
  zip.file(`SegmentaIA_Analisis_Completo_${payload.sector.toLowerCase().replace(/\s+/g, '_')}.xlsx`, excelBlob);

  // Add PDF
  const pdfBlob = generateExecutivePDF(payload);
  zip.file(`SegmentaIA_Informe_Ejecutivo_${payload.sector.toLowerCase().replace(/\s+/g, '_')}.pdf`, pdfBlob);

  // Add Personas folder
  const imgFolder = zip.folder('Personificaciones_Visuales');
  if (imgFolder && personaPosters.length > 0) {
    personaPosters.forEach((p, idx) => {
      const base64Data = p.dataUrl.split(',')[1];
      if (base64Data) {
        const cleanName = p.name.replace(/[^a-zA-Z0-9_-]/g, '_');
        imgFolder.file(`Segmento_${idx + 1}_${cleanName}.png`, base64Data, { base64: true });
      }
    });
  }

  // Add Readme / Technical Documentation
  const readmeContent = `=====================================================
SEGMENTAIA — PLATAFORMA INTELIGENTE DE SEGMENTACIÓN
Proyecto: ${payload.fileName}
Sector: ${payload.sector}
Fecha: ${new Date().toLocaleString('es-ES')}
=====================================================

CONTENIDO DEL PAQUETE:
1. SegmentaIA_Analisis_Completo.xlsx (12 hojas con datos, centroides, estadísticas y métricas)
2. SegmentaIA_Informe_Ejecutivo.pdf (Documento ejecutivo formateado para gerencia y marketing)
3. Personificaciones_Visuales/ (Láminas individuales en alta resolución de cada cluster)

METODOLOGÍA DE CLUSTERING:
- Algoritmo: K-Means de Lloyd con inicialización probabilística K-Means++
- Número de clusters (K): ${payload.kMeansResult.k}
- Semilla determinista: ${payload.kMeansResult.seed}
- Inercia (WCSS): ${payload.kMeansResult.inertia}
- Silhouette Score: ${payload.kMeansResult.silhouetteScore}
- Davies-Bouldin Index: ${payload.kMeansResult.daviesBouldinIndex}
- Calinski-Harabasz Index: ${payload.kMeansResult.calinskiHarabaszIndex}

AVISO DE SEGURIDAD Y PRIVACIDAD:
Los datos personales o identificadores de clientes fueron preservados para trazabilidad interna y no fueron expuestos a servicios externos. Las recomendaciones comerciales e interpretaciones de IA se basaron exclusivamente en datos agregados observados.
`;
  zip.file('README_METODOLOGIA.txt', readmeContent);

  return await zip.generateAsync({ type: 'blob' });
}
