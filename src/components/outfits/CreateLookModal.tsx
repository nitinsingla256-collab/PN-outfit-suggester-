/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { OccasionType, StyleVibe, Season, OutfitItemReference } from '../../types';
import { useApp } from '../../context/AppContext';
import { Check, Plus } from 'lucide-react';

const OCCASIONS: OccasionType[] = [
  'Formal',
  'Casual',
  'Party',
  'School',
  'Travel',
  'Work',
  'Date',
  'Athletic',
];

const VIBES: StyleVibe[] = [
  'Minimal',
  'Classic',
  'Streetwear',
  'Old money',
  'Edgy',
  'Romantic',
  'Sporty',
  'Avant-garde',
];

export function CreateLookModal() {
  const { isCreateLookModalOpen, setIsCreateLookModalOpen, wardrobe, addOutfit } = useApp();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [occasion, setOccasion] = useState<OccasionType>('Formal');
  const [styleVibe, setStyleVibe] = useState<StyleVibe>('Minimal');
  const [stylingNotes, setStylingNotes] = useState('');
  const [weatherSuitability, setWeatherSuitability] = useState('Transitional 16°C - 22°C');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleItemSelection = (id: string) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter(itemId => itemId !== id));
    } else {
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for this look.');
      return;
    }
    if (selectedItemIds.length === 0) {
      setError('Please select at least 1 wardrobe piece to compose this look.');
      return;
    }

    try {
      setIsSubmitting(true);
      const items: OutfitItemReference[] = selectedItemIds.map(id => {
        const piece = wardrobe.find(w => w.id === id);
        let slotName: OutfitItemReference['slotName'] = 'Main';
        if (piece) {
          if (piece.category === 'Tops') slotName = 'Top';
          else if (piece.category === 'Bottoms') slotName = 'Bottom';
          else if (piece.category === 'Outerwear') slotName = 'Outerwear';
          else if (piece.category === 'Footwear') slotName = 'Footwear';
          else if (piece.category === 'Bags') slotName = 'Bag';
          else if (piece.category === 'Jewelry') slotName = 'Jewelry';
          else if (piece.category === 'Accessories') slotName = 'Accessory';
        }
        return { itemId: id, slotName };
      });

      // Find first item with image for cover
      const firstItem = wardrobe.find(w => selectedItemIds.includes(w.id));

      await addOutfit({
        name: name.trim(),
        description: description.trim() || `Curated ${styleVibe} ensemble composed for ${occasion.toLowerCase()} wear.`,
        occasion,
        styleVibe,
        items,
        imageUrl: firstItem?.imageUrl,
        isFavorite: false,
        stylingNotes: stylingNotes.trim() || undefined,
        weatherSuitability: weatherSuitability.trim() || undefined,
        season: ['All-Season'],
      });

      setName('');
      setDescription('');
      setStylingNotes('');
      setSelectedItemIds([]);
      setIsCreateLookModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isCreateLookModalOpen}
      onClose={() => setIsCreateLookModalOpen(false)}
      title="Compose Lookbook Ensemble"
      subtitle="Assemble garments into an editorial lookbook composition."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Look Title *"
          placeholder="e.g. Architectural Linen & Silk Evening"
          value={name}
          onChange={e => {
            setName(e.target.value);
            setError('');
          }}
          error={error}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Occasion Profile"
            value={occasion}
            onChange={e => setOccasion(e.target.value as OccasionType)}
          >
            {OCCASIONS.map(occ => (
              <option key={occ} value={occ} className="bg-white">
                {occ}
              </option>
            ))}
          </Select>

          <Select
            label="Aesthetic Direction"
            value={styleVibe}
            onChange={e => setStyleVibe(e.target.value as StyleVibe)}
          >
            {VIBES.map(vibe => (
              <option key={vibe} value={vibe} className="bg-white">
                {vibe}
              </option>
            ))}
          </Select>
        </div>

        {/* Piece Selection Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-gray-700">
              Select Wardrobe Pieces ({selectedItemIds.length} selected)
            </label>
            <span className="text-[11px] text-gray-500">
              Click to attach piece
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1 bg-gray-100 rounded-xl border border-gray-200">
            {wardrobe.map(item => {
              const isSelected = selectedItemIds.includes(item.id);
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => toggleItemSelection(item.id)}
                  className={`relative p-2 rounded-xl border text-left flex flex-col gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-gray-50 border-emerald-500 ring-1 ring-emerald-500/40'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-white">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-gray-50 flex items-center justify-center shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-gray-800 truncate">{item.name}</div>
                    <div className="text-[9px] text-gray-500 truncate">{item.category}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Styling Notes & Tips"
            placeholder="e.g. Unbutton collar, tuck left side into waistband"
            value={stylingNotes}
            onChange={e => setStylingNotes(e.target.value)}
          />
          <Input
            label="Weather Condition"
            placeholder="e.g. Autumn chill 14°C - 19°C"
            value={weatherSuitability}
            onChange={e => setWeatherSuitability(e.target.value)}
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setIsCreateLookModalOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Lookbook Entry
          </Button>
        </div>
      </form>
    </Modal>
  );
}
