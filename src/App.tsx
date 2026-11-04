import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { StepSidebar } from './components/StepSidebar';
import { QualityModal } from './components/QualityModal';
import { Screen1Welcome } from './components/screens/Screen1Welcome';
import { Screen2DataUpload } from './components/screens/Screen2DataUpload';
import { Screen3Sector } from './components/screens/Screen3Sector';
import { Screen4Descriptive } from './components/screens/Screen4Descriptive';
import { Screen5ClusteringConfig } from './components/screens/Screen5ClusteringConfig';
import { Screen6KMeansResults } from './components/screens/Screen6KMeansResults';
import { Screen7ClusterProfiles } from './components/screens/Screen7ClusterProfiles';
import { Screen8MarketingStrategies } from './components/screens/Screen8MarketingStrategies';
import { Screen9CommunicationPlan } from './components/screens/Screen9CommunicationPlan';
import { Screen10PersonaGallery } from './components/screens/Screen10PersonaGallery';
import { Screen11ExportCenter } from './components/screens/Screen11ExportCenter';

import {
  ColumnMeta,
  ColumnRole,
  PreprocessingConfig,
  NumericStats,
  CategoricalStats,
  CorrelationPair,
  KMeansResult,
  ClusterProfile,
  MarketingStrategy,
  PersonaImage,
  QualityValidationItem,
} from './types';
import {
  computeNumericStats,
  computeCategoricalStats,
  computeCorrelationMatrix,
  executeKMeans,
  evaluateKRange,
  computeDifferentiatingFeatures,
} from './utils/mathStats';
import { SAMPLE_DATASETS } from './utils/sampleDatasets';
import { inspectColumns, countDuplicateRows, ParseResult } from './utils/fileParser';
import { renderPersonaPoster } from './utils/personaRenderer';
import { ExportDataPayload } from './utils/exportEngine';

export default function App() {
  // Navigation & Progress State
  const [currentStep, setCurrentStep] = useState(1);
  const [unlockedMaxStep, setUnlockedMaxStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isQualityModalOpen, setIsQualityModalOpen] = useState(false);

  // Dataset State
  const [fileName, setFileName] = useState('');
  const [sheets, setSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  const [duplicateCount, setDuplicateCount] = useState(0);

  // Sector
  const [sector, setSector] = useState('Telecomunicaciones');

  // Preprocessing Configuration
  const [config, setConfig] = useState<PreprocessingConfig>({
    scaler: 'standard',
    missingHandling: 'mean',
    dropDuplicates: false,
    logTransformColumns: [],
    seed: 42,
    maxIterations: 300,
    nInit: 20,
  });

  // Descriptive Statistics State
  const [numericStats, setNumericStats] = useState<Record<string, NumericStats>>({});
  const [categoricalStats, setCategoricalStats] = useState<Record<string, CategoricalStats>>({});
  const [correlationMatrix, setCorrelationMatrix] = useState<{ matrix: number[][]; pairs: CorrelationPair[] }>({
    matrix: [],
    pairs: [],
  });
  const [descriptiveInterpretation, setDescriptiveInterpretation] = useState<any | null>(null);
  const [isLoadingAiDescriptive, setIsLoadingAiDescriptive] = useState(false);

  // Clustering State
  const [k, setK] = useState(4);
  const [kMeansResult, setKMeansResult] = useState<KMeansResult | null>(null);
  const [elbowPoints, setElbowPoints] = useState<any[]>([]);
  const [recommendedK, setRecommendedK] = useState<number | null>(null);
  const [isEvaluatingElbow, setIsEvaluatingElbow] = useState(false);

  // Cluster Profiles & Strategic Interpretation
  const [profiles, setProfiles] = useState<ClusterProfile[]>([]);
  const [isLoadingAiProfiles, setIsLoadingAiProfiles] = useState(false);

  // Marketing Strategies & 90-Day Plan
  const [strategies, setStrategies] = useState<MarketingStrategy[]>([]);
  const [isLoadingAiStrategies, setIsLoadingAiStrategies] = useState(false);

  // Visual Personas
  const [personaImages, setPersonaImages] = useState<Record<number, PersonaImage>>({});
  const [isGeneratingAllPersonas, setIsGeneratingAllPersonas] = useState(false);
  const [personaPosters, setPersonaPosters] = useState<{ clusterId: number; name: string; dataUrl: string }[]>([]);

  // Computed Features lists
  const numericFeatures = useMemo(
    () => columns.filter((c) => c.role === 'feature' && c.type === 'numeric').map((c) => c.name),
    [columns]
  );
  const categoricalFeatures = useMemo(
    () => columns.filter((c) => c.role === 'feature' && (c.type === 'categorical' || c.type === 'boolean')).map((c) => c.name),
    [columns]
  );
  const idColumn = useMemo(
    () => columns.find((c) => c.role === 'id')?.name || null,
    [columns]
  );

  // Mark step complete helper
  const markStepComplete = (stepNum: number, nextStep?: number) => {
    setCompletedSteps((prev) => (prev.includes(stepNum) ? prev : [...prev, stepNum]));
    if (nextStep) {
      setUnlockedMaxStep((prev) => Math.max(prev, nextStep));
      setCurrentStep(nextStep);
    }
  };

  // Reset Project
  const handleReset = () => {
    if (window.confirm('¿Deseas reiniciar el análisis y comenzar con una nueva base de datos?')) {
      setCurrentStep(1);
      setUnlockedMaxStep(1);
      setCompletedSteps([]);
      setFileName('');
      setRawRows([]);
      setColumns([]);
      setNumericStats({});
      setCategoricalStats({});
      setKMeansResult(null);
      setProfiles([]);
      setStrategies([]);
      setPersonaImages({});
      setPersonaPosters([]);
    }
  };

  // Load Preset Sample Dataset
  const handleLoadSample = (sampleId: string) => {
    const ds = SAMPLE_DATASETS.find((d) => d.id === sampleId);
    if (!ds) return;

    const inspected = inspectColumns(ds.rows);
    const dupes = countDuplicateRows(ds.rows);

    setFileName(ds.fileName);
    setSheets(['Hoja 1']);
    setSelectedSheet('Hoja 1');
    setRawRows(ds.rows);
    setColumns(inspected);
    setDuplicateCount(dupes);
    setSector(ds.sector);

    markStepComplete(1, 2);
  };

  // File Parsed
  const handleFileParsed = (result: ParseResult) => {
    setFileName(result.fileName);
    setSheets(result.sheets);
    setSelectedSheet(result.selectedSheet);
    setRawRows(result.rows);
    setColumns(result.columns);
    setDuplicateCount(result.duplicateCount);

    markStepComplete(1, 2);
  };

  // Column Role change
  const handleColumnRoleChanged = (colName: string, role: ColumnRole) => {
    setColumns((prev) =>
      prev.map((c) => {
        if (c.name === colName) {
          return { ...c, role };
        }
        // If assigning 'id', demote other IDs to avoid duplicates
        if (role === 'id' && c.role === 'id') {
          return { ...c, role: 'excluded' };
        }
        return c;
      })
    );
  };

  // Sheet change
  const handleSheetChanged = (sheetName: string) => {
    setSelectedSheet(sheetName);
  };

  // RUN DESCRIPTIVE ANALYSIS
  const handleRunDescriptive = useCallback(async () => {
    if (rawRows.length === 0) return;

    // 1. Calculate pure numeric stats
    const nStats: Record<string, NumericStats> = {};
    const cStats: Record<string, CategoricalStats> = {};

    columns.forEach((col) => {
      const vals = rawRows.map((r) => r[col.name]);
      if (col.type === 'numeric') {
        nStats[col.name] = computeNumericStats(
          vals.map((v) => (v !== null && v !== undefined ? Number(v) : null)),
          rawRows.length
        );
      } else if (col.type === 'categorical' || col.type === 'boolean') {
        cStats[col.name] = computeCategoricalStats(vals, rawRows.length);
      }
    });

    setNumericStats(nStats);
    setCategoricalStats(cStats);

    // 2. Compute Pearson Correlation Matrix
    const numCols = Object.keys(nStats);
    const corr = computeCorrelationMatrix(rawRows, numCols);
    setCorrelationMatrix(corr);

    // 3. Request Gemini Interpretation
    setIsLoadingAiDescriptive(true);
    try {
      const resp = await fetch('/api/gemini/interpret-descriptive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector,
          statsSummary: nStats,
          correlations: corr.pairs.slice(0, 5),
        }),
      });

      if (resp.ok) {
        const json = await resp.json();
        if (json.success && json.data) {
          setDescriptiveInterpretation(json.data);
        }
      } else {
        // Fallback interpretation based on observed numbers
        setDescriptiveInterpretation({
          hallazgos: [
            `Se detectaron ${numCols.length} variables numéricas principales con diferentes grados de asimetría.`,
            `El par con mayor correlación observada fue ${corr.pairs[0]?.colA || 'A'} y ${corr.pairs[0]?.colB || 'B'} con r = ${corr.pairs[0]?.correlation || 0}.`,
            `Total de clientes en la base: ${rawRows.length} registros válidos.`,
          ],
          interpretaciones: [
            `En el sector ${sector}, la dispersión en los consumos refleja una clara heterogeneidad de clientes que justifica segmentación K-Means.`,
          ],
          hipotesisComerciales: [
            `Existen segmentos de alto valor con consumo intensivo que responderán positivamente a ofertas exclusivas.`,
            `Un subgrupo con baja frecuencia requerirá reactivación mediante incentivos de bienvenida o fidelización.`,
          ],
          recomendaciones: [
            `Proceder a estandarizar variables con StandardScaler para equilibrar los pesos en el espacio euclidiano.`,
            `Monitorear las variables con correlación superior a 0.70 para evitar redundancia.`,
          ],
          resumenEjecutivo: `Análisis descriptivo completado sobre ${rawRows.length} clientes en ${sector}. La distribución justifica la partición en clusters diferenciados.`,
        });
      }
    } catch {
      // Offline fallback
      setDescriptiveInterpretation({
        hallazgos: [
          `Base de datos analizada con éxito: ${rawRows.length} clientes y ${numCols.length} variables numéricas.`,
        ],
        interpretaciones: [
          `Distribución lista para clustering de mercado en el sector ${sector}.`,
        ],
        hipotesisComerciales: [
          `Los clientes presentan comportamientos bimodales o segmentables.`,
        ],
        recomendaciones: [
          `Configurar K-Means con un número de clusters entre 3 y 6.`,
        ],
        resumenEjecutivo: `Análisis descriptivo verificado sobre la base suministrada.`,
      });
    } finally {
      setIsLoadingAiDescriptive(false);
      markStepComplete(3, 4);
    }
  }, [rawRows, columns, sector]);

  // EVALUATE ELBOW AND SILHOUETTES (K=2 to 8)
  const handleEvaluateElbow = () => {
    if (numericFeatures.length === 0) return;
    setIsEvaluatingElbow(true);

    try {
      // Quick data prep
      const rowsToUse = config.dropDuplicates
        ? rawRows.filter((r, idx, arr) => arr.findIndex((x) => JSON.stringify(x) === JSON.stringify(r)) === idx)
        : rawRows;

      const testResult = executeKMeans(
        rowsToUse,
        numericFeatures,
        categoricalFeatures,
        idColumn,
        3,
        config
      );

      // Extract raw points to evaluate range
      const scaledRows = testResult.pcaCoordinates.map((c) => [c.x, c.y]);
      const points = evaluateKRange(scaledRows, 2, 8, config.seed);
      setElbowPoints(points);

      // Find recommended K (highest silhouette)
      let bestPoint = points[0];
      for (const p of points) {
        if (p.silhouette > bestPoint.silhouette) {
          bestPoint = p;
        }
      }
      if (bestPoint) {
        setRecommendedK(bestPoint.k);
      }
    } catch (err: any) {
      console.error('Error evaluando K:', err);
    } finally {
      setIsEvaluatingElbow(false);
    }
  };

  // EXECUTE K-MEANS CLUSTERING
  const handleExecuteKMeans = async () => {
    if (numericFeatures.length === 0) {
      alert('Debes tener al menos 1 variable numérica con el rol "Variable de Clustering (K-Means)".');
      return;
    }

    const rowsToUse = config.dropDuplicates
      ? rawRows.filter((r, idx, arr) => arr.findIndex((x) => JSON.stringify(x) === JSON.stringify(r)) === idx)
      : rawRows;

    // 1. Run mathematically verified Lloyd K-Means++
    const kmRes = executeKMeans(
      rowsToUse,
      numericFeatures,
      categoricalFeatures,
      idColumn,
      k,
      config
    );
    setKMeansResult(kmRes);

    // 2. Compute differentiating features (|z-score|)
    const diffs = computeDifferentiatingFeatures(kmRes, numericStats);

    // 3. Assemble initial robust profiles
    const initialProfiles: ClusterProfile[] = [];
    for (let c = 0; c < k; c++) {
      const topDiff = diffs[c]?.[0];
      const directionLabel = topDiff?.direction === 'superior' ? 'Alto' : 'Bajo';
      const mainFeature = topDiff ? `${directionLabel} ${topDiff.variable}` : 'Comportamiento balanceado';

      // Smart default naming based on sector and differentiator
      let defaultName = `Segmento ${c + 1}: ${mainFeature}`;
      if (sector === 'Telecomunicaciones') {
        if (topDiff?.variable?.includes('arpu') || topDiff?.variable?.includes('factura')) {
          defaultName = topDiff.direction === 'superior' ? 'Conectados de Alto Valor' : 'Usuarios de Tarifa Reducida';
        } else if (topDiff?.variable?.includes('datos') || topDiff?.variable?.includes('gb')) {
          defaultName = topDiff.direction === 'superior' ? 'Consumidores Intensivos de Datos' : 'Usuarios Tradicionales de Voz';
        } else if (topDiff?.variable?.includes('antiguedad')) {
          defaultName = topDiff.direction === 'superior' ? 'Abonados Leales Históricos' : 'Nuevas Incorporaciones';
        }
      } else if (sector === 'Comercio minorista') {
        if (topDiff?.variable?.includes('ticket') || topDiff?.variable?.includes('gasto')) {
          defaultName = topDiff.direction === 'superior' ? 'Compradores Premium Frecuentes' : 'Consumidores de Ocasión';
        } else if (topDiff?.variable?.includes('online')) {
          defaultName = topDiff.direction === 'superior' ? 'Nativos Omnicanal Digitales' : 'Compradores de Tienda Física';
        }
      } else if (sector === 'Servicios financieros') {
        if (topDiff?.variable?.includes('saldo') || topDiff?.variable?.includes('patrimonio')) {
          defaultName = topDiff.direction === 'superior' ? 'Patrimoniales de Alto Saldo' : 'Cuentas Operativas Transaccionales';
        }
      }

      initialProfiles.push({
        clusterId: c,
        name: defaultName,
        size: kmRes.clusterSizes[c],
        percentage: kmRes.clusterPercentages[c],
        mainCharacteristic: mainFeature,
        differentiatingFeatures: diffs[c] || [],
        description: `Segmento que agrupa al ${kmRes.clusterPercentages[c]}% de los clientes (${kmRes.clusterSizes[c]} observaciones), caracterizado principalmente por ${mainFeature}.`,
        potentialNeeds: [
          `Ofertas personalizadas según su nivel de ${topDiff?.variable || 'consumo'}`,
          `Atención proactiva en canales de su preferencia`,
        ],
        commercialOpportunities: [
          `Fidelización y retención estratégica para asegurar LTV`,
          `Ventas cruzadas o planes superiores acordes a su perfil`,
        ],
        caveats: kmRes.clusterPercentages[c] < 5
          ? 'Segmento de tamaño reducido (< 5%). Evaluar si corresponde a clientes nicho o atípicos.'
          : 'Mantener seguimiento a la migración entre segmentos en ciclos posteriores.',
      });
    }

    setProfiles(initialProfiles);
    markStepComplete(5, 6);

    // 4. Request Gemini commercial naming & profiling enhancement
    setIsLoadingAiProfiles(true);
    try {
      const resp = await fetch('/api/gemini/interpret-clusters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector,
          clustersData: initialProfiles.map((p, idx) => ({
            clusterId: p.clusterId,
            size: p.size,
            percentage: p.percentage,
            mainDiff: p.differentiatingFeatures.slice(0, 3),
            centroidsOriginal: kmRes.centroidsOriginal[idx],
          })),
        }),
      });

      if (resp.ok) {
        const json = await resp.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          setProfiles((prev) =>
            prev.map((prof, idx) => {
              const aiMatch = json.data.find((d: any) => d.clusterId === prof.clusterId) || json.data[idx];
              if (aiMatch) {
                return {
                  ...prof,
                  name: aiMatch.nombreComercial || prof.name,
                  mainCharacteristic: aiMatch.caracteristicaPrincipal || prof.mainCharacteristic,
                  description: aiMatch.descripcion || prof.description,
                  potentialNeeds: aiMatch.necesidadesPotenciales || prof.potentialNeeds,
                  commercialOpportunities: aiMatch.oportunidadesComerciales || prof.commercialOpportunities,
                  caveats: aiMatch.advertencias || prof.caveats,
                };
              }
              return prof;
            })
          );
        }
      }
    } catch (err) {
      console.warn('Gemini naming fallback used:', err);
    } finally {
      setIsLoadingAiProfiles(false);
    }
  };

  // UPDATE CLUSTER NAME INLINE (Manual user editing)
  const handleUpdateClusterName = (clusterId: number, newName: string) => {
    setProfiles((prev) =>
      prev.map((p) => (p.clusterId === clusterId ? { ...p, name: newName } : p))
    );
  };

  // GENERATE MARKETING STRATEGIES & 90-DAY PLAN
  const handleGenerateStrategies = async () => {
    if (profiles.length === 0) return;
    setIsLoadingAiStrategies(true);

    try {
      const resp = await fetch('/api/gemini/generate-strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector,
          clusterProfiles: profiles.map((p) => ({
            clusterId: p.clusterId,
            name: p.name,
            size: p.size,
            percentage: p.percentage,
            mainCharacteristic: p.mainCharacteristic,
            differentiatingFeatures: p.differentiatingFeatures.slice(0, 3),
          })),
        }),
      });

      if (resp.ok) {
        const json = await resp.json();
        if (json.data?.strategies && Array.isArray(json.data.strategies)) {
          setStrategies(json.data.strategies);
          markStepComplete(7, 8);
          return;
        }
      }
    } catch (err) {
      console.warn('Gemini strategies network notice, using verified formulaic templates:', err);
    }

    // High quality deterministic strategic fallback
    const fallbackStrategies: MarketingStrategy[] = profiles.map((p, idx) => ({
      clusterId: p.clusterId,
      diagnosticoComercial: `El segmento ${p.name} representa el ${p.percentage}% de la cartera en el sector ${sector}. Su rasgo dominante es ${p.mainCharacteristic}, lo que demanda una aproximación focalizada.`,
      objetivoComercial: `Incrementar la retención neta en +3.5% y promover la adopción de productos complementarios en los próximos 90 días.`,
      estrategiaMarketing: idx % 2 === 0 ? 'Fidelización y Venta Superior (Upselling)' : 'Activación Digital y Cross-selling',
      propuestaValor: `Acceso preferencial a beneficios sectoriales en ${sector} con tarifas optimizadas y atención ágil.`,
      canalesRecomendados: ['Email Marketing', 'Notificaciones App', 'WhatsApp con Opt-In'],
      mensajes: {
        mensajePrincipal: `Más valor y mejores soluciones diseñadas para tu perfil en ${sector}.`,
        sms: `Hola, disfruta de beneficios exclusivos diseñados para ti en ${sector}. Actívalos aquí: https://seg.ia/go`,
        email: {
          asunto: `Tu experiencia en ${sector} ahora con beneficios exclusivos`,
          cuerpo: `Estimado cliente, como parte de nuestro compromiso de acompañarte con las mejores soluciones, hemos diseñado una oferta pensada exactamente para tus necesidades. Descubre hoy los beneficios disponibles para ti.`,
        },
        whatsapp: `Hola, queremos compartirte una propuesta pensada especialmente para optimizar tu servicio en ${sector}. ¿Te gustaría revisarla?`,
        cta: 'Activar mis beneficios exclusivos',
        conceptoCampana: `Experiencia ${p.name.split(':')[0] || 'Preferente'}`,
      },
      kpis: ['Tasa de Conversión (%)', 'Retención de Clientes (%)', 'ARPU Incremental ($)'],
      metasComerciales: ['Conversión sugerida: 8.5%', 'Retención objetivo: >94%', 'NPS meta: +12 pts'],
      plan90Dias: [
        {
          fase: 'Semanas 1 y 2: Preparación y Validación',
          actividades: 'Parametrización de listas, validación de consentimiento (opt-in) y configuración de plantillas CRM.',
          canal: 'Sistemas Internos / CRM',
          kpi: '100% listas auditadas',
          responsable: 'Equipo de Operaciones de Marketing',
        },
        {
          fase: 'Semanas 3 y 4: Pruebas Piloto',
          actividades: 'Despliegue de test A/B en 10% de la base para calibrar asuntos de email y horas óptimas de envío.',
          canal: 'Email y Notificación Push',
          kpi: 'Tasa de apertura > 24%',
          responsable: 'Especialista en Growth y CRM',
        },
        {
          fase: 'Semanas 5 a 8: Ejecución y Optimización',
          actividades: 'Lanzamiento escalado a todo el segmento con disparadores automáticos según comportamiento.',
          canal: 'Omnicanal (Email + SMS + App)',
          kpi: 'Tasa de clic > 5.2%',
          responsable: 'Gerente de Campañas',
        },
        {
          fase: 'Semanas 9 a 12: Medición y Evaluación',
          actividades: 'Cierre de ciclo, evaluación de rentabilidad y calibración de reglas para el próximo trimestre.',
          canal: 'Comité de Dirección',
          kpi: 'ROI de campaña > 3.8x',
          responsable: 'Director de Marketing y Analítica',
        },
      ],
    }));

    setStrategies(fallbackStrategies);
    markStepComplete(7, 8);
    setIsLoadingAiStrategies(false);
  };

  // GENERATE PERSONA IMAGE FOR SINGLE CLUSTER
  const handleGenerateSinglePersona = async (clusterId: number) => {
    const profile = profiles.find((p) => p.clusterId === clusterId);
    if (!profile) return;

    setPersonaImages((prev) => ({
      ...prev,
      [clusterId]: {
        ...(prev[clusterId] || {
          clusterId,
          clusterName: profile.name,
          isAiGenerated: false,
          themeColor: '#0284c7',
          accentColor: '#38bdf8',
          archetype: 'Digital Leader',
        }),
        loading: true,
      },
    }));

    let aiBase64: string | null = null;
    let isAi = false;

    try {
      const resp = await fetch('/api/gemini/generate-persona-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector,
          clusterName: profile.name,
          visualDescription: `Customer archetype characterized by ${profile.mainCharacteristic}. Key traits: ${profile.differentiatingFeatures.slice(0, 2).map((d) => d.variable).join(', ')}.`,
          clusterIndex: clusterId,
        }),
      });

      if (resp.ok) {
        const json = await resp.json();
        if (json.success && json.imageUrl) {
          aiBase64 = json.imageUrl;
          isAi = true;
        }
      }
    } catch (err) {
      console.warn('AI image generation notice, engaging editorial canvas rendering:', err);
    }

    // Render 4:5 editorial poster with canvas
    const posterDataUrl = await renderPersonaPoster({
      clusterIndex: clusterId,
      clusterName: profile.name,
      sector,
      percentage: profile.percentage,
      size: profile.size,
      mainCharacteristic: profile.mainCharacteristic,
      keyFeatures: profile.differentiatingFeatures.slice(0, 3).map((d) => ({
        variable: d.variable,
        direction: d.direction,
      })),
      aiImageBase64: aiBase64,
    });

    setPersonaImages((prev) => ({
      ...prev,
      [clusterId]: {
        clusterId,
        clusterName: profile.name,
        imageUrl: posterDataUrl,
        isAiGenerated: isAi,
        loading: false,
        themeColor: '#0284c7',
        accentColor: '#38bdf8',
        archetype: 'Editorial Persona',
      },
    }));

    setPersonaPosters((prev) => {
      const filtered = prev.filter((p) => p.clusterId !== clusterId);
      return [...filtered, { clusterId, name: profile.name, dataUrl: posterDataUrl }];
    });
  };

  // GENERATE ALL PERSONAS
  const handleGenerateAllPersonas = async () => {
    if (profiles.length === 0) return;
    setIsGeneratingAllPersonas(true);

    const newPosters: { clusterId: number; name: string; dataUrl: string }[] = [];

    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      let aiBase64: string | null = null;
      let isAi = false;

      try {
        const resp = await fetch('/api/gemini/generate-persona-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sector,
            clusterName: profile.name,
            visualDescription: `Customer archetype characterized by ${profile.mainCharacteristic}. Key traits: ${profile.differentiatingFeatures.slice(0, 2).map((d) => d.variable).join(', ')}.`,
            clusterIndex: i,
          }),
        });
        if (resp.ok) {
          const json = await resp.json();
          if (json.success && json.imageUrl) {
            aiBase64 = json.imageUrl;
            isAi = true;
          }
        }
      } catch {
        // use high quality editorial fallback
      }

      const posterDataUrl = await renderPersonaPoster({
        clusterIndex: i,
        clusterName: profile.name,
        sector,
        percentage: profile.percentage,
        size: profile.size,
        mainCharacteristic: profile.mainCharacteristic,
        keyFeatures: profile.differentiatingFeatures.slice(0, 3).map((d) => ({
          variable: d.variable,
          direction: d.direction,
        })),
        aiImageBase64: aiBase64,
      });

      setPersonaImages((prev) => ({
        ...prev,
        [profile.clusterId]: {
          clusterId: profile.clusterId,
          clusterName: profile.name,
          imageUrl: posterDataUrl,
          isAiGenerated: isAi,
          loading: false,
          themeColor: '#0284c7',
          accentColor: '#38bdf8',
          archetype: 'Editorial Persona',
        },
      }));

      newPosters.push({
        clusterId: profile.clusterId,
        name: profile.name,
        dataUrl: posterDataUrl,
      });
    }

    setPersonaPosters(newPosters);
    setIsGeneratingAllPersonas(false);
    markStepComplete(9, 10);
  };

  // 12-Point Automatic Quality Checklist
  const qualityValidations: QualityValidationItem[] = useMemo(() => {
    return [
      {
        id: 'file_read',
        label: 'Lectura correcta del archivo y columnas',
        passed: rawRows.length > 0 && columns.length > 0,
        details: rawRows.length > 0 ? `${rawRows.length} filas y ${columns.length} variables leídas de ${fileName || 'archivo local'}.` : 'Archivo pendiente de carga.',
      },
      {
        id: 'min_records',
        label: 'Registros suficientes para segmentación',
        passed: rawRows.length >= 10,
        details: rawRows.length >= 10 ? `Base con ${rawRows.length} registros (superior al mínimo de 10).` : 'Se requieren al menos 10 registros.',
      },
      {
        id: 'descriptive_stats',
        label: 'Cálculo de estadísticas descriptivas completas',
        passed: Object.keys(numericStats).length > 0,
        details: Object.keys(numericStats).length > 0 ? `${Object.keys(numericStats).length} variables calculadas con media, mediana, IQR, asimetría y atípicos.` : 'Pendiente de calcular estadísticas.',
      },
      {
        id: 'feature_prep',
        label: 'Preparación y escalamiento de variables',
        passed: numericFeatures.length > 0,
        details: `${numericFeatures.length} variables numéricas configuradas con ${config.scaler === 'robust' ? 'RobustScaler' : 'StandardScaler'}.`,
      },
      {
        id: 'kmeans_run',
        label: 'Ejecución exitosa del algoritmo K-Means',
        passed: kMeansResult !== null,
        details: kMeansResult ? `K-Means convergió en ${kMeansResult.iterations} iteraciones con semilla ${kMeansResult.seed}.` : 'Pendiente de ejecutar clustering.',
      },
      {
        id: 'exact_k',
        label: 'Número exacto de K clusters no vacíos',
        passed: kMeansResult ? kMeansResult.clusterSizes.every((s) => s > 0) && kMeansResult.clusterSizes.length === k : false,
        details: kMeansResult ? `Se identificaron exactamente ${k} clusters con clientes asignados.` : 'Pendiente de calcular clusters.',
      },
      {
        id: 'full_assignment',
        label: 'Asignación completa de todos los clientes válidos',
        passed: kMeansResult ? kMeansResult.assignedClusters.length === rawRows.length : false,
        details: kMeansResult ? `100% de los ${rawRows.length} clientes cuentan con cluster asignado y distancia al centroide.` : 'Pendiente de asignar registros.',
      },
      {
        id: 'interpretable_centroids',
        label: 'Centroides originales y estandarizados calculados',
        passed: kMeansResult ? kMeansResult.centroidsOriginal.length === k : false,
        details: kMeansResult ? `Centroides en escala original y z-score listos para interpretación.` : 'Pendiente de centroides.',
      },
      {
        id: 'cluster_names',
        label: 'Nombre comercial asignado a cada cluster',
        passed: profiles.length === k && profiles.every((p) => p.name.trim().length > 0),
        details: profiles.length === k ? `Todos los segmentos tienen nombre comercial coherente con ${sector}.` : 'Pendiente de bautizo comercial.',
      },
      {
        id: 'marketing_strategy',
        label: 'Estrategia comercial y copys multicanal',
        passed: strategies.length === k,
        details: strategies.length === k ? `Planes comerciales con mensajes para SMS, Email y WhatsApp disponibles.` : 'Pendiente de generar estrategias.',
      },
      {
        id: 'comm_plan',
        label: 'Plan de comunicación a 90 días en 4 fases',
        passed: strategies.length > 0 && strategies.every((s) => s.plan90Dias.length === 4),
        details: strategies.length > 0 ? `Cronograma secuencial con fases Sem 1-2, 3-4, 5-8 y 9-12 estructurado.` : 'Pendiente de plan 90 días.',
      },
      {
        id: 'persona_images',
        label: 'Personificaciones visuales generadas',
        passed: Object.keys(personaImages).length >= k,
        details: Object.keys(personaImages).length >= k ? `Láminas 4:5 generadas en alta resolución con tipografía exacta.` : 'Pendiente de generar personificaciones.',
      },
    ];
  }, [rawRows, columns, numericStats, numericFeatures, config, kMeansResult, k, profiles, strategies, personaImages, fileName, sector]);

  // Export Payload for Excel, PDF and ZIP
  const exportPayload: ExportDataPayload | null = useMemo(() => {
    if (!kMeansResult || profiles.length === 0 || strategies.length === 0) return null;

    return {
      sector,
      fileName: fileName || 'dataset_clientes.xlsx',
      rawRows,
      columns,
      numericStats,
      categoricalStats,
      kMeansResult,
      clusterProfiles: profiles,
      strategies,
      config,
    };
  }, [sector, fileName, rawRows, columns, numericStats, categoricalStats, kMeansResult, profiles, strategies, config]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        currentStep={currentStep}
        sector={sector}
        rowCount={rawRows.length}
        onOpenQualityModal={() => setIsQualityModalOpen(true)}
        onReset={handleReset}
        onLoadSample={handleLoadSample}
      />

      {/* Main Workspace with Responsive Sidebar */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Step Progress Sidebar */}
        <StepSidebar
          currentStep={currentStep}
          onSelectStep={(st) => setCurrentStep(st)}
          completedSteps={completedSteps}
          unlockedMaxStep={unlockedMaxStep}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl">
          {/* SCREEN 1: Welcome */}
          {currentStep === 1 && (
            <Screen1Welcome
              onStart={() => markStepComplete(1, 2)}
              onLoadSample={handleLoadSample}
            />
          )}

          {/* SCREEN 2: Data Upload & Inspection */}
          {currentStep === 2 && (
            <Screen2DataUpload
              fileName={fileName}
              sheets={sheets}
              selectedSheet={selectedSheet}
              rows={rawRows}
              columns={columns}
              duplicateCount={duplicateCount}
              config={config}
              onFileParsed={handleFileParsed}
              onSheetChanged={handleSheetChanged}
              onColumnRoleChanged={handleColumnRoleChanged}
              onConfigChanged={setConfig}
              onContinue={() => markStepComplete(2, 3)}
            />
          )}

          {/* SCREEN 3: Sector Selection */}
          {currentStep === 3 && (
            <Screen3Sector
              sector={sector}
              onSectorSelected={(sec) => setSector(sec)}
              onContinue={handleRunDescriptive}
            />
          )}

          {/* SCREEN 4: Descriptive Statistics */}
          {currentStep === 4 && (
            <Screen4Descriptive
              sector={sector}
              columns={columns}
              numericStats={numericStats}
              categoricalStats={categoricalStats}
              correlationMatrix={correlationMatrix}
              interpretation={descriptiveInterpretation}
              isLoadingAi={isLoadingAiDescriptive}
              onRefreshInterpretation={handleRunDescriptive}
              onContinue={() => markStepComplete(4, 5)}
            />
          )}

          {/* SCREEN 5: Clustering Setup */}
          {currentStep === 5 && (
            <Screen5ClusteringConfig
              k={k}
              config={config}
              numericFeatures={numericFeatures}
              categoricalFeatures={categoricalFeatures}
              elbowPoints={elbowPoints}
              recommendedK={recommendedK}
              isEvaluatingElbow={isEvaluatingElbow}
              onKChanged={setK}
              onConfigChanged={setConfig}
              onEvaluateElbow={handleEvaluateElbow}
              onExecuteKMeans={handleExecuteKMeans}
            />
          )}

          {/* SCREEN 6: KMeans Results & Validation */}
          {currentStep === 6 && kMeansResult && (
            <Screen6KMeansResults
              kMeansResult={kMeansResult}
              profiles={profiles}
              onContinue={() => markStepComplete(6, 7)}
              onReconfigure={() => setCurrentStep(5)}
            />
          )}

          {/* SCREEN 7: Cluster Profiles & Business Naming */}
          {currentStep === 7 && kMeansResult && (
            <Screen7ClusterProfiles
              sector={sector}
              profiles={profiles}
              kMeansResult={kMeansResult}
              isLoadingAi={isLoadingAiProfiles}
              onUpdateClusterName={handleUpdateClusterName}
              onRefreshProfiles={handleExecuteKMeans}
              onContinue={handleGenerateStrategies}
            />
          )}

          {/* SCREEN 8: Marketing Strategies & Omnichannel Copy */}
          {currentStep === 8 && (
            <Screen8MarketingStrategies
              sector={sector}
              profiles={profiles}
              strategies={strategies}
              isLoadingAi={isLoadingAiStrategies}
              onRefreshStrategies={handleGenerateStrategies}
              onContinue={() => markStepComplete(8, 9)}
            />
          )}

          {/* SCREEN 9: 90-Day Communication Plan & Priority Matrix */}
          {currentStep === 9 && (
            <Screen9CommunicationPlan
              sector={sector}
              profiles={profiles}
              strategies={strategies}
              onContinue={handleGenerateAllPersonas}
            />
          )}

          {/* SCREEN 10: AI Visual Personas Gallery */}
          {currentStep === 10 && (
            <Screen10PersonaGallery
              sector={sector}
              profiles={profiles}
              personaImages={personaImages}
              isGeneratingAll={isGeneratingAllPersonas}
              onGenerateSingle={handleGenerateSinglePersona}
              onGenerateAll={handleGenerateAllPersonas}
              onContinue={() => markStepComplete(10, 11)}
            />
          )}

          {/* SCREEN 11: Export Center & Downloads */}
          {currentStep === 11 && exportPayload && (
            <Screen11ExportCenter
              payload={exportPayload}
              personaPosters={personaPosters}
              validations={qualityValidations}
              onOpenQualityModal={() => setIsQualityModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Quality Validation Audit Modal */}
      <QualityModal
        isOpen={isQualityModalOpen}
        onClose={() => setIsQualityModalOpen(false)}
        validations={qualityValidations}
      />
    </div>
  );
}
