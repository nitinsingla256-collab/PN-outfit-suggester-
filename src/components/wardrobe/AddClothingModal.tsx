/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ClothingCategory, ClothingFit, ClothingFormality, Season } from '../../types';
import { useApp } from '../../context/AppContext';
import { aiStylistService, GarmentAnalysisResult } from '../../services/aiStylistService';
import { optimizeImage, FALLBACK_GARMENT_IMAGE } from '../../utils/imageOptimizer';
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
  Plus,
  Trash2,
  CheckCheck,
  RefreshCw,
  Eye,
  FolderPlus,
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

export interface BatchGarmentItem {
  id: string;
  name: string;
  imageUrl: string;
  imageBase64: string;
  mimeType: string;
  category: ClothingCategory;
  type: string;
  color: string;
  secondaryColor?: string;
  pattern: string;
  material?: string;
  style: string;
  formality: ClothingFormality;
  brand?: string;
  fit: ClothingFit;
  season: string[];
  occasion: string[];
  tags: string[];
  careInstructions?: string;
  stylingNote?: string;
  confidence?: number;
  status: 'pending' | 'analyzing' | 'ready' | 'saved' | 'error';
}

export function AddClothingModal() {
  const { isAddClothingModalOpen, setIsAddClothingModalOpen, addWardrobeItem, showToast } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  // Modal Step State: 'upload' | 'ai_review' | 'edit_details' | 'batch_workspace'
  const [currentStep, setCurrentStep] = useState<'upload' | 'ai_review' | 'edit_details' | 'batch_workspace'>('upload');
  const [uploadMode, setUploadMode] = useState<'single' | 'multiple'>('single');

  // Single Garment Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory | ''>('');
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [pattern, setPattern] = useState('');
  const [material, setMaterial] = useState('Unknown');
  const [style, setStyle] = useState('');
  const [formality, setFormality] = useState<ClothingFormality | ''>('');
  const [brand, setBrand] = useState('');
  const [fit, setFit] = useState<ClothingFit | ''>('');
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [careInstructions, setCareInstructions] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // Single AI Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);
  const [aiStylingNote, setAiStylingNote] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<'success' | 'needs_confirmation' | null>(null);
  const [hasMultipleItems, setHasMultipleItems] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Batch Multi-Item State (Supports 5+ images at once)
  const [batchItems, setBatchItems] = useState<BatchGarmentItem[]>([]);
  const [isBatchAnalyzing, setIsBatchAnalyzing] = useState(false);
  const [isBatchSaving, setIsBatchSaving] = useState(false);
  const [selectedBatchItemForEdit, setSelectedBatchItemForEdit] = useState<BatchGarmentItem | null>(null);

  const toggleSeason = (s: Season) => {
    if (selectedSeasons.includes(s)) {
      setSelectedSeasons(selectedSeasons.filter(item => item !== s));
    } else {
      setSelectedSeasons([...selectedSeasons, s]);
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('');
    setType('');
    setColor('');
    setSecondaryColor('');
    setPattern('');
    setMaterial('Unknown');
    setStyle('');
    setFormality('');
    setBrand('');
    setFit('');
    setSelectedSeasons([]);
    setSelectedOccasions([]);
    setCareInstructions('');
    setTagInput('');
    setImageUrl('');
    setImageBase64(null);
    setAiConfidence(null);
    setAiStylingNote(null);
    setAnalysisStatus(null);
    setHasMultipleItems(false);
    setCurrentStep('upload');
    setErrors({});
    setBatchItems([]);
    setSelectedBatchItemForEdit(null);
  };

  const handleClose = () => {
    resetForm();
    setIsAddClothingModalOpen(false);
  };

  // Helper to read File to Base64
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Process files (single or multiple) with client-side image optimization
  const handleFiles = async (files: FileList | File[]) => {
    const validImageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));

    if (validImageFiles.length === 0) {
      showToast({
        title: 'Invalid Files',
        description: 'Please select valid image files (JPG, PNG, WebP).',
        type: 'error',
      });
      return;
    }

    // If more than 1 file or already in multiple mode: switch to Batch Workspace
    if (validImageFiles.length > 1 || uploadMode === 'multiple' || batchItems.length > 0) {
      const newItems: BatchGarmentItem[] = [];

      for (let i = 0; i < validImageFiles.length; i++) {
        const file = validImageFiles[i];
        try {
          // Client-side image optimization pipeline (resize to <=1280px, compress to WebP/JPEG)
          let b64: string;
          try {
            const opt = await optimizeImage(file, { maxDimension: 1280, quality: 0.82 });
            b64 = opt.dataUrl;
          } catch {
            b64 = await readFileAsDataUrl(file);
          }

          // Derive clean name from file name
          const cleanName = file.name
            .replace(/\.[^/.]+$/, '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());

          newItems.push({
            id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            name: cleanName || `Piece #${batchItems.length + i + 1}`,
            imageUrl: b64,
            imageBase64: b64,
            mimeType: 'image/webp',
            category: '',
            type: '',
            color: '',
            pattern: '',
            style: '',
            formality: '',
            fit: '',
            season: [],
            occasion: [],
            tags: [],
            status: 'pending',
          } as any);
        } catch (e) {
          console.error('Failed to read file:', e);
        }
      }

      const merged = [...batchItems, ...newItems];
      setBatchItems(merged);
      setUploadMode('multiple');
      setCurrentStep('batch_workspace');

      showToast({
        title: 'Images Loaded',
        description: `Loaded ${newItems.length} optimized image(s). You have ${merged.length} pieces in the batch queue.`,
        type: 'info',
      });

      // Automatically trigger batch AI analysis on new items
      triggerBatchAIAnalysis(newItems, merged);
    } else {
      // Single file workflow with optimization
      const file = validImageFiles[0];
      try {
        const opt = await optimizeImage(file, { maxDimension: 1280, quality: 0.82 });
        const result = opt.dataUrl;
        setImageBase64(result);
        setImageUrl(result);
        setErrors(prev => ({ ...prev, imageUrl: '' }));
        setCurrentStep('ai_review');
        await triggerAIAnalysis({ base64: result, mimeType: 'image/webp' });
      } catch (err: any) {
        console.error('Image optimization failed, falling back to direct read:', err);
        const raw = await readFileAsDataUrl(file);
        setImageBase64(raw);
        setImageUrl(raw);
        setErrors(prev => ({ ...prev, imageUrl: '' }));
        setCurrentStep('ai_review');
        await triggerAIAnalysis({ base64: raw, mimeType: file.type });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
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
        
        if (res.confidence !== undefined) setAiConfidence(res.confidence);

        if (res.isClothingItem === false) {
           showToast({
             title: 'Not recognized as clothing',
             description: 'We could not confidently identify a clothing item. Please edit details manually.',
             type: 'info',
           });
           setAiConfidence(0);
           setAnalysisStatus('needs_confirmation');
        } else if (res.hasMultipleItems) {
           setHasMultipleItems(true);
           setAnalysisStatus('needs_confirmation');
           showToast({
             title: 'Multiple items detected',
             description: 'Please review and confirm which item you are adding.',
             type: 'info',
           });
        } else if (res.confidence !== undefined && res.confidence < 60) {
           setAnalysisStatus('needs_confirmation');
           showToast({
             title: 'Low Confidence',
             description: 'PN couldn\'t confidently identify this item. Please review the details.',
             type: 'warning',
           });
        } else {
           setAnalysisStatus('success');
           showToast({
             title: 'AI Analysis Complete',
             description: `Identified as ${res.category} · ${res.type || 'Piece'}.`,
             type: 'success',
           });
        }
      }
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'AI Identification Failed',
        description: err.message || "Couldn't identify the garment. Please fill details manually.",
        type: 'error',
      });
      setAiConfidence(0);
      setAnalysisStatus('needs_confirmation');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Batch AI Analyzer for all unanalyzed items in queue
  const triggerBatchAIAnalysis = async (itemsToAnalyze?: BatchGarmentItem[], currentAllItems?: BatchGarmentItem[]) => {
    const list = itemsToAnalyze || batchItems.filter(item => item.status === 'pending');
    if (list.length === 0) return;

    setIsBatchAnalyzing(true);
    let updatedList = [...(currentAllItems || batchItems)];

    for (const item of list) {
      // Mark item as analyzing
      updatedList = updatedList.map(i => i.id === item.id ? { ...i, status: 'analyzing' } : i);
      setBatchItems([...updatedList]);

      try {
        const analysis = await aiStylistService.analyzeGarment({
          imageBase64: item.imageBase64,
          mimeType: item.mimeType,
          hint: item.name,
        });

        updatedList = updatedList.map(i => {
          if (i.id === item.id) {
            return {
              ...i,
              name: analysis.name || i.name,
              category: analysis.category || i.category,
              type: analysis.type || analysis.subcategory || i.type,
              color: analysis.color || i.color,
              secondaryColor: analysis.secondaryColor,
              pattern: analysis.pattern || i.pattern,
              material: analysis.material,
              style: analysis.style || i.style,
              formality: (analysis.formality as ClothingFormality) || i.formality,
              fit: analysis.fit || i.fit,
              season: analysis.season && analysis.season.length > 0 ? analysis.season : i.season,
              occasion: analysis.occasion && analysis.occasion.length > 0 ? analysis.occasion : i.occasion,
              tags: analysis.tags || i.tags,
              careInstructions: analysis.careInstructions,
              stylingNote: analysis.stylingNote,
              confidence: analysis.confidence,
              status: analysis.confidence !== undefined && analysis.confidence < 60 ? 'error' : 'ready',
            };
          }
          return i;
        });
        setBatchItems([...updatedList]);
      } catch (err) {
        console.warn('AI analysis error for item:', item.id, err);
        updatedList = updatedList.map(i => i.id === item.id ? { ...i, status: 'error' } : i);
        setBatchItems([...updatedList]);
      }
    }

    setIsBatchAnalyzing(false);
    showToast({
      title: 'Batch Analysis Complete',
      description: `AI successfully analyzed attributes for all pieces in the queue.`,
      type: 'success',
    });
  };

  const handleSaveSinglePiece = async () => {
    if (!name.trim()) {
      showToast({
        title: 'Name Required',
        description: 'Please give your clothing piece a name.',
        type: 'error',
      });
      return;
    }
    if (!category) {
      showToast({
        title: 'Category Required',
        description: 'Please select a category.',
        type: 'error',
      });
      return;
    }
    if (!type.trim()) {
      showToast({
        title: 'Type Required',
        description: 'Please specify the type of garment (e.g., Shirt, Jeans).',
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

      // Ensure image is optimized before saving
      let finalImageUrl = imageUrl.trim();
      if (finalImageUrl.startsWith('data:image/')) {
        try {
          const opt = await optimizeImage(finalImageUrl, { maxDimension: 1280, quality: 0.82 });
          finalImageUrl = opt.dataUrl;
        } catch (e) {
          console.warn('Image optimization skipped on save:', e);
        }
      }

      await addWardrobeItem({
        name: name.trim(),
        category: category as ClothingCategory,
        type: type.trim(),
        subcategory: type.trim(),
        color: color.trim(),
        secondaryColor: secondaryColor.trim() || undefined,
        pattern: pattern.trim(),
        material: material.trim() || undefined,
        style: style.trim(),
        formality: (formality || 'Casual') as ClothingFormality,
        brand: brand.trim() || undefined,
        fit: (fit || 'Regular') as ClothingFit,
        season: selectedSeasons,
        occasion: selectedOccasions,
        tags: parsedTags.length > 0 ? parsedTags : ['Wardrobe Essential', category],
        imageUrl: finalImageUrl,
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

  // Save All Batch Items in One Click
  const handleSaveAllBatchItems = async () => {
    if (batchItems.length === 0) return;

    try {
      setIsBatchSaving(true);
      let successCount = 0;

      for (const item of batchItems) {
        let finalImageUrl = item.imageUrl.trim();
        if (finalImageUrl.startsWith('data:image/')) {
          try {
            const opt = await optimizeImage(finalImageUrl, { maxDimension: 1280, quality: 0.82 });
            finalImageUrl = opt.dataUrl;
          } catch (e) {
            console.warn('Batch image optimization skipped:', e);
          }
        }

        await addWardrobeItem({
          name: item.name.trim(),
          category: item.category,
          type: item.type.trim(),
          subcategory: item.type.trim(),
          color: item.color.trim(),
          secondaryColor: item.secondaryColor,
          pattern: item.pattern,
          material: item.material,
          style: item.style,
          formality: item.formality,
          brand: item.brand,
          fit: item.fit,
          season: item.season,
          occasion: item.occasion,
          tags: item.tags.length > 0 ? item.tags : ['Wardrobe Essential', item.category],
          imageUrl: finalImageUrl,
          isFavorite: false,
          careInstructions: item.careInstructions,
        });
        successCount++;
      }

      showToast({
        title: 'Batch Saved to Wardrobe!',
        description: `Successfully added all ${successCount} pieces to your digital wardrobe.`,
        type: 'success',
      });

      handleClose();
    } catch (err: any) {
      console.error(err);
      showToast({
        title: 'Batch Save Interrupted',
        description: err.message || 'Error occurred while saving batch items.',
        type: 'error',
      });
    } finally {
      setIsBatchSaving(false);
    }
  };

  const removeBatchItem = (id: string) => {
    const updated = batchItems.filter(item => item.id !== id);
    setBatchItems(updated);
    if (updated.length === 0) {
      setCurrentStep('upload');
    }
  };

  const updateBatchItemField = (id: string, updates: Partial<BatchGarmentItem>) => {
    setBatchItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    if (selectedBatchItemForEdit && selectedBatchItemForEdit.id === id) {
      setSelectedBatchItemForEdit({ ...selectedBatchItemForEdit, ...updates });
    }
  };

  return (
    <Modal
      isOpen={isAddClothingModalOpen}
      onClose={handleClose}
      title={currentStep === 'batch_workspace' ? 'Batch Wardrobe Upload' : 'Add New Piece'}
      subtitle={
        currentStep === 'batch_workspace'
          ? `Upload at least 5 images at once with automated AI multi-garment detection & tagging.`
          : 'Upload single or multiple images (up to 10+) and let AI automatically organize your wardrobe.'
      }
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Upload Mode Selector (Single vs Multiple) */}
        {currentStep === 'upload' && (
          <div className="flex items-center justify-center p-1 bg-gray-100 rounded-xl max-w-sm mx-auto border border-gray-200">
            <button
              type="button"
              onClick={() => setUploadMode('single')}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
                uploadMode === 'single'
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200/50'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Single Photo
            </button>
            <button
              type="button"
              onClick={() => {
                setUploadMode('multiple');
                multiFileInputRef.current?.click();
              }}
              className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                uploadMode === 'multiple'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Batch Multi-Upload (5+ Images)
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
              onClick={() => {
                if (uploadMode === 'multiple') {
                  multiFileInputRef.current?.click();
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className={`border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                isDragOver
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-gray-300 bg-gray-50/70 hover:border-emerald-400 hover:bg-gray-50'
              }`}
            >
              {/* Single File Input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={e => e.target.files && handleFiles(e.target.files)}
              />

              {/* Multi File Input (Allows 5+ images simultaneously) */}
              <input
                type="file"
                ref={multiFileInputRef}
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => e.target.files && handleFiles(e.target.files)}
              />

              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 shadow-sm border border-emerald-100">
                <UploadCloud className="w-8 h-8" />
              </div>

              <h4 className="text-base font-bold text-gray-900 mb-1">
                Drag and drop your images here
              </h4>
              <p className="text-xs text-gray-600 mb-4 max-w-md">
                Select <span className="font-semibold text-emerald-700">1 to 10+ photos</span> at once (JPG, PNG, WebP). AI will automatically identify cuts, colors, and styles for each.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className="rounded-xl px-5"
                  onClick={e => {
                    e.stopPropagation();
                    multiFileInputRef.current?.click();
                  }}
                  leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
                >
                  Select 5+ Photos in Batch
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="rounded-xl px-4"
                  onClick={e => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Single Image
                </Button>
              </div>
            </div>

            {/* URL Fallback */}
            <div className="pt-2">
              <div className="text-xs text-gray-400 text-center mb-2 font-medium">
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
                  leftIcon={<ImageIcon className="w-4 h-4 text-gray-400" />}
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

        {/* STEP: BATCH MULTI-GARMENT WORKSPACE (5+ Images Queue) */}
        {currentStep === 'batch_workspace' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Batch Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">
                    Batch Upload Queue ({batchItems.length} pieces)
                  </span>
                  <Badge variant="emerald" size="sm">
                    Multi-Upload Active
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  AI will auto-tag each garment. Review or customize attributes before saving to your wardrobe.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Hidden input for adding more files */}
                <input
                  type="file"
                  ref={multiFileInputRef}
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => e.target.files && handleFiles(e.target.files)}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => multiFileInputRef.current?.click()}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add More Images
                </Button>

                <Button
                  type="button"
                  variant="gold-outline"
                  size="sm"
                  disabled={isBatchAnalyzing}
                  onClick={() => triggerBatchAIAnalysis()}
                  leftIcon={<Sparkles className={`w-3.5 h-3.5 ${isBatchAnalyzing ? 'animate-spin' : 'text-amber-500'}`} />}
                >
                  {isBatchAnalyzing ? 'Analyzing AI...' : 'Re-Analyze All'}
                </Button>
              </div>
            </div>

            {/* Batch Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-1">
              {batchItems.map((item, idx) => (
                <div
                  key={item.id}
                  
                  
                  
                  
                  className="relative flex flex-col justify-between p-3.5 rounded-2xl bg-white border border-gray-200 hover:border-emerald-400/80 shadow-xs hover:shadow-md transition-all group"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-gray-100 border border-gray-100">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeBatchItem(item.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/75 hover:bg-rose-600 text-white transition-colors"
                        title="Remove image from batch"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      {/* Status Tag */}
                      <div className="absolute bottom-2 left-2">
                        {item.status === 'analyzing' ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-semibold flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-2.5 h-2.5 animate-spin" />
                            Analyzing...
                          </span>
                        ) : item.confidence ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-semibold shadow-xs">
                            {item.confidence}% Match
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-gray-900 text-gray-200 text-[10px] font-semibold shadow-xs">
                            Pending AI
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick In-Card Editable Fields */}
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => updateBatchItemField(item.id, { name: e.target.value })}
                        placeholder="Garment Name"
                        className="w-full px-2 py-1 text-xs font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />

                      <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                        <select
                          value={item.category}
                          onChange={e => updateBatchItemField(item.id, { category: e.target.value as ClothingCategory })}
                          className="px-1.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-gray-700 focus:outline-none"
                        >
                          {CATEGORIES.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>

                        <select
                          value={item.color}
                          onChange={e => updateBatchItemField(item.id, { color: e.target.value })}
                          className="px-1.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-gray-700 focus:outline-none"
                        >
                          {COLORS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div className="text-[10px] text-gray-500 flex items-center justify-between pt-1">
                        <span>Type: <strong className="text-gray-800">{item.type}</strong></span>
                        <span className="capitalize">{item.formality}</span>
                      </div>
                    </div>
                  </div>

                  {/* Edit detail button */}
                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedBatchItemForEdit(item)}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      More Details
                    </button>
                    <span className="text-[10px] text-gray-400 font-mono">#{idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Batch Action Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-600">
                Ready to add <strong className="text-emerald-700">{batchItems.length} pieces</strong> into your personal wardrobe.
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setCurrentStep('upload')}
                  className="rounded-xl flex-1 sm:flex-initial"
                >
                  Back
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  isLoading={isBatchSaving}
                  disabled={batchItems.length === 0}
                  onClick={handleSaveAllBatchItems}
                  className="rounded-xl px-6 flex-1 sm:flex-initial"
                  leftIcon={<CheckCheck className="w-4 h-4" />}
                >
                  Save All {batchItems.length} Pieces to Wardrobe
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: SINGLE AI IDENTIFICATION CONFIRMATION */}
        {currentStep === 'ai_review' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Large Image Preview */}
              <div className="md:col-span-5 space-y-3">
                <div className="relative rounded-3xl overflow-hidden bg-gray-100 border border-gray-200 aspect-[3/4] shadow-sm flex items-center justify-center group">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={name || 'Garment Visual'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                      <ImageIcon className="w-12 h-12 mb-2 stroke-1" />
                      <span className="text-xs">No image loaded</span>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-gray-950/80 flex flex-col items-center justify-center text-white p-4 text-center">
                      <Sparkles className="w-8 h-8 text-amber-300 animate-spin mb-3" />
                      <p className="text-sm font-medium">AI Analyzing Garment...</p>
                      <p className="text-xs text-gray-300 mt-1">Identifying cut, material, and colorway</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-1">
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className="text-xs font-medium text-emerald-600 hover:underline"
                  >
                    Change Image
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerAIAnalysis()}
                    disabled={isAnalyzing}
                    className="text-xs font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1"
                  >
                    <Wand2 className="w-3 h-3" />
                    Re-Analyze
                  </button>
                </div>
              </div>

              {/* Right Column: AI Identification Table */}
              <div className="md:col-span-7 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                      <Sparkles className="w-4 h-4" />
                    </span>
                    <h3 className="text-base font-semibold text-gray-900">
                      AI Identification
                    </h3>
                  </div>

                  {aiConfidence && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {aiConfidence}% Confidence
                    </span>
                  )}
                </div>

                {/* Detected Garment Name */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Garment Name
                  </label>
                  <div className="text-lg font-bold text-gray-900 font-editorial mt-0.5">
                    {name || 'Classic Denim Shirt'}
                  </div>
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
                  <div>
                    <span className="text-gray-500 font-medium">Category</span>
                    <div className="font-semibold text-gray-800 mt-0.5">{category}</div>
                  </div>

                  <div>
                    <span className="text-gray-500 font-medium">Type</span>
                    <div className="font-semibold text-gray-800 mt-0.5">{type || 'Shirt'}</div>
                  </div>

                  <div>
                    <span className="text-gray-500 font-medium">Color</span>
                    <div className="font-semibold text-gray-800 mt-0.5 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      {color}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 font-medium">Pattern</span>
                    <div className="font-semibold text-gray-800 mt-0.5">{pattern || 'Solid'}</div>
                  </div>

                  <div>
                    <span className="text-gray-500 font-medium">Material</span>
                    <div className="font-semibold text-gray-800 mt-0.5">{material || 'Unknown'}</div>
                  </div>

                  <div>
                    <span className="text-gray-500 font-medium">Style</span>
                    <div className="font-semibold text-gray-800 mt-0.5">{style || 'Casual'}</div>
                  </div>

                  <div>
                    <span className="text-gray-500 font-medium">Season</span>
                    <div className="font-semibold text-gray-800 mt-0.5">
                      {selectedSeasons.join(', ')}
                    </div>
                  </div>

                  <div>
                    <span className="text-gray-500 font-medium">Formality</span>
                    <div className="font-semibold text-gray-800 mt-0.5">{formality}</div>
                  </div>
                </div>

                {/* AI Stylist Note */}
                {aiStylingNote && (
                  <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-600 border border-gray-200">
                    <span className="font-semibold text-gray-800">Styling Note: </span>
                    {aiStylingNote}
                  </div>
                )}

                {/* Confirm / Edit actions */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs font-semibold text-gray-700 mb-3 text-center sm:text-left">
                    Does this look right?
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Button
                      type="button"
                      variant="primary"
                      className="w-full sm:w-auto flex-1 rounded-xl"
                      isLoading={isSubmitting}
                      onClick={handleSaveSinglePiece}
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

        {/* STEP 3: SINGLE PIECE FULL EDITABLE DETAILS */}
        {currentStep === 'edit_details' && (
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Customizing Metadata
              </span>
              <button
                type="button"
                onClick={() => setCurrentStep('ai_review')}
                className="text-xs text-gray-600 hover:text-gray-900"
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
                <option value="" disabled>Select Category</option>
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
                <option value="" disabled>Select Formality</option>
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
                <option value="" disabled>Select Fit</option>
                <option value="Regular">Regular Fit</option>
                <option value="Slim">Slim Fit</option>
                <option value="Tailored">Tailored Fit</option>
                <option value="Relaxed">Relaxed Fit</option>
                <option value="Oversized">Oversized Fit</option>
              </Select>
            </div>

            {/* Seasons Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-slate-300">
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
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-semibold'
                          : 'bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
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
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
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
                onClick={handleSaveSinglePiece}
                className="rounded-xl px-6"
              >
                Save to Wardrobe
              </Button>
            </div>
          </div>
        )}

        {/* BATCH ITEM DETAIL MODAL (Quick edit single item inside batch) */}
        {selectedBatchItemForEdit && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl border border-gray-200 dark:border-slate-800 animate-fadeIn">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-800">
                <h4 className="text-base font-bold text-gray-900 dark:text-white">Customize Piece Metadata</h4>
                <button
                  type="button"
                  onClick={() => setSelectedBatchItemForEdit(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <Input
                  label="Name"
                  value={selectedBatchItemForEdit.name}
                  onChange={e => updateBatchItemField(selectedBatchItemForEdit.id, { name: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Category"
                    value={selectedBatchItemForEdit.category}
                    onChange={e => updateBatchItemField(selectedBatchItemForEdit.id, { category: e.target.value as ClothingCategory })}
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>

                  <Select
                    label="Color"
                    value={selectedBatchItemForEdit.color}
                    onChange={e => updateBatchItemField(selectedBatchItemForEdit.id, { color: e.target.value })}
                  >
                    {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Clothing Type"
                    value={selectedBatchItemForEdit.type}
                    onChange={e => updateBatchItemField(selectedBatchItemForEdit.id, { type: e.target.value })}
                  >
                    {CLOTHING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>

                  <Select
                    label="Formality"
                    value={selectedBatchItemForEdit.formality}
                    onChange={e => updateBatchItemField(selectedBatchItemForEdit.id, { formality: e.target.value as ClothingFormality })}
                  >
                    {FORMALITIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </Select>
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-200">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedBatchItemForEdit(null)}
                >
                  Done Editing
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
