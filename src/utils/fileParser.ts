import * as XLSX from 'xlsx';
import { ColumnMeta, ColumnType, ColumnRole } from '../types';

export interface ParseResult {
  fileName: string;
  sheets: string[];
  selectedSheet: string;
  rows: Record<string, any>[];
  columns: ColumnMeta[];
  totalRows: number;
  duplicateCount: number;
}

// Delimiter auto-detector for CSV/TXT
export function detectDelimiter(text: string): string {
  const sample = text.slice(0, 5000);
  const delimiters = [',', ';', '\t', '|'];
  let bestDelimiter = ',';
  let maxCount = -1;

  for (const d of delimiters) {
    const lines = sample.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) continue;
    const counts = lines.slice(0, 5).map((line) => (line.split(d).length - 1));
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    // Check consistency across lines
    const isConsistent = counts.every((c) => Math.abs(c - counts[0]) <= 1) && counts[0] > 0;
    if (isConsistent && avg > maxCount) {
      maxCount = avg;
      bestDelimiter = d;
    }
  }

  return bestDelimiter;
}

// Parse CSV / TXT text
export function parseDelimitedText(
  text: string,
  delimiter?: string
): Record<string, any>[] {
  const delim = delimiter || detectDelimiter(text);
  const lines = text
    .split(/\r\n|\n|\r/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error('El archivo no contiene suficientes líneas (se requiere encabezado y al menos 1 fila).');
  }

  // Helper to split line with quote awareness
  const splitLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delim && !inQuotes) {
        result.push(current.trim().replace(/^"(.*)"$/, '$1'));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"(.*)"$/, '$1'));
    return result;
  };

  const headers = splitLine(lines[0]).map((h, idx) =>
    h.length > 0 ? h : `Columna_${idx + 1}`
  );

  const rows: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitLine(lines[i]);
    const row: Record<string, any> = {};
    for (let h = 0; h < headers.length; h++) {
      const key = headers[h];
      const val = values[h] ?? null;
      row[key] = val === '' ? null : val;
    }
    rows.push(row);
  }

  return rows;
}

// Inspect columns and classify types & smart roles
export function inspectColumns(rows: Record<string, any>[]): ColumnMeta[] {
  if (rows.length === 0) return [];
  const headerKeys = Object.keys(rows[0]);
  const total = rows.length;

  const idPattern = /^(id|cliente|client|rut|cedula|customer|codigo|nro|doc|identificador|uuid)/i;
  const datePattern = /^\d{4}[-/]\d{1,2}[-/]\d{1,2}|^\d{1,2}[-/]\d{1,2}[-/]\d{4}/;

  return headerKeys.map((name, idx) => {
    const values = rows.map((r) => r[name]);
    const validValues = values.filter((v) => v !== null && v !== undefined && String(v).trim() !== '');
    const missingCount = total - validValues.length;
    const missingPercentage = Number(((missingCount / (total || 1)) * 100).toFixed(2));

    const uniqueSet = new Set(validValues.map((v) => String(v).trim().toLowerCase()));
    const uniqueCount = uniqueSet.size;
    const isConstant = uniqueCount <= 1;
    const isHighCardinality = uniqueCount > 20 && uniqueCount / (validValues.length || 1) > 0.6;

    // Detect type
    let numericCount = 0;
    let booleanCount = 0;
    let dateCount = 0;

    for (const v of validValues) {
      const str = String(v).trim();
      // Check numeric
      const num = Number(str);
      if (!isNaN(num) && isFinite(num) && str !== '') {
        numericCount++;
      }
      // Check boolean
      if (/^(true|false|si|no|1|0|s|n)$/i.test(str)) {
        booleanCount++;
      }
      // Check date
      if (datePattern.test(str) || (!isNaN(Date.parse(str)) && isNaN(Number(str)))) {
        dateCount++;
      }
    }

    const nValid = validValues.length || 1;
    let type: ColumnType = 'categorical';

    if (idPattern.test(name) || (uniqueCount === total && total > 20)) {
      type = 'id';
    } else if (numericCount / nValid > 0.85) {
      type = 'numeric';
    } else if (booleanCount / nValid > 0.9 && uniqueCount <= 2) {
      type = 'boolean';
    } else if (dateCount / nValid > 0.7) {
      type = 'date';
    } else if (isHighCardinality && !idPattern.test(name)) {
      type = 'text';
    }

    // Assign Initial Smart Role
    let role: ColumnRole = 'feature';
    if (type === 'id') {
      role = 'id';
    } else if (type === 'text' || type === 'date' || isConstant) {
      role = 'excluded';
    } else if (type === 'categorical') {
      // If reasonable categories, participate or interpret
      if (uniqueCount <= 10) {
        role = 'feature';
      } else {
        role = 'interpret_only';
      }
    }

    return {
      name,
      type,
      role,
      uniqueCount,
      missingCount,
      missingPercentage,
      sampleValues: validValues.slice(0, 3),
      isConstant,
      isHighCardinality,
      originalIndex: idx,
    };
  });
}

// Count exact duplicate rows
export function countDuplicateRows(rows: Record<string, any>[]): number {
  const seen = new Set<string>();
  let duplicates = 0;
  for (const r of rows) {
    const serialized = JSON.stringify(r);
    if (seen.has(serialized)) {
      duplicates++;
    } else {
      seen.add(serialized);
    }
  }
  return duplicates;
}

// Master File Parser handling .xlsx, .xls, .csv, .txt
export async function parseFile(
  file: File,
  targetSheet?: string
): Promise<ParseResult> {
  const fileName = file.name;
  const ext = fileName.split('.').pop()?.toLowerCase();

  if (ext === 'xlsx' || ext === 'xls') {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });
    const sheets = workbook.SheetNames;
    const selectedSheet = targetSheet && sheets.includes(targetSheet) ? targetSheet : sheets[0];
    const worksheet = workbook.Sheets[selectedSheet];

    // Parse as json array of objects
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: null,
      raw: false,
    });

    const columns = inspectColumns(rawRows);
    const duplicateCount = countDuplicateRows(rawRows);

    return {
      fileName,
      sheets,
      selectedSheet,
      rows: rawRows,
      columns,
      totalRows: rawRows.length,
      duplicateCount,
    };
  } else {
    // CSV or TXT
    const text = await file.text();
    const rows = parseDelimitedText(text);
    const columns = inspectColumns(rows);
    const duplicateCount = countDuplicateRows(rows);

    return {
      fileName,
      sheets: ['Hoja Principal'],
      selectedSheet: 'Hoja Principal',
      rows,
      columns,
      totalRows: rows.length,
      duplicateCount,
    };
  }
}
