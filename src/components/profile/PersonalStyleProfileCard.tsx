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
import { LiveCamera } from '../ui/LiveCamera';
import {
  Sparkles, Camera, Upload, Palette, Check, ShieldCheck, 
  RefreshCw, Sliders, ChevronDown, ChevronUp, Info,
  ArrowRight, ArrowLeft
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
  'Smart Casual', 'Old money', 'Minimal', 'Classic', 'Casual', 'Streetwear', 'Formal', 'Sporty', 'Edgy'
];

type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

export function PersonalStyleProfileCard() {
  const { user, updateUser, showToast } = useApp();
  const [step, setStep] = useState<OnboardingStep>(1);

  const existingProfile: PersonalStyleProfile = user.profile || {
    hasPhotoAnalyzed: false,
    preferredFit: 'Tailored',
    preferredColors: [],
    dislikedColors: [],
    preferredStyles: [],
    defaultFormality: 'Smart Casual',
    lifestyleOccasions: ['Work', 'Dinner', 'Casual'],
    isCompleted: false,
  };

  const [profile, setProfile] = useState<PersonalStyleProfile>(existingProfile);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const nextStep = () => setStep((s) => Math.min(s + 1, 6) as OnboardingStep);
  const prevStep = () => setStep((s) => Math.max(s - 1, 1) as OnboardingStep);

  const handlePhotoCapture = async (base64Data: string) => {
    setIsAnalyzingPhoto(true);
    try {
      const analysis: VisualStyleAnalysis = await aiStylistService.analyzeStylePhoto(
        base64Data,
        'image/jpeg'
      );
      setProfile(prev => ({
        ...prev,
        visualAnalysis: {
          ...analysis,
          photoThumbnail: base64Data.length < 300000 ? base64Data : undefined,
          photoUploadedAt: new Date().toISOString(),
        },
        hasPhotoAnalyzed: true,
      }));
      showToast({
        title: 'Analysis Complete',
        description: 'Review your visual style profile.',
        type: 'success',
      });
      nextStep();
    } catch (err: any) {
      showToast({
        title: 'Analysis Failed',
        description: err.message || 'Could not analyze image. Try again.',
        type: 'error',
      });
    } finally {
      setIsAnalyzingPhoto(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast({ title: 'Invalid File', description: 'Please select an image.', type: 'error' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      handlePhotoCapture(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveFinal = async () => {
    setIsSaving(true);
    try {
      const updated: PersonalStyleProfile = {
        ...profile,
        isCompleted: true,
        lastConfirmedAt: new Date().toISOString(),
      };
      await updateUser({ profile: updated });
      showToast({
        title: 'Profile Saved',
        description: 'Your personal style profile is complete.',
        type: 'success',
      });
    } catch (e: any) {
      showToast({
        title: 'Save Failed',
        description: e.message || 'Could not save profile.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleColorPreference = (color: string) => {
    setProfile(prev => {
      const exists = prev.preferredColors.includes(color);
      return {
        ...prev,
        preferredColors: exists ? prev.preferredColors.filter(c => c !== color) : [...prev.preferredColors, color]
      };
    });
  };

  const toggleStyle = (styleName: string) => {
    setProfile(prev => {
      const exists = prev.preferredStyles.includes(styleName);
      return {
        ...prev,
        preferredStyles: exists ? prev.preferredStyles.filter(s => s !== styleName) : [...prev.preferredStyles, styleName]
      };
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Progress Header */}
      <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 p-4 sm:px-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Step 0{step} of 06</span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{Math.round((step/6)*100)}% Complete</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-500" style={{ width: `${(step/6)*100}%` }} />
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {step === 1 && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold font-editorial text-slate-900 dark:text-white">About You</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Provide basic details so we can tailor fit and sizing accurately.</p>
            </div>
            
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-mono">Age</label>
              <input
                type="number"
                min="13" max="120"
                value={profile.age || ''}
                onChange={e => setProfile({...profile, age: parseInt(e.target.value) || undefined})}
                placeholder="e.g. 28"
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-mono">Styling Basis (Gender)</label>
              <div className="flex flex-wrap gap-2">
                {['Men', 'Women', 'Non-binary', 'Prefer not to say'].map(g => (
                  <button
                    key={g}
                    onClick={() => setProfile({...profile, gender: g as any})}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      profile.gender === g
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-mono">Height (cm)</label>
                <input
                  type="number"
                  min="100" max="250"
                  value={profile.heightCm || ''}
                  onChange={e => setProfile({...profile, heightCm: parseInt(e.target.value) || undefined})}
                  placeholder="e.g. 175"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-mono">Weight (kg)</label>
                <input
                  type="number"
                  min="30" max="250"
                  value={profile.weightKg || ''}
                  onChange={e => setProfile({...profile, weightKg: parseInt(e.target.value) || undefined})}
                  placeholder="e.g. 70"
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-6">
              <Button 
                variant="primary" 
                className="w-full py-3 rounded-2xl justify-center"
                disabled={!profile.age || !profile.gender || !profile.heightCm || !profile.weightKg}
                onClick={nextStep}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold font-editorial text-slate-900 dark:text-white">Live Photo</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Take a clear photo so PN can personalize your recommendations based on undertone and contrast.</p>
            </div>
            
            <LiveCamera 
              onCapture={handlePhotoCapture} 
              onUpload={handlePhotoUpload} 
              isAnalyzing={isAnalyzingPhoto} 
            />

            <div className="pt-6">
              <Button variant="outline" className="w-full py-3 rounded-2xl justify-center" onClick={prevStep} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back
              </Button>
            </div>
          </div>
        )}

        {step === 3 && profile.visualAnalysis && (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold font-editorial text-slate-900 dark:text-white">Your Visual Profile</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Review the AI visual analysis. You can adjust any details that don't look quite right.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-mono">Face Shape</label>
                <select
                  value={profile.visualAnalysis.faceShape}
                  onChange={(e) => setProfile({
                    ...profile,
                    visualAnalysis: { ...profile.visualAnalysis!, faceShape: e.target.value as FaceShape }
                  })}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {FACE_SHAPES.map(s => <option key={s} value={s} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{s}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-mono">Skin Undertone</label>
                <select
                  value={profile.visualAnalysis.skinTone}
                  onChange={(e) => setProfile({
                    ...profile,
                    visualAnalysis: { ...profile.visualAnalysis!, skinTone: e.target.value as SkinToneUndertone }
                  })}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {SKIN_TONES.map(s => <option key={s} value={s} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{s}</option>)}
                </select>
              </div>

            <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-mono">Contrast Level</label>
                <select
                  value={profile.visualAnalysis.contrastLevel}
                  onChange={(e) => setProfile({
                    ...profile,
                    visualAnalysis: { ...profile.visualAnalysis!, contrastLevel: e.target.value as any }
                  })}
                  className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {['High', 'Medium', 'Low', 'Soft'].map(s => <option key={s} value={s} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button variant="outline" className="flex-1 py-3 rounded-2xl justify-center" onClick={prevStep}>Back</Button>
              <Button variant="primary" className="flex-1 py-3 rounded-2xl justify-center" onClick={nextStep}>Confirm Analysis</Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8 max-w-xl mx-auto">
              <h2 className="text-2xl font-bold font-editorial text-slate-900 dark:text-white">Your Style</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Select the aesthetics that match how you want to dress.</p>
            </div>
            
            <StyleEducationGrid
              selectedStyles={profile.preferredStyles}
              onToggleStyle={toggleStyle}
            />

            <div className="flex gap-3 pt-6 max-w-xl mx-auto">
              <Button variant="outline" className="flex-1 py-3 rounded-2xl justify-center" onClick={prevStep}>Back</Button>
              <Button 
                variant="primary" 
                className="flex-1 py-3 rounded-2xl justify-center" 
                onClick={nextStep}
                disabled={profile.preferredStyles.length === 0}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8 max-w-xl mx-auto">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-2xl font-bold font-editorial text-slate-900 dark:text-white">Fit & Preferences</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Refine your sizing and color palette.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-mono">Preferred Fit</label>
              <div className="flex flex-wrap gap-2">
                {FITS.map(fit => (
                  <button
                    key={fit}
                    onClick={() => setProfile({...profile, preferredFit: fit})}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      profile.preferredFit === fit
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {fit}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-mono">Sizing</label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Top</span>
                  <select
                    value={profile.topSize || ''}
                    onChange={(e) => setProfile({...profile, topSize: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Select</option>
                    {TOP_SIZES.map(s => <option key={s} value={s} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{s}</option>)}
                  </select>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Bottom</span>
                  <select
                    value={profile.bottomSize || ''}
                    onChange={(e) => setProfile({...profile, bottomSize: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Select</option>
                    {BOTTOM_SIZES.map(s => <option key={s} value={s} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{s}</option>)}
                  </select>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Shoe</span>
                  <select
                    value={profile.shoeSize || ''}
                    onChange={(e) => setProfile({...profile, shoeSize: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">Select</option>
                    {SHOE_SIZES.map(s => <option key={s} value={s} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-mono">Color Preferences</label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_COLORS.map(color => {
                  const isSelected = profile.preferredColors.includes(color);
                  return (
                    <button
                      key={color}
                      onClick={() => toggleColorPreference(color)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 pt-6">
              <Button variant="outline" className="flex-1 py-3 rounded-2xl justify-center" onClick={prevStep}>Back</Button>
              <Button 
                variant="primary" 
                className="flex-1 py-3 rounded-2xl justify-center" 
                onClick={nextStep}
                disabled={!profile.topSize || !profile.bottomSize || !profile.shoeSize || profile.preferredColors.length === 0}
              >
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6 max-w-xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-100 dark:border-emerald-800">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold font-editorial text-slate-900 dark:text-white">Ready to Style</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your profile is complete. PN will now use these validated characteristics, precise fits, and visual analysis to generate accurate styling recommendations.
            </p>
            
            <div className="pt-8 flex gap-3">
              <Button variant="outline" className="flex-1 py-3 rounded-2xl justify-center" onClick={prevStep}>Review</Button>
              <Button 
                variant="primary" 
                className="flex-1 py-3 rounded-2xl justify-center shadow-md bg-emerald-600 hover:bg-emerald-700 text-white" 
                onClick={handleSaveFinal}
                isLoading={isSaving}
              >
                Complete Profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
