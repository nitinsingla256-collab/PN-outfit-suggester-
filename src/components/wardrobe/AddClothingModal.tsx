/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ClothingCategory, ClothingFit, ClothingFormality, Season } from '../../types';
import { useApp } from '../../context/AppContext';
import { aiStylistService } from '../../services/aiStylistService';
import {
  Sparkles,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Wand2,
  Edit3,
  Check,
  ArrowRight,
  Layers,
  Palette,
  Sparkle,
} from 'lucide-react';

const CATEGORIES: ClothingCategory[] = [
  'Tops',
  'Bottoms',
  'Outerwear',
  'Dresses',
  'Footwear',
  'Bags',
  'Accessories',
  'Jewelry',
  'Activewear',
  'Formalwear',
];

const CLOTHING_TYPES = [
  'Shirt',
  'T-shirt',
  'Polo',
  'Sweater',
  'Hoodie',
  'Cardigan',
  'Blazer',
  'Jacket',
  'Coat',
  'Trench Coat',
  'Trousers',
  'Jeans',
  'Chinos',
  'Shorts',
  'Skirt',
  'Dress',
  'Shoes',
  'Boots',
  'Loafers',
  'Sneakers',
  'Sandals',
  'Belt',
  'Watch',
  'Bag',
  'Scarf',
  'Accessory',
];

const COLORS = [
  'Blue',
  'Navy',
  'Black',
  'White',
  'Charcoal',
  'Grey',
  'Beige',
  'Camel',
  'Brown',
  'Olive',
  'Burgundy',
  'Emerald',
  'Sage',
  'Terracotta',
  'Ivory',
  'Khaki',
  'Pastel Pink',
];

const PATTERNS = [
  'Solid',
  'Striped',
  'Plaid',
  'Checked',
  'Floral',
  'Houndstooth',
  'Textured',
  'Graphic',
  'Polka Dot',
];

const STYLES = [
  'Casual',
  'Smart Casual',
  'Formal',
  'Minimal',
  'Classic',
  'Streetwear',
  'Old money',
  'Edgy',
  'Romantic',
];

const FORMALITIES: ClothingFormality[] = [
  'Casual',
  'Smart Casual',
  'Business Casual',
  'Formal',
  'Black Tie',
];

const SEASONS: Season[] = ['All-Season', 'Spring', 'Summer', 'Autumn', 'Winter'];

export function AddClothingModal() {
  const { isAddClothingModalOpen, setIsAddClothingModalOpen, addWardrobeItem, showToast } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal Step State: 'upload' | 'ai_review' | 'edit_details'
  const [currentStep, setCurrentStep] = useState<'upload' | 'ai_review' | 'edit_details'>('upload');
  const [uploadMode, setUploadMode] = useState<'single' | 'multiple'>('single');

  // Garment Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('Tops');
  const [type, setType] = useState('Shirt');
  const [color, setColor] = useState('Blue');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [pattern, setPattern] = useState('Solid');
  const [material, setMaterial] = useState('Denim (Likely)');
  const [style, setStyle] = useState('Casual');
  const [formality, setFormality] = useState<ClothingFormality>('Casual');
  const [brand, setBrand] = useState('');
  const [fit, setFit] = useState<ClothingFit>('Regular');
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>(['All-Season']);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>(['Casual', 'Work']);
  const [careInstructions, setCareInstructions] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [aiStylingNote, setAiStylingNote] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleSeason = (s: Season) => {
    if (selectedSeasons.includes(s)) {
      if (selectedSeasons.length > 1) {
        setSelectedSeasons(selectedSeasons.filter(item => item !== s));
      }
    } else {
      setSelectedSeasons([...selectedSeasons, s]);
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('Tops');
    setType('Shirt');
    setColor('Blue');
    setSecondaryColor('');
    setPattern('Solid');
    setMaterial('Denim (Likely)');
    setStyle('Casual');
    setFormality('Casual');
    setBrand('');
    setFit('Regular');
    setSelectedSeasons(['All-Season']);
    setSelectedOccasions(['Casual', 'Work']);
    setCareInstructions('');
    setTagInput('');
    setImageUrl('');
    setImageBase64(null);
    setAiConfidence(null);
    setAiStylingNote(null);
    setCurrentStep('upload');
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    setIsAddClothingModalOpen(false);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast({
        title: 'Invalid File',
        description: 'Please select an image file (JPG, PNG, WebP).',
        type: 'error',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      setImageBase64(result);
      setImageUrl(result);
      setErrors(prev => ({ ...prev, imageUrl: '' }));
      setCurrentStep('ai_review');
      await triggerAIAnalysis({ base64: result, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const triggerAIAnalysis = async (customParams?: { base64?: string; mimeType?: string }) => {
    try {
      setIsAnalyzing(true);
      const res = await aiStylistService.analyzeGarment({
        imageBase64: customParams?.base64 || (imageBase64 ? imageBase64 : undefined),
        imageUrl: !imageBase64 && imageUrl.startsWith('http') ? imageUrl : undefined,
        mimeType: customParams?.mimeType || 'image/jpeg',
        hint: name || undefined,
      });

      if (res) {
        setName(res.name || 'Classic Garment Piece');
        if (res.category) setCategory(res.category);
        if (res.type) setType(res.type);
        else if (res.subcategory) setType(res.subcategory);
        if (res.color) setColor(res.color);
        if (res.secondaryColor) setSecondaryColor(res.secondaryColor);
        if (res.pattern) setPattern(res.pattern);
        if (res.material) setMaterial(res.material);
        if (res.style) setStyle(res.style);
        if (res.formality) setFormality(res.formality as ClothingFormality);
        if (res.fit) setFit(res.fit);
        if (res.season && res.season.length > 0) setSelectedSeasons(res.season);
        if (res.occasion && res.occasion.length > 0) setSelectedOccasions(res.occasion);
        if (res.tags && res.tags.length > 0) setTagInput(res.tags.join(', '));
        if (res.careInstructions) setCareInstructions(res.careInstructions);
        if (res.stylingNote) setAiStylingNote(res.stylingNote);
        if (res.confidence) setAiConfidence(res.confidence);

        showToast({
          title: 'AI Analysis Complete',
          description: `Identified as ${res.category} · ${res.type || 'Piece'} with ${res.confidence}% match.`,
          type: 'success',
        });
      }
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'Auto-detection Alert',
        description: 'Auto-detection applied default attributes. You can edit any detail.',
        type: 'info',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToWardrobe = async () => {
    if (!name.trim()) {
      showToast({
        title: 'Name Required',
        description: 'Please give your clothing piece a name.',
        type: 'error',
      });
      return;
    }
    if (!imageUrl.trim()) {
      showToast({
        title: 'Image Required',
        description: 'Please upload an image for this piece.',
        type: 'error',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const parsedTags = tagInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await addWardrobeItem({
        name: name.trim(),
        category,
        type: type.trim(),
        subcategory: type.trim(),
        color: color.trim(),
        secondaryColor: secondaryColor.trim() || undefined,
        pattern: pattern.trim(),
        material: material.trim() || undefined,
        style: style.trim(),
        formality,
        brand: brand.trim() || undefined,
        fit,
        season: selectedSeasons,
        occasion: selectedOccasions,
        tags: parsedTags.length > 0 ? parsedTags : ['Wardrobe Essential', category],
        imageUrl: imageUrl.trim(),
        isFavorite: false,
        careInstructions: careInstructions.trim() || undefined,
      });

      showToast({
        title: 'Added to Wardrobe',
        description: `"${name}" has been saved to your digital wardrobe.`,
        type: 'success',
      });

      handleClose();
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'Failed to Save',
        description: err.message || 'Could not save item to wardrobe.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isAddClothingModalOpen}
      onClose={handleClose}
      title="Add New Piece"
      subtitle="Upload your clothes and let AI automatically identify, categorize and organize them."
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Upload Mode Selector (Single vs Multiple) */}
        {currentStep === 'upload' && (
          <div className="flex items-center justify-center p-1 bg-slate-100 dark:bg-white rounded-xl max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => setUploadMode('single')}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
                uploadMode === 'single'
                  ? 'bg-white dark:bg-gray-100 text-indigo-600 dark:text-emerald-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-gray-600'
              }`}
            >
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('multiple')}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
                uploadMode === 'multiple'
                  ? 'bg-white dark:bg-gray-100 text-indigo-600 dark:text-emerald-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-gray-600'
              }`}
            >
              Multiple Upload
            </button>
          </div>
        )}

        {/* STEP 1: INITIAL UPLOAD DROPZONE */}
        {currentStep === 'upload' && (
          <div className="space-y-4">
            <div
              onDragOver={e => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                isDragOver
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                  : 'border-slate-200 dark:border-gray-200 bg-slate-50/50 dark:bg-white/40 hover:border-indigo-300 dark:hover:border-gray-300 hover:bg-slate-50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />

              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-emerald-500 flex items-center justify-center mb-4 shadow-sm">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h4 className="text-base font-semibold text-slate-900 dark:text-gray-900 mb-1">
                Drag and drop your image here
              </h4>
              <p className="text-xs text-slate-500 dark:text-gray-600 mb-4">
                Supported formats: JPG, PNG, WEBP • Max size: 20MB
              </p>

              <Button
                type="button"
                variant="primary"
                size="md"
                className="rounded-xl px-5"
                onClick={e => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose Image
              </Button>
            </div>

            {/* URL Fallback */}
            <div className="pt-2">
              <div className="text-xs text-slate-400 dark:text-gray-500 text-center mb-2 font-medium">
                — OR PASTE IMAGE URL —
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/clothing-photo.jpg"
                  value={imageUrl}
                  onChange={e => {
                    setImageUrl(e.target.value);
                    setImageBase64(null);
                  }}
                  leftIcon={<ImageIcon className="w-4 h-4 text-slate-400" />}
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!imageUrl.trim()}
                  onClick={() => {
                    if (imageUrl.trim()) {
                      setCurrentStep('ai_review');
                      triggerAIAnalysis();
                    }
                  }}
                >
                  Analyze
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: AI IDENTIFICATION CONFIRMATION (Matches Reference Image) */}
        {currentStep === 'ai_review' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Large Image Preview */}
              <div className="md:col-span-5 space-y-3">
                <div className="relative rounded-3xl overflow-hidden bg-slate-100 dark:bg-white border border-slate-200 dark:border-gray-200 aspect-[3/4] shadow-sm flex items-center justify-center group">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={name || 'Garment Visual'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-slate-400 flex flex-col items-center">
                      <ImageIcon className="w-12 h-12 mb-2 stroke-1" />
                      <span className="text-xs">No image loaded</span>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-gray-900 p-4 text-center">
                      <Sparkles className="w-8 h-8 text-indigo-300 animate-spin mb-3" />
                      <p className="text-sm font-medium">AI Analyzing Garment...</p>
                      <p className="text-xs text-slate-300 mt-1">Identifying cut, material, and colorway</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerAIAnalysis()}
                    disabled={isAnalyzing}
                    className="text-xs font-medium text-slate-500 dark:text-gray-600 hover:text-slate-900 flex items-center gap-1"
                  >
                    <Wand2 className="w-3 h-3" />
                    Re-Analyze
                  </button>
                </div>
              </div>

              {/* Right Column: AI Identification Table */}
              <div className="md:col-span-7 bg-white dark:bg-white border border-slate-200 dark:border-gray-200 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-emerald-500">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-gray-900">
                      AI Identification
                    </h3>
                  </div>

                  {aiConfidence && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {aiConfidence}% Confidence
                    </span>
                  )}
                </div>

                {/* Detected Garment Name */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                    Garment Name
                  </label>
                  <div className="text-lg font-bold text-slate-900 dark:text-gray-900 font-editorial mt-0.5">
                    {name || 'Classic Denim Shirt'}
                  </div>
                </div>

                {/* Attributes Grid (Matches Reference Layout) */}
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
                  <div>
                    <span className="text-slate-400 dark:text-gray-500 font-medium">Category</span>
                    <div className="font-semibold text-slate-800 dark:text-gray-800 mt-0.5">{category}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-gray-500 font-medium">Type</span>
                    <div className="font-semibold text-slate-800 dark:text-gray-800 mt-0.5">{type || 'Shirt'}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-gray-500 font-medium">Color</span>
                    <div className="font-semibold text-slate-800 dark:text-gray-800 mt-0.5 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                      {color}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-gray-500 font-medium">Pattern</span>
                    <div className="font-semibold text-slate-800 dark:text-gray-800 mt-0.5">{pattern || 'Solid'}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-gray-500 font-medium">Material</span>
                    <div className="font-semibold text-slate-800 dark:text-gray-800 mt-0.5">{material || 'Denim (Likely)'}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-gray-500 font-medium">Style</span>
                    <div className="font-semibold text-slate-800 dark:text-gray-800 mt-0.5">{style || 'Casual'}</div>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-gray-500 font-medium">Season</span>
                    <div className="font-semibold text-slate-800 dark:text-gray-800 mt-0.5">
                      {selectedSeasons.join(', ')}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 dark:text-gray-500 font-medium">Formality</span>
                    <div className="font-semibold text-slate-800 dark:text-gray-800 mt-0.5">{formality}</div>
                  </div>
                </div>

                {/* AI Stylist Note */}
                {aiStylingNote && (
                  <div className="p-3 bg-slate-50 dark:bg-gray-100/60 rounded-xl text-xs text-slate-600 dark:text-gray-600 border border-slate-100 dark:border-gray-200">
                    <span className="font-semibold text-slate-900 dark:text-gray-800">Styling Note: </span>
                    {aiStylingNote}
                  </div>
                )}

                {/* Does this look right? */}
                <div className="pt-2 border-t border-slate-100 dark:border-gray-200">
                  <div className="text-xs font-semibold text-slate-700 dark:text-gray-700 mb-3 text-center sm:text-left">
                    Does this look right?
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Button
                      type="button"
                      variant="primary"
                      className="w-full sm:w-auto flex-1 rounded-xl"
                      isLoading={isSubmitting}
                      onClick={handleSaveToWardrobe}
                      leftIcon={<Check className="w-4 h-4" />}
                    >
                      Confirm & Save
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full sm:w-auto rounded-xl"
                      onClick={() => setCurrentStep('edit_details')}
                      leftIcon={<Edit3 className="w-4 h-4" />}
                    >
                      Edit Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: FULL EDITABLE DETAILS */}
        {currentStep === 'edit_details' && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-gray-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Customizing Metadata
              </span>
              <button
                type="button"
                onClick={() => setCurrentStep('ai_review')}
                className="text-xs text-slate-500 hover:text-slate-900 dark:text-gray-600"
              >
                Back to Preview
              </button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Garment Title *"
                placeholder="e.g. Classic Denim Shirt"
                value={name}
                onChange={e => setName(e.target.value)}
              />
              <Input
                label="Brand / Maison"
                placeholder="e.g. Levi's, Ralph Lauren, Zara"
                value={brand}
                onChange={e => setBrand(e.target.value)}
              />
            </div>

            {/* Category & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Category"
                value={category}
                onChange={e => setCategory(e.target.value as ClothingCategory)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>

              <Select
                label="Clothing Type"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                {CLOTHING_TYPES.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>

              <Select
                label="Primary Color"
                value={color}
                onChange={e => setColor(e.target.value)}
              >
                {COLORS.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>

            {/* Pattern, Material, Style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Select
                label="Pattern"
                value={pattern}
                onChange={e => setPattern(e.target.value)}
              >
                {PATTERNS.map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>

              <Input
                label="Material"
                placeholder="e.g. Denim, 100% Cotton, Silk"
                value={material}
                onChange={e => setMaterial(e.target.value)}
              />

              <Select
                label="Style Aesthetic"
                value={style}
                onChange={e => setStyle(e.target.value)}
              >
                {STYLES.map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>

            {/* Formality & Fit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Formality Level"
                value={formality}
                onChange={e => setFormality(e.target.value as ClothingFormality)}
              >
                {FORMALITIES.map(f => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </Select>

              <Select
                label="Fit Profile"
                value={fit}
                onChange={e => setFit(e.target.value as ClothingFit)}
              >
                <option value="Regular">Regular Fit</option>
                <option value="Slim">Slim Fit</option>
                <option value="Tailored">Tailored Fit</option>
                <option value="Relaxed">Relaxed Fit</option>
                <option value="Oversized">Oversized Fit</option>
              </Select>
            </div>

            {/* Seasons Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-gray-700">
                Season Suitability
              </label>
              <div className="flex flex-wrap gap-2">
                {SEASONS.map(s => {
                  const isSelected = selectedSeasons.includes(s);
                  return (
                    <button
                      type="button"
                      key={s}
                      onClick={() => toggleSeason(s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-gray-50 dark:border-gray-300 dark:text-gray-600 hover:bg-slate-100'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags & Care Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Style Tags (Comma separated)"
                placeholder="Denim, Casual Friday, Layering"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
              />
              <Input
                label="Care Instructions"
                placeholder="Machine wash cold, air dry"
                value={careInstructions}
                onChange={e => setCareInstructions(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-gray-200">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentStep('ai_review')}
              >
                Back to Review
              </Button>

              <Button
                type="button"
                variant="primary"
                isLoading={isSubmitting}
                onClick={handleSaveToWardrobe}
                className="rounded-xl px-6"
              >
                Save to Wardrobe
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
