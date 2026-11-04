import {
  NumericStats,
  CategoricalStats,
  CorrelationPair,
  ElbowPoint,
  KMeansResult,
  DifferentiatingFeature,
  PreprocessingConfig,
} from '../types';

// Seedable PRNG (Mulberry32) for deterministic, reproducible K-means runs
export function createPRNG(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Compute comprehensive descriptive statistics for numeric arrays
export function computeNumericStats(
  values: (number | null | undefined)[],
  totalPopulation: number
): NumericStats {
  const clean = values.filter(
    (v): v is number => typeof v === 'number' && !isNaN(v) && isFinite(v)
  );

  const validCount = clean.length;
  const missingCount = totalPopulation - validCount;
  const missingPercentage = totalPopulation > 0 ? (missingCount / totalPopulation) * 100 : 0;

  if (validCount === 0) {
    return {
      validCount: 0,
      mean: 0,
      median: 0,
      mode: null,
      stdDev: 0,
      variance: 0,
      min: 0,
      max: 0,
      q1: 0,
      q2: 0,
      q3: 0,
      iqr: 0,
      cv: 0,
      missingPercentage,
      skewness: 0,
      outliersCount: 0,
      outliersRange: [0, 0],
    };
  }

  // Sort for quartiles and median
  const sorted = [...clean].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = sum / validCount;

  // Variance & Standard Deviation (Sample, n-1)
  const sumSquares = sorted.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
  const variance = validCount > 1 ? sumSquares / (validCount - 1) : 0;
  const stdDev = Math.sqrt(variance);

  // Percentile helper
  const getPercentile = (p: number): number => {
    if (sorted.length === 1) return sorted[0];
    const index = p * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const q1 = getPercentile(0.25);
  const median = getPercentile(0.5);
  const q3 = getPercentile(0.75);
  const iqr = q3 - q1;

  // Mode calculation
  const freqMap: Record<number, number> = {};
  let maxFreq = 0;
  let modeVal: number | null = null;
  for (const val of sorted) {
    // Round to 3 decimals to cluster continuous floats reasonably
    const rounded = Math.round(val * 1000) / 1000;
    freqMap[rounded] = (freqMap[rounded] || 0) + 1;
    if (freqMap[rounded] > maxFreq) {
      maxFreq = freqMap[rounded];
      modeVal = rounded;
    }
  }
  const mode = maxFreq > 1 ? modeVal : null;

  // Coefficient of Variation
  const cv = Math.abs(mean) > 1e-9 ? (stdDev / Math.abs(mean)) * 100 : 0;

  // Skewness (Fisher-Pearson standardized third moment)
  let skewness = 0;
  if (validCount >= 3 && stdDev > 1e-9) {
    const sumCubed = sorted.reduce((acc, v) => acc + Math.pow((v - mean) / stdDev, 3), 0);
    skewness = (validCount / ((validCount - 1) * (validCount - 2))) * sumCubed;
  }

  // Outliers by Tukey's IQR rule [Q1 - 1.5*IQR, Q3 + 1.5*IQR]
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const outliersCount = sorted.filter((v) => v < lowerFence || v > upperFence).length;

  return {
    validCount,
    mean: Number(mean.toFixed(3)),
    median: Number(median.toFixed(3)),
    mode: mode !== null ? Number(mode.toFixed(3)) : null,
    stdDev: Number(stdDev.toFixed(3)),
    variance: Number(variance.toFixed(3)),
    min: Number(min.toFixed(3)),
    max: Number(max.toFixed(3)),
    q1: Number(q1.toFixed(3)),
    q2: Number(median.toFixed(3)),
    q3: Number(q3.toFixed(3)),
    iqr: Number(iqr.toFixed(3)),
    cv: Number(cv.toFixed(2)),
    missingPercentage: Number(missingPercentage.toFixed(2)),
    skewness: Number(skewness.toFixed(3)),
    outliersCount,
    outliersRange: [Number(lowerFence.toFixed(2)), Number(upperFence.toFixed(2))],
  };
}

// Compute categorical statistics
export function computeCategoricalStats(
  values: any[],
  totalPopulation: number
): CategoricalStats {
  const counts: Record<string, number> = {};
  let validCount = 0;

  for (const raw of values) {
    if (raw !== null && raw !== undefined && String(raw).trim() !== '') {
      const val = String(raw).trim();
      counts[val] = (counts[val] || 0) + 1;
      validCount++;
    }
  }

  const missingCount = totalPopulation - validCount;
  const missingPercentage = totalPopulation > 0 ? (missingCount / totalPopulation) * 100 : 0;

  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const predominantCategory = entries.length > 0 ? entries[0][0] : 'N/A';

  const absoluteFreqs = entries.map(([category, count]) => ({ category, count }));
  const relativeFreqs = entries.map(([category, count]) => ({
    category,
    percentage: Number(((count / (validCount || 1)) * 100).toFixed(2)),
  }));

  return {
    validCount,
    categoryCount: entries.length,
    predominantCategory,
    missingCount,
    missingPercentage: Number(missingPercentage.toFixed(2)),
    absoluteFreqs,
    relativeFreqs,
  };
}

// Calculate Pearson Correlation Matrix between numeric columns
export function computeCorrelationMatrix(
  data: Record<string, any>[],
  numericCols: string[]
): { matrix: number[][]; pairs: CorrelationPair[] } {
  const n = data.length;
  const matrix: number[][] = [];
  const pairs: CorrelationPair[] = [];

  // Extract clean vectors
  const vectors: Record<string, number[]> = {};
  const means: Record<string, number> = {};

  for (const col of numericCols) {
    const raw = data.map((row) => {
      const v = parseFloat(row[col]);
      return isNaN(v) ? 0 : v;
    });
    vectors[col] = raw;
    means[col] = raw.reduce((a, b) => a + b, 0) / (n || 1);
  }

  for (let i = 0; i < numericCols.length; i++) {
    matrix[i] = [];
    const colA = numericCols[i];
    const vecA = vectors[colA];
    const meanA = means[colA];

    for (let j = 0; j < numericCols.length; j++) {
      if (i === j) {
        matrix[i][j] = 1.0;
        continue;
      }
      const colB = numericCols[j];
      const vecB = vectors[colB];
      const meanB = means[colB];

      let num = 0;
      let denA = 0;
      let denB = 0;

      for (let k = 0; k < n; k++) {
        const diffA = vecA[k] - meanA;
        const diffB = vecB[k] - meanB;
        num += diffA * diffB;
        denA += diffA * diffA;
        denB += diffB * diffB;
      }

      const den = Math.sqrt(denA * denB);
      const r = den > 1e-9 ? num / den : 0;
      const rounded = Number(Math.max(-1, Math.min(1, r)).toFixed(3));
      matrix[i][j] = rounded;

      if (i < j) {
        pairs.push({ colA, colB, correlation: rounded });
      }
    }
  }

  pairs.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));
  return { matrix, pairs };
}

// Euclidean distance squared
export function distSq(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return sum;
}

// Euclidean distance
export function dist(a: number[], b: number[]): number {
  return Math.sqrt(distSq(a, b));
}

// K-Means++ centroid initialization with seedable PRNG
function initKMeansPlusPlus(
  data: number[][],
  k: number,
  rng: () => number
): number[][] {
  const n = data.length;
  const centroids: number[][] = [];

  // Pick first centroid uniformly at random
  const firstIndex = Math.floor(rng() * n);
  centroids.push([...data[firstIndex]]);

  const minDistances: number[] = new Array(n).fill(Infinity);

  for (let c = 1; c < k; c++) {
    const prevCentroid = centroids[c - 1];
    let sumDistSq = 0;

    for (let i = 0; i < n; i++) {
      const d = distSq(data[i], prevCentroid);
      if (d < minDistances[i]) {
        minDistances[i] = d;
      }
      sumDistSq += minDistances[i];
    }

    // Roulette wheel selection proportional to D(x)^2
    let threshold = rng() * sumDistSq;
    let selectedIdx = 0;
    for (let i = 0; i < n; i++) {
      threshold -= minDistances[i];
      if (threshold <= 0) {
        selectedIdx = i;
        break;
      }
    }
    centroids.push([...data[selectedIdx]]);
  }

  return centroids;
}

// Single run of Lloyd's K-means algorithm
function runLloydKMeans(
  data: number[][],
  k: number,
  initialCentroids: number[][],
  maxIterations = 300,
  tol = 1e-4
): {
  centroids: number[][];
  assignments: number[];
  inertia: number;
  converged: boolean;
  iterations: number;
} {
  const n = data.length;
  const d = data[0].length;
  let centroids = initialCentroids.map((c) => [...c]);
  let assignments = new Array(n).fill(0);
  let converged = false;
  let iterations = 0;

  for (let iter = 0; iter < maxIterations; iter++) {
    iterations = iter + 1;
    let assignmentChanged = false;

    // Step 1: Assignment phase
    for (let i = 0; i < n; i++) {
      let minD = Infinity;
      let bestCluster = 0;
      for (let c = 0; c < k; c++) {
        const d2 = distSq(data[i], centroids[c]);
        if (d2 < minD) {
          minD = d2;
          bestCluster = c;
        }
      }
      if (assignments[i] !== bestCluster) {
        assignments[i] = bestCluster;
        assignmentChanged = true;
      }
    }

    // Step 2: Update centroids
    const newCentroids: number[][] = Array.from({ length: k }, () =>
      new Array(d).fill(0)
    );
    const counts = new Array(k).fill(0);

    for (let i = 0; i < n; i++) {
      const c = assignments[i];
      counts[c]++;
      for (let j = 0; j < d; j++) {
        newCentroids[c][j] += data[i][j];
      }
    }

    let maxShift = 0;
    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        for (let j = 0; j < d; j++) {
          newCentroids[c][j] /= counts[c];
        }
      } else {
        // If an empty cluster happens, reseed it to the point furthest from any centroid
        newCentroids[c] = [...centroids[c]];
      }

      const shift = dist(centroids[c], newCentroids[c]);
      if (shift > maxShift) maxShift = shift;
    }

    centroids = newCentroids;

    if (!assignmentChanged || maxShift < tol) {
      converged = true;
      break;
    }
  }

  // Calculate final inertia (Sum of squared distances)
  let inertia = 0;
  for (let i = 0; i < n; i++) {
    inertia += distSq(data[i], centroids[assignments[i]]);
  }

  return { centroids, assignments, inertia, converged, iterations };
}

// Exact & Stratified Silhouette Score
export function computeSilhouetteScore(
  data: number[][],
  assignments: number[],
  k: number
): number {
  const n = data.length;
  if (k <= 1 || n <= k) return 0;

  // Subsample if N is large for instantaneous UI response (sample size max 1000)
  const maxSample = 1000;
  const indices: number[] = [];
  if (n <= maxSample) {
    for (let i = 0; i < n; i++) indices.push(i);
  } else {
    // Stratified sample
    const byCluster: number[][] = Array.from({ length: k }, () => []);
    for (let i = 0; i < n; i++) {
      byCluster[assignments[i]].push(i);
    }
    const samplePerCluster = Math.max(10, Math.floor(maxSample / k));
    for (let c = 0; c < k; c++) {
      const pool = byCluster[c];
      const take = Math.min(pool.length, samplePerCluster);
      for (let t = 0; t < take; t++) {
        indices.push(pool[t]);
      }
    }
  }

  const sampleCount = indices.length;
  let totalSilhouette = 0;

  for (let sIdx = 0; sIdx < sampleCount; sIdx++) {
    const i = indices[sIdx];
    const myCluster = assignments[i];
    const pointI = data[i];

    // Compute a(i): average distance to same cluster
    let aSum = 0;
    let aCount = 0;

    // Cluster distance sums for b(i)
    const clusterDistSum = new Array(k).fill(0);
    const clusterPointCount = new Array(k).fill(0);

    for (let jIdx = 0; jIdx < sampleCount; jIdx++) {
      const j = indices[jIdx];
      if (i === j) continue;
      const cJ = assignments[j];
      const d = dist(pointI, data[j]);

      if (cJ === myCluster) {
        aSum += d;
        aCount++;
      } else {
        clusterDistSum[cJ] += d;
        clusterPointCount[cJ]++;
      }
    }

    const a = aCount > 0 ? aSum / aCount : 0;

    // Compute b(i): minimum mean distance to another cluster
    let b = Infinity;
    for (let c = 0; c < k; c++) {
      if (c === myCluster) continue;
      if (clusterPointCount[c] > 0) {
        const meanD = clusterDistSum[c] / clusterPointCount[c];
        if (meanD < b) {
          b = meanD;
        }
      }
    }

    if (b === Infinity) b = 0;

    const denom = Math.max(a, b);
    const s_i = denom > 1e-9 ? (b - a) / denom : 0;
    totalSilhouette += s_i;
  }

  return Number((totalSilhouette / sampleCount).toFixed(4));
}

// Davies-Bouldin Index (Lower is better)
export function computeDaviesBouldin(
  data: number[][],
  centroids: number[][],
  assignments: number[],
  k: number
): number {
  const n = data.length;
  if (k <= 1) return 0;

  // Average distance within cluster (s_i)
  const s = new Array(k).fill(0);
  const counts = new Array(k).fill(0);

  for (let i = 0; i < n; i++) {
    const c = assignments[i];
    counts[c]++;
    s[c] += dist(data[i], centroids[c]);
  }

  for (let c = 0; c < k; c++) {
    s[c] = counts[c] > 0 ? s[c] / counts[c] : 0;
  }

  let dbSum = 0;
  for (let i = 0; i < k; i++) {
    let maxR = 0;
    for (let j = 0; j < k; j++) {
      if (i === j) continue;
      const centroidDist = dist(centroids[i], centroids[j]);
      if (centroidDist > 1e-9) {
        const r_ij = (s[i] + s[j]) / centroidDist;
        if (r_ij > maxR) maxR = r_ij;
      }
    }
    dbSum += maxR;
  }

  return Number((dbSum / k).toFixed(3));
}

// Calinski-Harabasz Index (Higher is better)
export function computeCalinskiHarabasz(
  data: number[][],
  centroids: number[][],
  assignments: number[],
  k: number
): number {
  const n = data.length;
  const d = data[0].length;
  if (k <= 1 || n <= k) return 0;

  // Global mean
  const globalMean = new Array(d).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < d; j++) {
      globalMean[j] += data[i][j];
    }
  }
  for (let j = 0; j < d; j++) {
    globalMean[j] /= n;
  }

  // Between-cluster dispersion (B)
  const clusterCounts = new Array(k).fill(0);
  for (let i = 0; i < n; i++) {
    clusterCounts[assignments[i]]++;
  }

  let betweenDispersion = 0;
  for (let c = 0; c < k; c++) {
    if (clusterCounts[c] > 0) {
      betweenDispersion += clusterCounts[c] * distSq(centroids[c], globalMean);
    }
  }

  // Within-cluster dispersion (W = inertia)
  let withinDispersion = 0;
  for (let i = 0; i < n; i++) {
    withinDispersion += distSq(data[i], centroids[assignments[i]]);
  }

  if (withinDispersion <= 1e-9) return 0;

  const score = (betweenDispersion / (k - 1)) / (withinDispersion / (n - k));
  return Number(score.toFixed(2));
}

// Principal Component Analysis (2D projection via Power Iteration with Deflation)
export function computePCA2D(
  data: number[][]
): {
  coordinates: { x: number; y: number }[];
  explainedVariance: [number, number];
} {
  const n = data.length;
  const d = data[0].length;

  if (d === 1) {
    return {
      coordinates: data.map((row) => ({ x: row[0], y: 0 })),
      explainedVariance: [100, 0],
    };
  }

  // Center data
  const means = new Array(d).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < d; j++) {
      means[j] += data[i][j];
    }
  }
  for (let j = 0; j < d; j++) {
    means[j] /= n;
  }

  const centered: number[][] = Array.from({ length: n }, () => new Array(d).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < d; j++) {
      centered[i][j] = data[i][j] - means[j];
    }
  }

  // Covariance matrix C = (X^T * X) / (n - 1)
  const cov: number[][] = Array.from({ length: d }, () => new Array(d).fill(0));
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += centered[k][i] * centered[k][j];
      }
      cov[i][j] = n > 1 ? sum / (n - 1) : 0;
    }
  }

  // Total variance (trace of covariance matrix)
  let totalVar = 0;
  for (let i = 0; i < d; i++) {
    totalVar += cov[i][i];
  }
  if (totalVar <= 1e-9) totalVar = 1;

  // Power iteration helper to extract top eigenvector and eigenvalue
  const powerIteration = (mat: number[][], maxIter = 100) => {
    let v: number[] = new Array(d).fill(0).map((_, idx) => (idx % 2 === 0 ? 1 : -0.5));
    // normalize initial
    let norm = Math.sqrt(v.reduce((a, b) => a + b * b, 0));
    v = v.map((x) => x / (norm || 1));

    let lambda = 0;
    for (let it = 0; it < maxIter; it++) {
      const nextV = new Array(d).fill(0);
      for (let i = 0; i < d; i++) {
        for (let j = 0; j < d; j++) {
          nextV[i] += mat[i][j] * v[j];
        }
      }
      norm = Math.sqrt(nextV.reduce((a, b) => a + b * b, 0));
      if (norm < 1e-9) break;
      v = nextV.map((x) => x / norm);
      lambda = norm;
    }
    return { v, lambda };
  };

  // 1st eigenvector
  const pc1 = powerIteration(cov);

  // Deflate covariance matrix for 2nd eigenvector: C_deflated = C - lambda1 * (v1 * v1^T)
  const cov2: number[][] = Array.from({ length: d }, () => new Array(d).fill(0));
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      cov2[i][j] = cov[i][j] - pc1.lambda * pc1.v[i] * pc1.v[j];
    }
  }

  const pc2 = powerIteration(cov2);

  // Project points
  const coordinates = centered.map((row) => {
    let x = 0;
    let y = 0;
    for (let j = 0; j < d; j++) {
      x += row[j] * pc1.v[j];
      y += row[j] * pc2.v[j];
    }
    return {
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
    };
  });

  const var1 = Math.min(100, Math.max(0, (pc1.lambda / totalVar) * 100));
  const var2 = Math.min(100 - var1, Math.max(0, (pc2.lambda / totalVar) * 100));

  return {
    coordinates,
    explainedVariance: [Number(var1.toFixed(1)), Number(var2.toFixed(1))],
  };
}

// Multi-K Evaluation for Elbow and Silhouette Curve (K=2 to 8)
export function evaluateKRange(
  scaledData: number[][],
  minK = 2,
  maxK = 8,
  seed = 42
): ElbowPoint[] {
  const points: ElbowPoint[] = [];
  const n = scaledData.length;
  const actualMax = Math.min(maxK, Math.floor(n / 2), 8);

  for (let k = minK; k <= actualMax; k++) {
    const rng = createPRNG(seed + k * 17);
    let bestInertia = Infinity;
    let bestResult: any = null;

    // Run 5 initializations for evaluation
    for (let init = 0; init < 5; init++) {
      const initCentroids = initKMeansPlusPlus(scaledData, k, rng);
      const res = runLloydKMeans(scaledData, k, initCentroids, 100);
      if (res.inertia < bestInertia) {
        bestInertia = res.inertia;
        bestResult = res;
      }
    }

    if (bestResult) {
      const sil = computeSilhouetteScore(scaledData, bestResult.assignments, k);
      const db = computeDaviesBouldin(scaledData, bestResult.centroids, bestResult.assignments, k);
      const ch = computeCalinskiHarabasz(scaledData, bestResult.centroids, bestResult.assignments, k);

      points.push({
        k,
        inertia: Number(bestResult.inertia.toFixed(2)),
        silhouette: sil,
        daviesBouldin: db,
        calinskiHarabasz: ch,
      });
    }
  }

  return points;
}

// Master K-Means execution function with full preprocessing and metrics
export function executeKMeans(
  rows: Record<string, any>[],
  numericFeatures: string[],
  categoricalFeatures: string[],
  idCol: string | null,
  k: number,
  config: PreprocessingConfig
): KMeansResult {
  const n = rows.length;
  const rng = createPRNG(config.seed);

  // 1. Impute and prepare numeric values
  const preparedNumerics: number[][] = [];
  const colMeans: Record<string, number> = {};
  const colMedians: Record<string, number> = {};
  const colIQRs: Record<string, number> = {};
  const colStds: Record<string, number> = {};

  for (const col of numericFeatures) {
    const vals = rows
      .map((r) => parseFloat(r[col]))
      .filter((v) => !isNaN(v) && isFinite(v));
    const sorted = [...vals].sort((a, b) => a - b);
    const mean = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    colMeans[col] = mean;

    if (sorted.length > 0) {
      const mid = Math.floor(sorted.length / 2);
      colMedians[col] = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      colIQRs[col] = Math.max(1e-6, q3 - q1);
    } else {
      colMedians[col] = 0;
      colIQRs[col] = 1;
    }

    const variance =
      vals.length > 1
        ? vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (vals.length - 1)
        : 0;
    colStds[col] = Math.max(1e-6, Math.sqrt(variance));
  }

  // 2. One-Hot Encoding for categorical features
  const oneHotMaps: Record<string, string[]> = {};
  for (const col of categoricalFeatures) {
    const uniques = Array.from(
      new Set(
        rows.map((r) => (r[col] !== null && r[col] !== undefined ? String(r[col]).trim() : ''))
      )
    ).filter((v) => v !== '');
    // Take top 6 categories to prevent curse of dimensionality
    oneHotMaps[col] = uniques.slice(0, 6);
  }

  const encodedFeatureNames: string[] = [...numericFeatures];
  for (const col of categoricalFeatures) {
    for (const catVal of oneHotMaps[col]) {
      encodedFeatureNames.push(`${col}_${catVal}`);
    }
  }

  // 3. Assemble matrix and scale
  const rawMatrix: number[][] = [];
  const originalFeatureMatrix: number[][] = [];

  for (let i = 0; i < n; i++) {
    const row = rows[i];
    const rawVector: number[] = [];
    const origNumericVector: number[] = [];

    // Numerics
    for (const col of numericFeatures) {
      let rawVal = parseFloat(row[col]);
      if (isNaN(rawVal)) {
        if (config.missingHandling === 'median') rawVal = colMedians[col];
        else rawVal = colMeans[col];
      }

      origNumericVector.push(rawVal);

      // Optional log transform
      let processedVal = rawVal;
      if (config.logTransformColumns.includes(col)) {
        processedVal = Math.log1p(Math.max(0, rawVal));
      }

      // Scaler
      if (config.scaler === 'robust') {
        const scaled = (processedVal - colMedians[col]) / colIQRs[col];
        rawVector.push(scaled);
      } else if (config.scaler === 'standard') {
        const scaled = (processedVal - colMeans[col]) / colStds[col];
        rawVector.push(scaled);
      } else {
        rawVector.push(processedVal);
      }
    }

    // Categoricals (One-hot)
    for (const col of categoricalFeatures) {
      const val = row[col] !== null && row[col] !== undefined ? String(row[col]).trim() : '';
      for (const catVal of oneHotMaps[col]) {
        // Weighted slightly lower (0.7) to avoid nominal variables completely drowning numeric variances
        rawVector.push(val === catVal ? 0.7 : 0);
      }
    }

    rawMatrix.push(rawVector);
    originalFeatureMatrix.push(origNumericVector);
  }

  // 4. Run K-Means with multiple restarts (nInit)
  const nInit = Math.max(10, Math.min(config.nInit, 50));
  let bestInertia = Infinity;
  let bestKMeans: any = null;

  for (let run = 0; run < nInit; run++) {
    const initCentroids = initKMeansPlusPlus(rawMatrix, k, rng);
    const result = runLloydKMeans(
      rawMatrix,
      k,
      initCentroids,
      config.maxIterations
    );
    if (result.inertia < bestInertia) {
      bestInertia = result.inertia;
      bestKMeans = result;
    }
  }

  // 5. Compute Cluster Metrics
  const assignments = bestKMeans.assignments as number[];
  const centroidsStandardized = bestKMeans.centroids as number[][];

  const clusterSizes = new Array(k).fill(0);
  for (let i = 0; i < n; i++) {
    clusterSizes[assignments[i]]++;
  }

  const clusterPercentages = clusterSizes.map((count) =>
    Number(((count / (n || 1)) * 100).toFixed(2))
  );

  // Compute Original Scale Centroids (Means of unscaled original features per cluster)
  const centroidsOriginal: Record<string, number>[] = Array.from({ length: k }, () => ({}));
  for (let c = 0; c < k; c++) {
    const clusterIndices: number[] = [];
    for (let i = 0; i < n; i++) {
      if (assignments[i] === c) clusterIndices.push(i);
    }

    for (let f = 0; f < numericFeatures.length; f++) {
      const col = numericFeatures[f];
      if (clusterIndices.length > 0) {
        const sum = clusterIndices.reduce((acc, idx) => acc + originalFeatureMatrix[idx][f], 0);
        centroidsOriginal[c][col] = Number((sum / clusterIndices.length).toFixed(2));
      } else {
        centroidsOriginal[c][col] = Number(colMeans[col].toFixed(2));
      }
    }
  }

  // Standardized Centroids Map
  const centroidsStandardizedMap: Record<string, number>[] = Array.from({ length: k }, () => ({}));
  for (let c = 0; c < k; c++) {
    for (let f = 0; f < encodedFeatureNames.length; f++) {
      centroidsStandardizedMap[c][encodedFeatureNames[f]] = Number(
        centroidsStandardized[c][f].toFixed(3)
      );
    }
  }

  // Distances to assigned centroid
  const clusterDistances = rawMatrix.map((point, idx) =>
    Number(dist(point, centroidsStandardized[assignments[idx]]).toFixed(3))
  );

  // Small cluster check (< 5% of population)
  const smallClusterWarnings: string[] = [];
  for (let c = 0; c < k; c++) {
    if (clusterPercentages[c] < 5) {
      smallClusterWarnings.push(
        `El Cluster ${c + 1} tiene un tamaño muy reducido (${clusterSizes[c]} clientes, ${clusterPercentages[c]}%). Podría representar un segmento nicho o valores extremos.`
      );
    }
  }

  // Validation indexes
  const silhouetteScore = computeSilhouetteScore(rawMatrix, assignments, k);
  const daviesBouldinIndex = computeDaviesBouldin(rawMatrix, centroidsStandardized, assignments, k);
  const calinskiHarabaszIndex = computeCalinskiHarabasz(rawMatrix, centroidsStandardized, assignments, k);

  // PCA 2D coordinates for visual representation
  const pca = computePCA2D(rawMatrix);
  const pcaCoordinates = pca.coordinates.map((coord, idx) => ({
    x: coord.x,
    y: coord.y,
    cluster: assignments[idx],
    id: idCol && rows[idx][idCol] ? rows[idx][idCol] : idx + 1,
  }));

  return {
    k,
    seed: config.seed,
    converged: bestKMeans.converged,
    iterations: bestKMeans.iterations,
    inertia: Number(bestInertia.toFixed(2)),
    silhouetteScore,
    daviesBouldinIndex,
    calinskiHarabaszIndex,
    clusterSizes,
    clusterPercentages,
    centroidsOriginal,
    centroidsStandardized: centroidsStandardizedMap,
    assignedClusters: assignments,
    clusterDistances,
    smallClusterWarnings,
    pcaCoordinates,
    pcaVariance: pca.explainedVariance,
    featureNames: encodedFeatureNames,
    originalNumericFeatures: numericFeatures,
    categoricalFeatures,
    encodedFeatureNames,
  };
}

// Compute Differentiating Features for each cluster (|z-score| vs global mean)
export function computeDifferentiatingFeatures(
  kMeansResult: KMeansResult,
  stats: Record<string, NumericStats>
): Record<number, DifferentiatingFeature[]> {
  const diffs: Record<number, DifferentiatingFeature[]> = {};

  for (let c = 0; c < kMeansResult.k; c++) {
    const clusterDiffs: DifferentiatingFeature[] = [];

    for (const col of kMeansResult.originalNumericFeatures) {
      const colStat = stats[col];
      if (!colStat) continue;

      const clusterMean = kMeansResult.centroidsOriginal[c][col] ?? 0;
      const globalMean = colStat.mean;
      const globalStd = Math.max(1e-6, colStat.stdDev);

      const zScore = (clusterMean - globalMean) / globalStd;
      const pctDiff =
        Math.abs(globalMean) > 1e-6
          ? ((clusterMean - globalMean) / Math.abs(globalMean)) * 100
          : 0;

      clusterDiffs.push({
        variable: col,
        zScore: Number(zScore.toFixed(2)),
        clusterMean,
        globalMean,
        direction: zScore >= 0 ? 'superior' : 'inferior',
        percentageDifference: Number(pctDiff.toFixed(1)),
      });
    }

    // Sort by largest absolute z-score
    clusterDiffs.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));
    diffs[c] = clusterDiffs;
  }

  return diffs;
}
