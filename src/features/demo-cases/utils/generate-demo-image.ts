import type { DemoCaseKind } from '../types';

const WIDTH = 640;
const HEIGHT = 420;

function addNoise(ctx: CanvasRenderingContext2D, alpha = 0.08) {
  const image = ctx.getImageData(0, 0, WIDTH, HEIGHT);
  for (let i = 0; i < image.data.length; i += 4) {
    const n = ((i * 17 + 29) % 37) - 18;
    image.data[i] = Math.max(0, Math.min(255, image.data[i] + n * alpha));
    image.data[i + 1] = Math.max(0, Math.min(255, image.data[i + 1] + n * alpha));
    image.data[i + 2] = Math.max(0, Math.min(255, image.data[i + 2] + n * alpha));
  }
  ctx.putImageData(image, 0, 0);
}

function drawBoneLikeShapes(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = 'rgba(238, 242, 246, 0.9)';
  ctx.lineWidth = 34;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(215, 70);
  ctx.bezierCurveTo(250, 160, 260, 245, 220, 355);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(410, 72);
  ctx.bezierCurveTo(380, 160, 372, 245, 420, 356);
  ctx.stroke();
  ctx.lineWidth = 18;
  ctx.strokeStyle = 'rgba(205, 214, 225, 0.8)';
  ctx.beginPath();
  ctx.arc(315, 230, 86, 0, Math.PI * 2);
  ctx.stroke();
}

function drawSliceRings(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createRadialGradient(320, 210, 30, 320, 210, 205);
  gradient.addColorStop(0, '#d8dbe2');
  gradient.addColorStop(0.45, '#6c7480');
  gradient.addColorStop(1, '#171d27');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(320, 210, 230, 165, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.28)';
  ctx.lineWidth = 2;
  for (let r = 55; r < 190; r += 42) {
    ctx.beginPath();
    ctx.ellipse(320, 210, r * 1.18, r * 0.82, 0.08, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawUltrasound(ctx: CanvasRenderingContext2D) {
  const cone = ctx.createLinearGradient(320, 35, 320, 410);
  cone.addColorStop(0, '#d6dce5');
  cone.addColorStop(0.6, '#3d4651');
  cone.addColorStop(1, '#0b0f14');
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(210, 40);
  ctx.quadraticCurveTo(320, 95, 430, 40);
  ctx.lineTo(560, 405);
  ctx.lineTo(80, 405);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.18)';
  for (let y = 90; y < 390; y += 24) {
    ctx.beginPath();
    ctx.moveTo(125, y);
    ctx.lineTo(515, y + Math.sin(y) * 8);
    ctx.stroke();
  }
}

function drawCameraScreen(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#111827';
  ctx.fillRect(86, 48, 468, 324);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(116, 76, 408, 264);
  ctx.fillStyle = '#1f2937';
  ctx.fillRect(146, 104, 348, 206);
  drawBoneLikeShapes(ctx);
  ctx.strokeStyle = 'rgba(255,255,255,.35)';
  ctx.lineWidth = 5;
  ctx.strokeRect(86, 48, 468, 324);
}

export function generateSyntheticImageData(kind: DemoCaseKind): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas is unavailable for synthetic demo case generation');
  }

  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (kind === 'xray-like') {
    drawBoneLikeShapes(ctx);
    addNoise(ctx, 0.2);
  } else if (kind === 'ct-mri-slice-like') {
    drawSliceRings(ctx);
    addNoise(ctx, 0.15);
  } else if (kind === 'ultrasound-like') {
    drawUltrasound(ctx);
    addNoise(ctx, 0.55);
  } else if (kind === 'low-contrast') {
    ctx.fillStyle = '#5b6470';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = 'rgba(138, 148, 160, .38)';
    ctx.beginPath();
    ctx.ellipse(320, 220, 185, 112, -0.12, 0, Math.PI * 2);
    ctx.fill();
    addNoise(ctx, 0.08);
  } else if (kind === 'camera-captured-screen') {
    drawCameraScreen(ctx);
    addNoise(ctx, 0.18);
  } else {
    const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
    gradient.addColorStop(0, '#dbeafe');
    gradient.addColorStop(1, '#334155');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = 'rgba(255,255,255,.45)';
    ctx.beginPath();
    ctx.roundRect(185, 110, 270, 190, 28);
    ctx.fill();
  }

  return ctx.getImageData(0, 0, WIDTH, HEIGHT);
}

export function imageDataToDataUrl(imageData: ImageData): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas is unavailable for preview generation');
  }
  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/png');
}
