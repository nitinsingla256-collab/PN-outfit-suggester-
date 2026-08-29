/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { OccasionType } from '../../types';
import { useApp } from '../../context/AppContext';
import { Calendar, MapPin, Sparkles, CloudSun, Loader2 } from 'lucide-react';
import { weatherService } from '../../services/weatherService';
import { aiStylistService } from '../../services/aiStylistService';

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

export function PlanOutfitModal({
  defaultDate,
  isOpen,
  onClose,
}: {
  defaultDate?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { outfits, addPlan } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(defaultDate || todayStr);
  const [time, setTime] = useState('19:00');
  const [title, setTitle] = useState('');
  const [occasion, setOccasion] = useState<OccasionType>('Formal');
  const [outfitId, setOutfitId] = useState<string>(outfits[0]?.id || '');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiPlanning, setIsAiPlanning] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [weatherForecast, setWeatherForecast] = useState<any>(null);
  const { wardrobe, addOutfit } = useApp();
  const [error, setError] = useState('');

  
  const handlePlanWithAI = async () => {
    setIsAiPlanning(true);
    setAiSuggestion(null);
    try {
      // 1. Fetch weather based on location
      let weatherInfo = { temperatureCelsius: 20, condition: 'Clear' };
      if (location.trim()) {
        try {
          const data = await weatherService.geocodeAndGetWeather(location.trim());
          weatherInfo = { temperatureCelsius: data.temperatureCelsius, condition: data.condition };
          setWeatherForecast(weatherInfo);
        } catch (e) {
          console.warn('Could not fetch weather for', location, e);
        }
      }

      // 2. Query AI
      const request = {
        occasion: occasion,
        location: location.trim() || 'Unknown',
        date,
        time,
        weatherDescription: `${weatherInfo.temperatureCelsius}°C, ${weatherInfo.condition}`,
        temperatureCelsius: weatherInfo.temperatureCelsius,
        generateMultipleLooks: false
      };
      
      const res = await aiStylistService.generateOutfitRecommendation(request, wardrobe);
      if (res && res.looks && res.looks.length > 0) {
        setAiSuggestion(res.looks[0]);
      } else {
        setError('AI could not generate a look from your wardrobe. Try adding more items.');
      }
    } catch (err: any) {
      setError('AI Planning failed: ' + err.message);
    } finally {
      setIsAiPlanning(false);
    }
  };

  const handleConfirmAiSuggestion = async () => {
    if (!aiSuggestion) return;
    setIsSubmitting(true);
    try {
      // 1. Save the outfit
      const newOutfit = await addOutfit({
        name: `${title} Look`,
        occasion,
        season: ['All Season'],
        styleVibe: 'Modern',
        description: aiSuggestion.reasoning,
        imageUrl: aiSuggestion.visualUrl,
        items: aiSuggestion.itemIds,
        isFavorite: false,
      });
      // 2. Select it in the form
      setOutfitId(newOutfit.id);
      setAiSuggestion(null);
    } catch (err) {
      setError('Failed to save outfit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Event or schedule title is required.');
      return;
    }
    if (!date) {
      setError('Date is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await addPlan({
        date,
        time: time || undefined,
        title: title.trim(),
        occasion,
        outfitId: outfitId || undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        weatherForecast: {
          tempCelsius: 20,
          condition: 'Clear Evening',
          icon: 'Sparkles',
        },
      });

      setTitle('');
      setLocation('');
      setNotes('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Look on Calendar"
      subtitle="Associate curated ensembles with upcoming events and appointments."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Event / Destination Title *"
          placeholder="e.g. Gallery Vernissage, Executive Briefing"
          value={title}
          onChange={e => {
            setTitle(e.target.value);
            setError('');
          }}
          error={error}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date *"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <Input
            label="Time"
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Occasion"
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
            label="Select Outfit from Lookbook"
            value={outfitId}
            onChange={e => setOutfitId(e.target.value)}
          >
            <option value="" className="bg-white">
              No Look attached yet
            </option>
            {outfits.map(o => (
              <option key={o.id} value={o.id} className="bg-white">
                {o.name}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Location / Venue"
          placeholder="e.g. Via Monte Napoleone 8, Milan"
          value={location}
          onChange={e => setLocation(e.target.value)}
          leftIcon={<MapPin className="w-4 h-4" />}
        />

        <Input
          label="Private Notes"
          placeholder="e.g. Check coat at cloakroom; bring business card case"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Schedule Look
          </Button>
        </div>
      </form>
    </Modal>
  );
}
