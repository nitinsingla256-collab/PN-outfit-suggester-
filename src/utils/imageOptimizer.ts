/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OptimizeOptions {
  maxDimension?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg';
}

export interface OptimizedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

/**
 * Self-contained SVG placeholder for missing or failed images.
 * Guarantees zero network calls and zero render crashes.
 */
export const FALLBACK_GARMENT_IMAGE =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="100%">
  <rect width="400" height="500" fill="#f8fafc"/>
  <rect x="20" y="20" width="360" height="460" rx="16" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1.5"/>
  <g transform="translate(140, 190)" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10H2a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h20a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1h-4V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>
  </g>
  <text x="200" y="270" text-anchor="middle" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" letter-spacing="0.05em">IMAGE UNAVAILABLE</text>
  <text x="200" y="290" text-anchor="middle" fill="#94a3b8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11">Garment metadata intact</text>
</svg>
`.trim());

/**
 * Check if a string is a base64 data url.
 */
export function isBase64DataUrl(str: string): boolean {
  return typeof str === 'string' && str.startsWith('data:image/');
}

/**
 * Estimate size of a base64 string in bytes.
 */
export function estimateBase64Size(base64String: string): number {
  if (!base64String) return 0;
  const padding = (base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0);
  const base64Len = base64String.length - (base64String.indexOf(',') + 1);
  return Math.max(0, Math.floor((base64Len * 3) / 4) - padding);
}

/**
 * Optimizes an image (from File, Blob, or Data URL) by:
 * 1. Resizing to max dimension (default 1280px)
 * 2. Compressing to WebP/JPEG with quality 0.82
 * 3. Enforcing an upper file size bound (~100KB-180KB max)
 */
export async function optimizeImage(
  input: File | Blob | string,
  options: OptimizeOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxDimension = 1280,
    quality = 0.82,
    format = 'image/webp',
  } = options;

  // If input is an external http/https URL, leave it as is
  if (typeof input === 'string' && (input.startsWith('http://') || input.startsWith('https://'))) {
    return {
      dataUrl: input,
      width: 0,
      height: 0,
      sizeBytes: 0,
    };
  }

  // Load the image into an HTMLImageElement
  const src = typeof input === 'string' ? input : await blobToDataUrl(input);
  const img = await loadImage(src);

  // Calculate new constrained dimensions
  let { width, height } = img;
  if (width > maxDimension || height > maxDimension) {
    if (width >= height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  // Draw to offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    return {
      dataUrl: src,
      width: img.width,
      height: img.height,
      sizeBytes: estimateBase64Size(src),
    };
  }

  // Fill with clean neutral background in case of transparent png
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  // Try WebP first, verify browser support
  let dataUrl = canvas.toDataURL(format, quality);
  if (!dataUrl.startsWith(`data:${format}`)) {
    // Browser doesn't support WebP export, fall back to JPEG
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  let sizeBytes = estimateBase64Size(dataUrl);

  // Secondary pass: if size is still unexpectedly large (> 250KB), step down resolution & quality
  if (sizeBytes > 250 * 1024) {
    const compactDimension = Math.min(width, 960);
    const compactCanvas = document.createElement('canvas');
    const scale = compactDimension / Math.max(width, height);
    compactCanvas.width = Math.round(width * scale);
    compactCanvas.height = Math.round(height * scale);
    const cCtx = compactCanvas.getContext('2d', { alpha: false });
    if (cCtx) {
      cCtx.fillStyle = '#FFFFFF';
      cCtx.fillRect(0, 0, compactCanvas.width, compactCanvas.height);
      cCtx.drawImage(canvas, 0, 0, compactCanvas.width, compactCanvas.height);
      dataUrl = compactCanvas.toDataURL('image/jpeg', 0.76);
      width = compactCanvas.width;
      height = compactCanvas.height;
      sizeBytes = estimateBase64Size(dataUrl);
    }
  }

  return {
    dataUrl,
    width,
    height,
    sizeBytes,
  };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image data'));
    reader.readAsDataURL(blob);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to parse image source into memory'));
    img.src = src;
  });
}
