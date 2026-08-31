/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useApp } from '../../context/AppContext';
import { ClothingCategory, ClothingFit, ClothingFormality, Season } from '../../types';
import {
  Heart,
  Trash2,
  Calendar,
  Sparkles,
  Tag,
  Edit3,
  Check,
  X,
  Layers,
  Clock,
  Shirt,
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

export function ClothingDetailModal() {
  const {
    selectedWardrobeItemForDetail,
    setSelectedWardrobeItemForDetail,
    deleteWardrobeItem,
    toggleWardrobeFavorite,
    updateWardrobeItem,
    navigateTo,
    showToast,
  } = useApp();

  const item = selectedWardrobeItemForDetail;
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  // Edit form states
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<ClothingCategory>('Tops');
  const [editType, setEditType] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editPattern, setEditPattern] = useState('');
  const [editMaterial, setEditMaterial] = useState('');
  const [editStyle, setEditStyle] = useState('');
  const [editFormality, setEditFormality] = useState<ClothingFormality>('Casual');
  const [editBrand, setEditBrand] = useState('');
  const [editFit, setEditFit] = useState<ClothingFit>('Regular');
  const [editCare, setEditCare] = useState('');

  if (!item) return null;

  const startEditing = () => {
    setEditName(item.name);
    setEditCategory(item.category);
    setEditType(item.type || item.subcategory || '');
    setEditColor(item.color);
    setEditPattern(item.pattern || 'Solid');
    setEditMaterial(item.material || '');
    setEditStyle(item.style || 'Casual');
    setEditFormality(item.formality || 'Casual');
    setEditBrand(item.brand || '');
    setEditFit(item.fit || 'Regular');
    setEditCare(item.careInstructions || '');
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      setIsSaving(true);
      const updated = await updateWardrobeItem(item.id, {
        name: editName.trim(),
        category: editCategory,
        type: editType.trim(),
        subcategory: editType.trim(),
        color: editColor.trim(),
        pattern: editPattern.trim(),
        material: editMaterial.trim(),
        style: editStyle.trim(),
        formality: editFormality,
        brand: editBrand.trim(),
        fit: editFit,
        careInstructions: editCare.trim(),
      });

      setSelectedWardrobeItemForDetail({
        ...item,
        name: editName.trim(),
        category: editCategory,
        type: editType.trim(),
        subcategory: editType.trim(),
        color: editColor.trim(),
        pattern: editPattern.trim(),
        material: editMaterial.trim(),
        style: editStyle.trim(),
        formality: editFormality,
        brand: editBrand.trim(),
        fit: editFit,
        careInstructions: editCare.trim(),
      });

      setIsEditing(false);
      showToast({
        title: 'Piece Updated',
        description: 'Your garment details have been saved.',
        type: 'success',
      });
    } catch (err: any) {
      showToast({
        title: 'Update Failed',
        description: err.message || 'Could not update item.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleIncrementWorn = async () => {
    const today = new Date().toISOString().split('T')[0];
    await updateWardrobeItem(item.id, {
      timesWorn: (item.timesWorn || 0) + 1,
      lastWornDate: today,
    });
    setSelectedWardrobeItemForDetail({
      ...item,
      timesWorn: (item.timesWorn || 0) + 1,
      lastWornDate: today,
    });
    showToast({
      title: 'Wear Logged',
      description: `Recorded wear for "${item.name}".`,
      type: 'success',
    });
  };

  const handleDelete = async () => {
    await deleteWardrobeItem(item.id);
    setIsConfirmingDelete(false);
    setSelectedWardrobeItemForDetail(null);
  };

  const formattedDate = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  return (
    <Modal
      isOpen={!!item}
      onClose={() => {
        setIsEditing(false);
        setSelectedWardrobeItemForDetail(null);
      }}
      title={isEditing ? 'Edit Garment Details' : item.name}
      subtitle={item.brand ? `${item.brand} · ${item.category}` : item.category}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Main Grid: Image + Details */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
          {/* Left Column: Image Card */}
          <div className="sm:col-span-5 space-y-3">
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-slate-100 dark:bg-white border border-slate-200 dark:border-gray-200 shadow-sm group">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => toggleWardrobeFavorite(item.id)}
                className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all ${
                  item.isFavorite
                    ? 'bg-rose-500 text-gray-900 shadow-md'
                    : 'bg-gray-100 text-gray-900/80 hover:text-gray-900'
                }`}
              >
                <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-current' : ''}`} />
              </button>

              <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 dark:bg-white/90 text-slate-900 dark:text-gray-900 backdrop-blur-sm border border-slate-200/50 dark:border-gray-300/50 shadow-xs">
                  {item.color}
                </span>
                {item.type && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/80 dark:bg-white/80 text-slate-700 dark:text-gray-700 backdrop-blur-sm">
                    {item.type}
                  </span>
                )}
              </div>
            </div>

            {/* Wear Log Badge */}
            <div className="p-3 bg-slate-50 dark:bg-gray-50 rounded-2xl border border-slate-200/70 dark:border-gray-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                  Times Worn
                </span>
                <div className="text-base font-bold text-slate-900 dark:text-gray-900">
                  {item.timesWorn || 0} times
                </div>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleIncrementWorn}
                className="rounded-xl text-xs"
              >
                + Wear Today
              </Button>
            </div>
          </div>

          {/* Right Column: Information Display or Edit Form */}
          <div className="sm:col-span-7 flex flex-col justify-between space-y-4">
            {!isEditing ? (
              <div className="space-y-4">
                {/* Meta details list */}
                <div className="bg-white dark:bg-white rounded-2xl border border-slate-200 dark:border-gray-200 p-4 space-y-2.5 text-xs shadow-2xs">
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-gray-200">
                    <span className="text-slate-400 dark:text-gray-500 font-medium">Category</span>
                    <span className="font-semibold text-slate-800 dark:text-gray-800">{item.category}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-gray-200">
                    <span className="text-slate-400 dark:text-gray-500 font-medium">Type</span>
                    <span className="font-semibold text-slate-800 dark:text-gray-800">{item.type || item.subcategory || 'Standard'}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-gray-200">
                    <span className="text-slate-400 dark:text-gray-500 font-medium">Color</span>
                    <span className="font-semibold text-slate-800 dark:text-gray-800">{item.color}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-gray-200">
                    <span className="text-slate-400 dark:text-gray-500 font-medium">Pattern</span>
                    <span className="font-semibold text-slate-800 dark:text-gray-800">{item.pattern || 'Solid'}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-gray-200">
                    <span className="text-slate-400 dark:text-gray-500 font-medium">Material</span>
                    <span className="font-semibold text-slate-800 dark:text-gray-800">{item.material || 'Standard Fabric'}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-gray-200">
                    <span className="text-slate-400 dark:text-gray-500 font-medium">Style</span>
                    <span className="font-semibold text-slate-800 dark:text-gray-800">{item.style || 'Casual'}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-gray-200">
                    <span className="text-slate-400 dark:text-gray-500 font-medium">Formality</span>
                    <span className="font-semibold text-slate-800 dark:text-gray-800">{item.formality || 'Casual'}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-gray-200">
                    <span className="text-slate-400 dark:text-gray-500 font-medium">Season</span>
                    <span className="font-semibold text-slate-800 dark:text-gray-800">
                      {item.season ? item.season.join(', ') : 'All-Season'}
                    </span>
                  </div>

                  {item.occasion && item.occasion.length > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-100 dark:border-gray-200">
                      <span className="text-slate-400 dark:text-gray-500 font-medium">Occasion</span>
                      <span className="font-semibold text-slate-800 dark:text-gray-800">{item.occasion.join(', ')}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-1">
                    <span className="text-slate-400 dark:text-gray-500 font-medium">Date Added</span>
                    <span className="font-semibold text-slate-800 dark:text-gray-800">{formattedDate}</span>
                  </div>
                </div>

                {/* Care Instructions */}
                {item.careInstructions && (
                  <div className="p-3 bg-slate-50 dark:bg-gray-50 rounded-2xl text-xs text-slate-600 dark:text-gray-600 border border-slate-200/60 dark:border-gray-200">
                    <span className="font-semibold text-slate-900 dark:text-gray-800">Care Guide: </span>
                    {item.careInstructions}
                  </div>
                )}
              </div>
            ) : (
              /* Editable Form */
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                <Input
                  label="Title"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Select
                    label="Category"
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value as ClothingCategory)}
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                  <Input
                    label="Type"
                    value={editType}
                    onChange={e => setEditType(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Color"
                    value={editColor}
                    onChange={e => setEditColor(e.target.value)}
                  />
                  <Input
                    label="Pattern"
                    value={editPattern}
                    onChange={e => setEditPattern(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Material"
                    value={editMaterial}
                    onChange={e => setEditMaterial(e.target.value)}
                  />
                  <Input
                    label="Style"
                    value={editStyle}
                    onChange={e => setEditStyle(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Select
                    label="Formality"
                    value={editFormality}
                    onChange={e => setEditFormality(e.target.value as ClothingFormality)}
                  >
                    <option value="Casual">Casual</option>
                    <option value="Smart Casual">Smart Casual</option>
                    <option value="Business Casual">Business Casual</option>
                    <option value="Formal">Formal</option>
                    <option value="Black Tie">Black Tie</option>
                  </Select>
                  <Input
                    label="Brand"
                    value={editBrand}
                    onChange={e => setEditBrand(e.target.value)}
                  />
                </div>

                <Input
                  label="Care Instructions"
                  value={editCare}
                  onChange={e => setEditCare(e.target.value)}
                />
              </div>
            )}

            {/* Quick Action Footer */}
            <div className="pt-3 border-t border-slate-100 dark:border-gray-200 flex items-center justify-between gap-2">
              {!isEditing ? (
                <>
                  <div className="flex items-center gap-2">
                    {!isConfirmingDelete ? (
                      <>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={startEditing}
                          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                        >
                          Edit Details
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setIsConfirmingDelete(true)}
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Remove Piece
                        </Button>
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5 p-1 bg-rose-50 border border-rose-200 rounded-xl">
                        <span className="text-xs text-rose-700 font-medium px-2">Confirm remove?</span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="text-xs px-2.5 py-1 h-7"
                          onClick={handleDelete}
                        >
                          Yes, Delete
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs px-2 py-1 h-7 text-gray-600"
                          onClick={() => setIsConfirmingDelete(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  {!isConfirmingDelete && (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => {
                        setSelectedWardrobeItemForDetail(null);
                        navigateTo('/stylist');
                      }}
                      leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                    >
                      Style in Studio
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    isLoading={isSaving}
                    onClick={handleSaveEdit}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Save Changes
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
