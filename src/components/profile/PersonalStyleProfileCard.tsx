/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { aiStylistService } from '../../services/aiStylistService';
import {
  PersonalStyleProfile,
  VisualStyleAnalysis,
  FaceShape,
  SkinToneUndertone,
} from '../../types';
import { Button } from '../ui/Button';
import { StyleEducationGrid } from '../ui/StyleEducationGrid';
import {
  Sparkles,
  Camera,
  Upload,
  Palette,
  Check,
  ShieldCheck,
  RefreshCw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';

const FACE_SHAPES: FaceShape[] = ['Oval', 'Square', 'Round', 'Heart', 'Oblong', 'Diamond'];
const SKIN_TONES: SkinToneUndertone[] = ['Warm', 'Cool', 'Neutral', 'Olive', 'Deep Warm', 'Fair Cool'];
const FITS = ['Relaxed', 'Tailored', 'Oversized', 'Slim', 'Classic'] as const;
const TOP_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom'];
const BOTTOM_SIZES = ['28', '30', '32', '34', '36', '38', '40', 'Custom'];
const SHOE_SIZES = ['39', '40', '41', '42', '43', '44', '45', '46'];
const POPULAR_COLORS = [
  'Navy', 'Charcoal', 'Black', 'White', 'Camel', 'Ivory', 'Olive', 'Burgundy', 
  'Sage', 'Brown', 'Beige', 'Sky Blue', 'Grey', 'Terracotta', 'Forest Green'
];
const POPULAR_STYLES = [
  'Smart Casual', 'Old money', 'Minimal', 'Classic', 'Casual', 'Streetwear', 'Formal', 'Edgy'
];

export function PersonalStyleProfileCard() {
  const { user, updateUser, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingProfile: PersonalStyleProfile = user.profile || {
    hasPhotoAnalyzed: false,
    preferredFit: 'Tailored',
    preferredColors: ['Navy', 'Charcoal', 'Camel', 'Ivory'],
    dislikedColors: [],
    preferredStyles: ['Smart Casual', 'Minimal'],
    defaultFormality: 'Smart Casual',
    lifestyleOccasions: ['Work', 'Dinner', 'Casual'],
    isCompleted: false,
  };

  const [profile, setProfile] = useState<PersonalStyleProfile>(existingProfile);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [showManualTuning, setShowManualTuning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // File upload handler
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast({
        title: 'Invalid File',
        description: 'Please select a valid image file (JPEG, PNG, or WebP).',
        type: 'error',
      });
      return;
    }

    setIsAnalyzingPhoto(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const analysis: VisualStyleAnalysis = await aiStylistService.analyzeStylePhoto(
            base64Data,
            file.type
          );

          const updated: PersonalStyleProfile = {
            ...profile,
            visualAnalysis: {
              ...analysis,
              photoThumbnail: base64Data.length < 300000 ? base64Data : undefined,
              photoUploadedAt: new Date().toISOString(),
            },
            hasPhotoAnalyzed: true,
            isCompleted: true,
            lastConfirmedAt: new Date().toISOString(),
          };

          setProfile(updated);
          await updateUser({ profile: updated });

          showToast({
            title: 'Visual Analysis Complete',
            description: `Calibrated for ${analysis.faceShape} face shape and ${analysis.skinTone} undertone.`,
            type: 'success',
          });
        } catch (err: any) {
          showToast({
            title: 'Analysis Deferred',
            description: err.message || 'Could not analyze image. Default palette applied.',
            type: 'error',
          });
        } finally {
          setIsAnalyzingPhoto(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsAnalyzingPhoto(false);
    }
  };

  const handleSaveManual = async () => {
    setIsSaving(true);
    try {
      const updated: PersonalStyleProfile = {
        ...profile,
        isCompleted: true,
        lastConfirmedAt: new Date().toISOString(),
      };
      setProfile(updated);
      await updateUser({ profile: updated });
    } catch (e: any) {
      showToast({
        title: 'Save Failed',
        description: e.message || 'Could not update personal profile.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleColorPreference = (color: string) => {
    setProfile(prev => {
      const exists = prev.preferredColors.includes(color);
      const updated = exists
        ? prev.preferredColors.filter(c => c !== color)
        : [...prev.preferredColors, color];
      // remove from disliked if present
      const cleanedDisliked = prev.dislikedColors.filter(c => c !== color);
      return { ...prev, preferredColors: updated, dislikedColors: cleanedDisliked };
    });
  };

  const toggleDislikedColor = (color: string) => {
    setProfile(prev => {
      const exists = prev.dislikedColors.includes(color);
      const updated = exists
        ? prev.dislikedColors.filter(c => c !== color)
        : [...prev.dislikedColors, color];
      // remove from preferred if present
      const cleanedPreferred = prev.preferredColors.filter(c => c !== color);
      return { ...prev, dislikedColors: updated, preferredColors: cleanedPreferred };
    });
  };

  const toggleStyle = (style: string) => {
    setProfile(prev => {
      const exists = prev.preferredStyles.includes(style);
      const updated = exists
        ? prev.preferredStyles.filter(s => s !== style)
        : [...prev.preferredStyles, style];
      return { ...prev, preferredStyles: updated };
    });
  };

  return (
    <div id="personal-style-profile-card" className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-6 md:p-8 bg-linear-to-r from-slate-900 to-slate-800 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wider font-semibold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sartorial Color & Fit Calibration
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight font-editorial">
            Personal Style Profile
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Grounds the AI Stylist in your unique complexion undertones, face geometry for collar cuts, and silhouette preferences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoSelect}
            accept="image/*"
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzingPhoto}
            className="border-slate-600 bg-slate-800/80 text-white hover:bg-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs"
          >
            {isAnalyzingPhoto ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin text-emerald-400" />
                Analyzing Features...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2 text-emerald-400" />
                {profile.hasPhotoAnalyzed ? 'Retake / Change Photo' : 'Upload Style Photo'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 md:p-8 space-y-8">
        {/* Gender Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
              Styling Basis
            </h3>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            How should PN tailor your terminology, fit, and clothing suggestions?
          </p>
          <div className="flex flex-wrap gap-2.5">
            {['Men', 'Women', 'Non-binary', 'Prefer not to say'].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setProfile({ ...profile, gender: g as any })}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  profile.gender === g
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Analysis Results Badge/Banner */}
        {profile.visualAnalysis ? (
          <div className="p-5 md:p-6 rounded-2xl bg-linear-to-br from-slate-50 to-slate-100/70 border border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-editorial">
                    Visual Symmetry & Palette Analysis
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Calibrated from photo · AI Color Theory
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {profile.visualAnalysis.skinTone} Undertone
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                  {profile.visualAnalysis.faceShape} Face Shape
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed italic bg-white/70 p-3.5 rounded-xl border border-slate-200/60">
              "{profile.visualAnalysis.analysisNotes}"
            </p>

            {/* Recommended Palettes & Necklines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Complimentary Color Harmonizers
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.visualAnalysis.recommendedPalettes.map((col, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-slate-700" />
                      {col}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Proportionate Necklines & Collars
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.visualAnalysis.recommendedNecklines.map((cut, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                    >
                      {cut}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 flex flex-col items-center text-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-200/80 text-slate-600 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-800 font-editorial">
                Unlock Personalized Color & Proportion Grounding
              </h4>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                Upload a clear face photo to automatically detect your skin undertone, contrast level, and most flattering collar styles.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs"
            >
              <Upload className="w-3.5 h-3.5 mr-2 text-emerald-600" />
              Upload Style Photo
            </Button>
          </div>
        )}

        {/* Accordion or Section for Manual Tuning */}
        <div>
          <button
            type="button"
            onClick={() => setShowManualTuning(prev => !prev)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-100/70 hover:bg-slate-100 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-slate-800 font-editorial">
                Manual Calibration & Sizing Preferences
              </span>
            </div>
            {showManualTuning ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {showManualTuning && (
            <div className="mt-4 p-5 rounded-2xl bg-white border border-slate-200/90 space-y-6">
              {/* Face Shape & Skin Tone Overrides */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                    Face Shape
                  </label>
                  <select
                    value={profile.visualAnalysis?.faceShape || 'Oval'}
                    onChange={(e) => {
                      const shape = e.target.value as FaceShape;
                      setProfile(prev => ({
                        ...prev,
                        visualAnalysis: {
                          ...(prev.visualAnalysis || {
                            skinTone: 'Neutral',
                            contrastLevel: 'Medium',
                            recommendedPalettes: ['Navy', 'Camel', 'Ivory'],
                            recommendedNecklines: ['Spread collar'],
                            analysisNotes: 'Manually configured face shape profile.',
                          }),
                          faceShape: shape,
                        },
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {FACE_SHAPES.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                    Complexion Undertone
                  </label>
                  <select
                    value={profile.visualAnalysis?.skinTone || 'Neutral'}
                    onChange={(e) => {
                      const tone = e.target.value as SkinToneUndertone;
                      setProfile(prev => ({
                        ...prev,
                        visualAnalysis: {
                          ...(prev.visualAnalysis || {
                            faceShape: 'Oval',
                            contrastLevel: 'Medium',
                            recommendedPalettes: ['Navy', 'Camel', 'Ivory'],
                            recommendedNecklines: ['Spread collar'],
                            analysisNotes: 'Manually configured skin tone profile.',
                          }),
                          skinTone: tone,
                        },
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {SKIN_TONES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Body Proportions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    placeholder="e.g. 175"
                    value={profile.heightCm || ''}
                    onChange={(e) => setProfile(p => ({ ...p, heightCm: parseInt(e.target.value) || undefined }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="200"
                    placeholder="e.g. 70"
                    value={profile.weightKg || ''}
                    onChange={(e) => setProfile(p => ({ ...p, weightKg: parseInt(e.target.value) || undefined }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Fit & Sizing */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                    Preferred Fit
                  </label>
                  <select
                    value={profile.preferredFit}
                    onChange={(e) => setProfile(p => ({ ...p, preferredFit: e.target.value as any }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {FITS.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                    Top Size
                  </label>
                  <select
                    value={profile.topSize || 'M'}
                    onChange={(e) => setProfile(p => ({ ...p, topSize: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {TOP_SIZES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                    Bottom Waist
                  </label>
                  <select
                    value={profile.bottomSize || '32'}
                    onChange={(e) => setProfile(p => ({ ...p, bottomSize: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {BOTTOM_SIZES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
                    Footwear (EU)
                  </label>
                  <select
                    value={profile.shoeSize || '42'}
                    onChange={(e) => setProfile(p => ({ ...p, shoeSize: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {SHOE_SIZES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Preferred Colors */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2 font-mono flex items-center justify-between">
                  <span>Preferred Garment Colors (Prioritize in Looks)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Click to toggle</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_COLORS.map(col => {
                    const isSelected = profile.preferredColors.includes(col);
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => toggleColorPreference(col)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                        {col}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Disliked Colors */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2 font-mono flex items-center justify-between">
                  <span>Colors to Strictly Exclude</span>
                  <span className="text-[10px] text-slate-400 font-normal">Never suggest</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_COLORS.map(col => {
                    const isDisliked = profile.dislikedColors.includes(col);
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => toggleDislikedColor(col)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          isDisliked
                            ? 'bg-rose-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isDisliked && '✕ '}
                        {col}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferred Styles */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-2 font-mono">
                  Preferred Aesthetics
                </label>
                <StyleEducationGrid
                  selectedStyles={profile.preferredStyles}
                  onToggleStyle={toggleStyle}
                />
              </div>

              {/* Save Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSaveManual}
                  disabled={isSaving}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-5 py-2.5 rounded-xl font-semibold shadow-xs"
                >
                  {isSaving ? 'Saving Profile...' : 'Save Calibration Preferences'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
