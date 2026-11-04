export type ColumnType = 'numeric' | 'categorical' | 'boolean' | 'date' | 'id' | 'text';
export type ColumnRole = 'feature' | 'id' | 'interpret_only' | 'excluded';

export interface ColumnMeta {
  name: string;
  type: ColumnType;
  role: ColumnRole;
  uniqueCount: number;
  missingCount: number;
  missingPercentage: number;
  sampleValues: (string | number | boolean | null)[];
  isConstant: boolean;
  isHighCardinality: boolean;
  originalIndex: number;
}

export interface NumericStats {
  validCount: number;
  mean: number;
  median: number;
  mode: number | null;
  stdDev: number;
  variance: number;
  min: number;
  max: number;
  q1: number;
  q2: number;
  q3: number;
  iqr: number;
  cv: number; // Coefficient of variation (%)
  missingPercentage: number;
  skewness: number;
  outliersCount: number;
  outliersRange: [number, number];
}

export interface CategoricalStats {
  validCount: number;
  categoryCount: number;
  predominantCategory: string;
  missingCount: number;
  missingPercentage: number;
  absoluteFreqs: { category: string; count: number }[];
  relativeFreqs: { category: string; percentage: number }[];
}

export interface CorrelationPair {
  colA: string;
  colB: string;
  correlation: number;
}

export interface PreprocessingConfig {
  scaler: 'standard' | 'robust' | 'none';
  missingHandling: 'mean' | 'median' | 'mode' | 'drop';
  dropDuplicates: boolean;
  logTransformColumns: string[];
  seed: number;
  maxIterations: number;
  nInit: number;
}

export interface ElbowPoint {
  k: number;
  inertia: number;
  silhouette: number;
  daviesBouldin: number;
  calinskiHarabasz: number;
}

export interface KMeansResult {
  k: number;
  seed: number;
  converged: boolean;
  iterations: number;
  inertia: number;
  silhouetteScore: number;
  daviesBouldinIndex: number;
  calinskiHarabaszIndex: number;
  clusterSizes: number[];
  clusterPercentages: number[];
  centroidsOriginal: Record<string, number>[];
  centroidsStandardized: Record<string, number>[];
  assignedClusters: number[];
  clusterDistances: number[];
  smallClusterWarnings: string[];
  pcaCoordinates: { x: number; y: number; cluster: number; id: string | number }[];
  pcaVariance: [number, number];
  featureNames: string[];
  originalNumericFeatures: string[];
  categoricalFeatures: string[];
  encodedFeatureNames: string[];
}

export interface DifferentiatingFeature {
  variable: string;
  zScore: number;
  clusterMean: number;
  globalMean: number;
  direction: 'superior' | 'inferior';
  percentageDifference: number;
}

export interface ClusterProfile {
  clusterId: number;
  name: string;
  size: number;
  percentage: number;
  mainCharacteristic: string;
  differentiatingFeatures: DifferentiatingFeature[];
  description: string;
  potentialNeeds: string[];
  commercialOpportunities: string[];
  caveats: string;
}

export interface MarketingStrategy {
  clusterId: number;
  diagnosticoComercial: string;
  objetivoComercial: string;
  estrategiaMarketing: string;
  propuestaValor: string;
  canalesRecomendados: string[];
  mensajes: {
    mensajePrincipal: string;
    sms: string;
    email: {
      asunto: string;
      cuerpo: string;
    };
    whatsapp: string;
    cta: string;
    conceptoCampana: string;
  };
  kpis: string[];
  metasComerciales: string[];
  plan90Dias: {
    fase: string;
    actividades: string;
    canal: string;
    kpi: string;
    responsable: string;
  }[];
}

export interface PersonaImage {
  clusterId: number;
  clusterName: string;
  imageUrl?: string;
  isAiGenerated: boolean;
  loading: boolean;
  error?: string;
  archetype: string;
  themeColor: string;
  accentColor: string;
}

export interface QualityValidationItem {
  id: string;
  label: string;
  passed: boolean;
  details: string;
}
