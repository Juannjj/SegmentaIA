export interface PersonaPosterData {
  clusterIndex: number;
  clusterName: string;
  sector: string;
  percentage: number;
  size: number;
  mainCharacteristic: string;
  keyFeatures: { variable: string; direction: string }[];
  aiImageBase64?: string | null;
  themeColor?: string;
  accentColor?: string;
}

const PALETTES = [
  { primary: '#0284c7', accent: '#38bdf8', bgStart: '#0f172a', bgEnd: '#020617', name: 'Ocean Tech' },
  { primary: '#0d9488', accent: '#2dd4bf', bgStart: '#042f2e', bgEnd: '#020617', name: 'Emerald Wave' },
  { primary: '#6366f1', accent: '#818cf8', bgStart: '#1e1b4b', bgEnd: '#020617', name: 'Cyber Indigo' },
  { primary: '#f59e0b', accent: '#fbbf24', bgStart: '#451a03', bgEnd: '#020617', name: 'Solar Amber' },
  { primary: '#ec4899', accent: '#f472b6', bgStart: '#500724', bgEnd: '#020617', name: 'Ruby Tech' },
  { primary: '#8b5cf6', accent: '#a78bfa', bgStart: '#2e1065', bgEnd: '#020617', name: 'Violet Pulse' },
];

export async function renderPersonaPoster(data: PersonaPosterData): Promise<string> {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 1500;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const palette = PALETTES[data.clusterIndex % PALETTES.length];

  // 1. Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, width, height);
  bgGrad.addColorStop(0, palette.bgStart);
  bgGrad.addColorStop(0.5, '#090d16');
  bgGrad.addColorStop(1, palette.bgEnd);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Sophisticated Geometric Grid & Ambient Glows
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const gridSize = 60;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Radial ambient aura
  const radialGlow = ctx.createRadialGradient(width / 2, 600, 50, width / 2, 600, 480);
  radialGlow.addColorStop(0, `${palette.primary}44`);
  radialGlow.addColorStop(0.5, `${palette.accent}15`);
  radialGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = radialGlow;
  ctx.fillRect(0, 200, width, 800);
  ctx.restore();

  // 3. Header: Sector & Cluster Index Badge
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.roundRect(80, 70, width - 160, 56, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.stroke();

  ctx.fillStyle = palette.accent;
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`SECTOR: ${data.sector.toUpperCase()}`, 110, 105);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  const clusterLabel = `SEGMENTO ${data.clusterIndex + 1} DE ${data.percentage}% DE LA POBLACIÓN (${data.size} CLIENTES)`;
  const clusterLabelWidth = ctx.measureText(clusterLabel).width;
  ctx.fillText(clusterLabel, width - 110 - clusterLabelWidth, 105);
  ctx.restore();

  // 4. Large Cluster Title (Typography)
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 52px "Plus Jakarta Sans", sans-serif';

  // Word wrap title
  const words = data.clusterName.split(' ');
  let line = '';
  const lines: string[] = [];
  const maxTitleWidth = width - 160;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxTitleWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  let titleY = 180;
  for (const l of lines) {
    ctx.fillText(l.trim(), 80, titleY);
    titleY += 62;
  }

  // Accent Line under title
  const accentGrad = ctx.createLinearGradient(80, titleY - 10, 380, titleY - 10);
  accentGrad.addColorStop(0, palette.accent);
  accentGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = accentGrad;
  ctx.fillRect(80, titleY - 15, 300, 4);
  ctx.restore();

  // 5. Central Artwork Frame (AI Image or Editorial Vector Illustration)
  const frameX = 80;
  const frameY = titleY + 20;
  const frameW = width - 160;
  const frameH = 680;

  // Frame outer border
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
  ctx.beginPath();
  ctx.roundRect(frameX, frameY, frameW, frameH, 24);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // If AI Image is supplied, load and render it inside the frame
  let renderedImage = false;
  if (data.aiImageBase64) {
    try {
      const img = new Image();
      img.src = data.aiImageBase64;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject();
      });

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(frameX + 4, frameY + 4, frameW - 8, frameH - 8, 20);
      ctx.clip();
      ctx.drawImage(img, frameX + 4, frameY + 4, frameW - 8, frameH - 8);

      // Subtle gradient vignette at bottom of image
      const imgVignette = ctx.createLinearGradient(0, frameY + frameH - 200, 0, frameY + frameH);
      imgVignette.addColorStop(0, 'transparent');
      imgVignette.addColorStop(1, 'rgba(2, 6, 23, 0.85)');
      ctx.fillStyle = imgVignette;
      ctx.fillRect(frameX, frameY, frameW, frameH);
      ctx.restore();
      renderedImage = true;
    } catch {
      renderedImage = false;
    }
  }

  // Fallback: Semi-realistic Vector Editorial Character & Visual Context
  if (!renderedImage) {
    renderEditorialArchetype(ctx, frameX, frameY, frameW, frameH, palette, data);
  }
  ctx.restore();

  // 6. Main Characteristic Card
  const charY = frameY + frameH + 30;
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.beginPath();
  ctx.roundRect(80, charY, width - 160, 110, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.stroke();

  ctx.fillStyle = palette.accent;
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('COMPORTAMIENTO Y RASGO PREDOMINANTE:', 110, charY + 40);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '500 24px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`"${data.mainCharacteristic}"`, 110, charY + 80);
  ctx.restore();

  // 7. Key Differentiating Features (Badges)
  const badgesY = charY + 135;
  ctx.save();
  let badgeX = 80;
  for (let i = 0; i < Math.min(data.keyFeatures.length, 3); i++) {
    const feat = data.keyFeatures[i];
    const text = `${feat.variable} (${feat.direction === 'superior' ? '▲ Alto' : '▼ Bajo'})`;
    ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
    const textWidth = ctx.measureText(text).width;
    const badgeW = textWidth + 40;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgesY, badgeW, 46, 23);
    ctx.fill();
    ctx.strokeStyle = palette.primary;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.fillText(text, badgeX + 20, badgesY + 29);

    badgeX += badgeW + 16;
  }
  ctx.restore();

  // 8. Footer Brand & Authenticity Tag
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.beginPath();
  ctx.moveTo(80, height - 70);
  ctx.lineTo(width - 80, height - 70);
  ctx.stroke();

  ctx.fillStyle = '#64748b';
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SegmentaIA • Personificación Estratégica con Inteligencia Artificial', 80, height - 35);

  const authText = data.aiImageBase64 ? 'Ilustración Generada con IA (Google Gemini)' : 'Dirección Artística Editorial SegmentaIA';
  const authWidth = ctx.measureText(authText).width;
  ctx.fillStyle = palette.accent;
  ctx.fillText(authText, width - 80 - authWidth, height - 35);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

// Editorial Vector Archetype Illustration for cohesive collection aesthetic
function renderEditorialArchetype(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  palette: { primary: string; accent: string },
  data: PersonaPosterData
) {
  const centerX = x + w / 2;
  const centerY = y + h / 2 - 20;

  // Concentric decorative circles
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 240, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `${palette.accent}33`;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.arc(centerX, centerY, 200, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Character Silhouette Base (Shoulders & Torso)
  const bodyGrad = ctx.createLinearGradient(centerX, centerY, centerX, centerY + 250);
  bodyGrad.addColorStop(0, '#1e293b');
  bodyGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 220, 160, 130, 0, Math.PI, 0, true);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.stroke();

  // Collar / Business Attire Accent
  ctx.fillStyle = palette.primary;
  ctx.beginPath();
  ctx.moveTo(centerX - 35, centerY + 130);
  ctx.lineTo(centerX + 35, centerY + 130);
  ctx.lineTo(centerX, centerY + 185);
  ctx.closePath();
  ctx.fill();

  // Head & Hair Silhouette
  const headGrad = ctx.createLinearGradient(centerX, centerY - 140, centerX, centerY + 70);
  headGrad.addColorStop(0, '#334155');
  headGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = headGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY + 10, 75, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.stroke();

  // Hair / Stylized silhouette shape
  ctx.fillStyle = palette.primary;
  ctx.beginPath();
  ctx.arc(centerX, centerY - 20, 80, Math.PI * 0.9, Math.PI * 2.1);
  ctx.fill();

  // Smart Glasses / Augmented Visor (Tech aesthetic)
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(centerX - 55, centerY - 10, 48, 28, 6);
  ctx.roundRect(centerX + 7, centerY - 10, 48, 28, 6);
  ctx.fill();
  ctx.stroke();

  // Bridge
  ctx.beginPath();
  ctx.moveTo(centerX - 7, centerY + 4);
  ctx.lineTo(centerX + 7, centerY + 4);
  ctx.stroke();

  // Floating Context Elements (Data chart / Mobile tablet)
  ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(centerX + 140, centerY + 60, 110, 150, 12);
  ctx.fill();
  ctx.stroke();

  // Mini Chart Lines inside tablet
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(centerX + 155, centerY + 160);
  ctx.lineTo(centerX + 175, centerY + 135);
  ctx.lineTo(centerX + 200, centerY + 145);
  ctx.lineTo(centerX + 230, centerY + 105);
  ctx.stroke();

  ctx.restore();
}
