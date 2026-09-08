import React, { useState, useRef } from 'react';
import { Upload, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export interface ExtractedGarment {
  name: string;
  category: string;
  subcategory: string;
  color: string;
  secondaryColor?: string;
  pattern: string;
  material: string;
  fit: string;
  formality: string;
  season: string[];
  tags: string[];
}

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setError(null);
      analyzeGarmentImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const analyzeGarmentImage = async (base64Image: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const token = localStorage.getItem('paurvi_auth_token') || localStorage.getItem('token');
      const response = await fetch('/api/gemini/analyze-garment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed with status ${response.status}`);
      }

      const data: ExtractedGarment = await response.json();
      onAnalysisComplete(data, base64Image);
    } catch (err) {
      setError('Failed to analyze image. Please ensure the clothing item is clearly visible.');
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
        <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
