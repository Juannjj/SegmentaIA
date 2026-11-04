import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Server-side Gemini initialization with recommended telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// API: Descriptive Analysis AI Interpretation
app.post('/api/gemini/interpret-descriptive', async (req, res) => {
  try {
    const { sector, statsSummary, correlations } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY no está configurada en las variables de entorno de AI Studio.',
        fallback: true,
      });
    }

    const prompt = `
Eres un científico de datos senior y estratega de negocios en el sector "${sector}".
Analiza los siguientes hallazgos estadísticos agregados procedentes de una base de datos real:

RESUMEN ESTADÍSTICO DE VARIABLES:
${JSON.stringify(statsSummary, null, 2)}

CORRELACIONES PRINCIPALES:
${JSON.stringify(correlations, null, 2)}

INSTRUCCIÓN ESTRICTA:
1. No inventes datos que no figuren en las estadísticas suministradas.
2. No uses supuestos sectoriales como si fueran hechos observados.
3. Debes estructurar tu respuesta en cuatro secciones claramente delimitadas:
   - "hallazgos": 3 a 5 observaciones empíricas directamente deducibles de los números (medias, asimetrías, dispersión, correlaciones).
   - "interpretaciones": Qué significan estas distribuciones para la dinámica de clientes en el sector ${sector}.
   - "hipotesisComerciales": 2 a 3 hipótesis comerciales para validar empíricamente.
   - "recomendaciones": 3 recomendaciones tácticas de negocio fundamentadas en los datos.

Responde ÚNICAMENTE en formato JSON con la siguiente estructura exacta:
{
  "hallazgos": ["..."],
  "interpretaciones": ["..."],
  "hipotesisComerciales": ["..."],
  "recomendaciones": ["..."],
  "resumenEjecutivo": "Párrafo conciso de síntesis del estado de la base de clientes."
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error en /api/gemini/interpret-descriptive:', error);
    return res.status(500).json({
      error: error.message || 'Error al procesar interpretación descriptiva con Gemini',
    });
  }
});

// API: Cluster Commercial Naming & Profiling
app.post('/api/gemini/interpret-clusters', async (req, res) => {
  try {
    const { sector, clustersData } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY no disponible.',
        fallback: true,
      });
    }

    const prompt = `
Eres un director de analítica de clientes y segmentación de mercados para el sector "${sector}".
A continuación tienes los centroides y métricas calculadas con K-Means para cada cluster identificado:

DATOS DE CLUSTERS:
${JSON.stringify(clustersData, null, 2)}

INSTRUCCIONES CLAVE:
1. Asigna un NOMBRE COMERCIAL profesional a cada segmento (ej. en telecomunicaciones: "Conectados de Alto Consumo", "Usuarios Tradicionales de Voz", "Hogares Digitales en Riesgo", etc., pero ADAPTADO a los centroides reales).
2. Evita estereotipos demográficos injustificados.
3. Identifica la característica principal del comportamiento.
4. Señala necesidades potenciales y oportunidades comerciales.
5. Incluye limitaciones o advertencias del perfil.

Devuelve ÚNICAMENTE un array JSON con la estructura para cada cluster:
[
  {
    "clusterId": 0,
    "nombreComercial": "Nombre sugerido claro y comercial",
    "caracteristicaPrincipal": "Frase que resume su rasgo más diferencial",
    "descripcion": "Descripción detallada del perfil basada en sus medias",
    "necesidadesPotenciales": ["necesidad 1", "necesidad 2"],
    "oportunidadesComerciales": ["oportunidad 1", "oportunidad 2"],
    "advertencias": "Riesgos o consideraciones de este grupo"
  }
]
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error en /api/gemini/interpret-clusters:', error);
    return res.status(500).json({
      error: error.message || 'Error al generar perfiles e interpretación de clusters',
    });
  }
});

// API: Marketing Strategies & Communication Plan
app.post('/api/gemini/generate-strategies', async (req, res) => {
  try {
    const { sector, clusterProfiles } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY no disponible.',
        fallback: true,
      });
    }

    const prompt = `
Eres un estratega jefe de marketing y CRM en el sector "${sector}".
Genera un plan estratégico de mercadeo y comunicación para cada uno de los siguientes clusters segmentados:

PERFILES DE CLUSTER:
${JSON.stringify(clusterProfiles, null, 2)}

Para CADA cluster debes generar:
1. diagnosticoComercial: Qué caracteriza al segmento y su relevancia.
2. objetivoComercial: Meta medible y realista.
3. estrategiaMarketing: Elección justificada (Fidelización, Upselling, Cross-selling, Retención, Activación digital, etc.).
4. propuestaValor: Oferta o paquete recomendado.
5. canalesRecomendados: Canales de contacto con justificación y aviso si son hipótesis de prueba.
6. mensajes:
   - mensajePrincipal: Eslogan o frase central.
   - sms: Texto corto para SMS (máx 150 caracteres).
   - email: Asunto y cuerpo para email marketing.
   - whatsapp: Mensaje directo y respetuoso para WhatsApp con consentimiento.
   - cta: Llamado a la acción directo.
   - conceptoCampana: Idea creativa de campaña publicitaria.
7. kpis: Lista de 3 KPIs (claramente marcados como objetivos futuros).
8. metasComerciales: Metas tentativas sugeridas.
9. plan90Dias: 4 fases (Semanas 1-2 Preparación, Semanas 3-4 Piloto, Semanas 5-8 Ejecución y optimización, Semanas 9-12 Medición y evaluación) con actividad, canal, KPI y responsable sugerido.

Devuelve ÚNICAMENTE un objeto JSON:
{
  "strategies": [
    {
      "clusterId": 0,
      "diagnosticoComercial": "...",
      "objetivoComercial": "...",
      "estrategiaMarketing": "...",
      "propuestaValor": "...",
      "canalesRecomendados": ["Email", "App móvil"],
      "mensajes": {
        "mensajePrincipal": "...",
        "sms": "...",
        "email": { "asunto": "...", "cuerpo": "..." },
        "whatsapp": "...",
        "cta": "...",
        "conceptoCampana": "..."
      },
      "kpis": ["..."],
      "metasComerciales": ["..."],
      "plan90Dias": [
        {
          "fase": "Semanas 1 y 2: Preparación y Validación",
          "actividades": "...",
          "canal": "...",
          "kpi": "...",
          "responsable": "..."
        },
        {
          "fase": "Semanas 3 y 4: Pruebas Piloto",
          "actividades": "...",
          "canal": "...",
          "kpi": "...",
          "responsable": "..."
        },
        {
          "fase": "Semanas 5 a 8: Ejecución y Optimización",
          "actividades": "...",
          "canal": "...",
          "kpi": "...",
          "responsable": "..."
        },
        {
          "fase": "Semanas 9 a 12: Medición y Evaluación",
          "actividades": "...",
          "canal": "...",
          "kpi": "...",
          "responsable": "..."
        }
      ]
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error en /api/gemini/generate-strategies:', error);
    return res.status(500).json({
      error: error.message || 'Error al generar estrategias con Gemini',
    });
  }
});

// API: Generate Cluster Persona Image via Gemini Image Generation
app.post('/api/gemini/generate-persona-image', async (req, res) => {
  try {
    const { sector, clusterName, visualDescription, clusterIndex } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY no disponible. Configura la clave en el panel de secretos de AI Studio.',
        fallback: true,
      });
    }

    // Cohesive editorial illustration prompt following skill guidelines
    const prompt = `Modern editorial conceptual illustration of a customer persona representing "${clusterName}" in the "${sector}" industry. ${visualDescription}. Style: clean professional editorial corporate illustration, semi-realistic minimalist aesthetics, sophisticated color harmony with deep navy blue, tech cyan, teal accents, smooth geometric ambient shapes, centered fictional character in their representative context. High quality digital artwork, 3:4 portrait aspect ratio, isolated subject on cohesive background. No messy text.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: '3:4',
          },
        },
      });

      let base64Image: string | null = null;
      let mimeType = 'image/png';

      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          base64Image = part.inlineData.data;
          mimeType = part.inlineData.mimeType || 'image/png';
          break;
        }
      }

      if (base64Image) {
        return res.json({
          success: true,
          imageUrl: `data:${mimeType};base64,${base64Image}`,
        });
      } else {
        return res.status(200).json({
          success: false,
          fallback: true,
          message: 'El modelo no devolvió datos de imagen en línea. Se activará el motor de renderizado vectorial editorial.',
        });
      }
    } catch (genErr: any) {
      console.warn('Gemini image model call notice:', genErr.message);
      return res.status(200).json({
        success: false,
        fallback: true,
        message: genErr.message || 'Modelo de generación no disponible en este nivel de suscripción.',
      });
    }
  } catch (error: any) {
    console.error('Error en /api/gemini/generate-persona-image:', error);
    return res.status(500).json({
      error: error.message || 'Error en endpoint de imagen',
      fallback: true,
    });
  }
});

// Setup Vite middleware in dev or serve static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SegmentaIA Server running on port ${PORT}`);
  });
}

startServer();
