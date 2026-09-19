import React, { useState, useRef } from 'react';
import { Upload, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { ExtractedGarment, ExtractedGarmentSchema } from '../../schemas/garmentSchema';
import { authService } from '../../services/authService';

interface GarmentAnalyzerProps {
  onAnalysisComplete: (garment: ExtractedGarment, imageBase64: string) => void;
  onCancel?: () => void;
}

export const GarmentAnalyzer: React.FC<GarmentAnalyzerProps> = ({
  onAnalysisComplete,
  onCancel,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const optimizeImageForVision = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const MAX_DIM = 1200;
          let width = img.width;
          let height = img.height;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.88));
            return;
          }
          resolve(result);
        };
        img.onerror = () => resolve(result);
        img.src = result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    try {
      const optimizedBase64 = await optimizeImageForVision(file);
      if (!optimizedBase64) {
        setError('Could not process the selected image.');
        return;
      }
      setImagePreview(optimizedBase64);
      setError(null);
      analyzeGarmentImage(optimizedBase64);
    } catch (_err) {
      setError('Failed to prepare image for analysis.');
    }
  };

  const handleManualEntry = () => {
    const defaultGarment: ExtractedGarment = {
      name: 'Custom Wardrobe Piece',
      category: 'Outerwear',
      subcategory: 'Jacket',
      color: 'Black',
      secondaryColor: 'None',
      pattern: 'Solid',
      material: 'Leather',
      fit: 'Regular',
      formality: 'Casual',
      season: ['Spring', 'Summer', 'Fall', 'Winter'],
      styleTags: ['wardrobe-essential'],
    };
    onAnalysisComplete(defaultGarment, imagePreview || '');
  };

  const analyzeGarmentImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const mimeMatch = base64Image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9\-\+\.]+);base64,/i);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

      const token = authService.getToken();
      const response = await fetch('/api/gemini/analyze-garment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ image: base64Image, mimeType }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis failed with status ${response.status}`);
      }

      const jsonResponse = await response.json();
      const rawData = jsonResponse.analysis || jsonResponse;
      
      // Map 'tags' to 'styleTags' if backend returns 'tags'
      if (rawData.tags && !rawData.styleTags) {
        rawData.styleTags = rawData.tags;
      }

      const parseResult = ExtractedGarmentSchema.safeParse(rawData);
      if (parseResult.success) {
        onAnalysisComplete(parseResult.data, base64Image);
      } else {
        // Construct fallback using as much rawData as possible
        const fallbackGarment: ExtractedGarment = {
          name: rawData.name || 'Wardrobe Item',
          category: rawData.category || 'Outerwear',
          subcategory: rawData.subcategory || 'Jacket',
          color: rawData.color || 'Black',
          secondaryColor: rawData.secondaryColor || 'None',
          pattern: 'Solid',
          material: rawData.material || 'Leather',
          fit: 'Regular',
          formality: 'Casual',
          season: Array.isArray(rawData.season) && rawData.season.length ? rawData.season : ['Fall', 'Winter'],
          styleTags: Array.isArray(rawData.tags) ? rawData.tags : ['essential'],
        };
        onAnalysisComplete(fallbackGarment, base64Image);
      }
    } catch (err: any) {
      console.error('Garment analyzer error:', err);
      setError(err?.message || 'Failed to analyze image. You can retry or enter the garment details manually.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
            Vision Tagging Engine
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Upload a photo to extract materials, cut, pattern, and formality tags automatically.
          </p>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {!imagePreview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-2xl p-8 text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-800/30 group"
        >
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">
            Click to upload or drag image here
          </p>
          <p className="text-xs text-slate-400">
            Supports PNG, JPG, or WEBP up to 10MB
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 max-h-72 flex items-center justify-center">
            <img
              src={imagePreview}
              alt="Garment Preview"
              className="object-contain max-h-72 w-full"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                <span className="text-xs font-semibold tracking-wider uppercase">
                  Analyzing Textile & Material Attributes...
                </span>
              </div>
            )}
          </div>

          {!isAnalyzing && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setImagePreview(null);
                  setError(null);
                }}
                className="flex-1 py-2.5 px-4 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Re-upload Photo
              </button>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="py-2.5 px-4 text-xs font-bold rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
          <div className="flex items-start gap-2.5 text-amber-900 dark:text-amber-200 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div className="space-y-1">
              <span className="font-bold">{error}</span>
              {error.includes('GEMINI_API_KEY') && (
                <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  To enable live AI vision scanning, add <code className="px-1 py-0.5 rounded bg-amber-200/60 dark:bg-amber-900/80 font-mono text-[10px]">GEMINI_API_KEY</code> in your EdgeOne Project Settings → Environment Variables. You can also proceed immediately below using this photo.
                </p>
              )}
            </div>
          </div>
          {imagePreview && !isAnalyzing && (
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleManualEntry}
                className="flex-1 py-2.5 px-4 text-xs font-bold rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
              >
                Continue with this Photo →
              </button>
              <button
                type="button"
                onClick={() => analyzeGarmentImage(imagePreview)}
                className="py-2.5 px-3 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
