/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { HeightUnit, WeightUnit } from '../types';
import {
  toCentimeters,
  fromCentimeters,
  toKilograms,
  fromKilograms,
  calculateBodyMetrics,
  formatHeight,
  formatWeight,
  HEIGHT_UNIT_LABELS,
  WEIGHT_UNIT_LABELS,
} from '../utils/measurementUtils';
import {
  Sparkles,
  MapPin,
  Save,
  User as UserIcon,
  Ruler,
  Scale,
  Activity,
  CheckCircle2,
  Sliders,
  Info,
} from 'lucide-react';

export function ProfilePage() {
  const { user, updateUser, showToast } = useApp();
  const [imgError, setImgError] = useState(false);
  
  // Basic Profile State
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [location, setLocation] = useState(user.location);
  const [bio, setBio] = useState(user.bio);

  // Height & Weight Measurements State
  const [heightUnit, setHeightUnit] = useState<HeightUnit>(() => {
    return user.measurements?.heightUnit || 'ft_in';
  });
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(() => {
    return user.measurements?.weightUnit || 'kg';
  });

  const [cmInput, setCmInput] = useState<string>('');
  const [metersInput, setMetersInput] = useState<string>('');
  const [inchesInput, setInchesInput] = useState<string>('');
  const [feetInput, setFeetInput] = useState<string>('5');
  const [inchPartInput, setInchPartInput] = useState<string>('9');
  const [weightInput, setWeightInput] = useState<string>('');

  const [isSaving, setIsSaving] = useState(false);

  // Populate from user measurements
  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setLocation(user.location);
    setBio(user.bio);

    if (user.measurements?.heightCm) {
      const converted = fromCentimeters(user.measurements.heightCm);
      setCmInput(converted.cm ? String(converted.cm) : '');
      setMetersInput(converted.meters ? String(converted.meters) : '');
      setInchesInput(converted.totalInches ? String(converted.totalInches) : '');
      setFeetInput(converted.feet !== undefined ? String(converted.feet) : '5');
      setInchPartInput(converted.inches !== undefined ? String(converted.inches) : '9');
    }

    if (user.measurements?.weightKg) {
      const wUnit = user.measurements.weightUnit || 'kg';
      const wVal = fromKilograms(user.measurements.weightKg, wUnit);
      setWeightInput(wVal ? String(wVal) : '');
      setWeightUnit(wUnit);
    }

    if (user.measurements?.heightUnit) {
      setHeightUnit(user.measurements.heightUnit);
    }
  }, [user]);

  // Compute canonical height in cm
  const currentHeightCm = useMemo(() => {
    if (heightUnit === 'cm') {
      const val = parseFloat(cmInput);
      return toCentimeters({ cm: val }, 'cm');
    }
    if (heightUnit === 'm') {
      const val = parseFloat(metersInput);
      return toCentimeters({ meters: val }, 'm');
    }
    if (heightUnit === 'in') {
      const val = parseFloat(inchesInput);
      return toCentimeters({ totalInches: val }, 'in');
    }
    if (heightUnit === 'ft_in') {
      const feet = parseInt(feetInput, 10) || 0;
      const inches = parseFloat(inchPartInput) || 0;
      return toCentimeters({ feet, inches }, 'ft_in');
    }
    return undefined;
  }, [heightUnit, cmInput, metersInput, inchesInput, feetInput, inchPartInput]);

  // Compute canonical weight in kg
  const currentWeightKg = useMemo(() => {
    const val = parseFloat(weightInput);
    return toKilograms(val, weightUnit);
  }, [weightInput, weightUnit]);

  // Sync inputs when changing heightUnit
  const handleHeightUnitChange = (newUnit: HeightUnit) => {
    if (newUnit === heightUnit) return;

    if (currentHeightCm) {
      const conv = fromCentimeters(currentHeightCm);
      if (newUnit === 'cm') setCmInput(conv.cm ? String(conv.cm) : '');
      if (newUnit === 'm') setMetersInput(conv.meters ? String(conv.meters) : '');
      if (newUnit === 'in') setInchesInput(conv.totalInches ? String(conv.totalInches) : '');
      if (newUnit === 'ft_in') {
        setFeetInput(conv.feet !== undefined ? String(conv.feet) : '5');
        setInchPartInput(conv.inches !== undefined ? String(conv.inches) : '0');
      }
    }
    setHeightUnit(newUnit);
  };

  // Sync inputs when changing weightUnit
  const handleWeightUnitChange = (newUnit: WeightUnit) => {
    if (newUnit === weightUnit) return;

    if (currentWeightKg) {
      const convertedWeight = fromKilograms(currentWeightKg, newUnit);
      setWeightInput(convertedWeight ? String(convertedWeight) : '');
    }
    setWeightUnit(newUnit);
  };

  const bodyMetrics = useMemo(() => {
    return calculateBodyMetrics(currentHeightCm, currentWeightKg);
  }, [currentHeightCm, currentWeightKg]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updateUser({
        name,
        email,
        location,
        bio,
        measurements: {
          heightCm: currentHeightCm,
          heightUnit,
          weightKg: currentWeightKg,
          weightUnit,
          hasCompletedFirstLoginMeasurements: true,
        },
      });
      showToast({
        title: 'Profile Updated',
        description: 'Your sartorial profile, measurements, and preferences have been synchronized.',
        type: 'success',
      });
    } catch (err) {
      console.error(err);
      showToast({
        title: 'Save Failed',
        description: 'Failed to update profile. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Sartorial Identity
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300 font-mono">
              Role: {user.role}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white font-editorial">
            Client Profile & Body Proportions
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
            Manage your personal profile, body measurements (height & weight in your preferred unit), and bespoke styling guidelines.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* 2. Primary Identity Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-500 bg-slate-100 shadow-md">
                {user.avatarUrl && !imgError ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <UserIcon className="w-10 h-10" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-emerald-500 text-white shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl font-bold text-slate-900 font-editorial">
                  {user.name}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  VIP Atelier Member
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">{user.email}</p>
              <p className="text-xs text-slate-400">
                Member since {new Date(user.joinedDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Core Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Styling Base / City"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
            />
            <Input
              label="Style Preferences / Aesthetic"
              value={bio || "Smart Casual & Elevated Minimalist"}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </div>

        {/* 3. Body Measurements & Fit Calibration Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <Ruler className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 font-editorial">
                  Body Measurements & Fit Dimensions
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configure height (in feet, inches, centimeters, or meters) and weight (kg or lbs). You can change these anytime.
              </p>
            </div>

            {currentHeightCm && currentWeightKg && (
              <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono self-start sm:self-auto flex items-center gap-2">
                <span>{formatHeight(currentHeightCm, heightUnit)}</span>
                <span>•</span>
                <span>{formatWeight(currentWeightKg, weightUnit)}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Height Section */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-bold text-slate-800 font-editorial">
                    Height Unit
                  </span>
                </div>

                {/* Unit Switcher Tabs */}
                <div className="flex items-center p-1 bg-slate-200/70 rounded-xl gap-1">
                  {(['ft_in', 'cm', 'm', 'in'] as HeightUnit[]).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => handleHeightUnitChange(unit)}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                        heightUnit === unit
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                      }`}
                    >
                      {unit === 'ft_in' ? 'ft & in' : unit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Height Input */}
              {heightUnit === 'ft_in' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 font-mono">
                      Feet (ft)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="3"
                        max="8"
                        value={feetInput}
                        onChange={(e) => setFeetInput(e.target.value)}
                        placeholder="5"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-400">
                        ft
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 font-mono">
                      Inches (in)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="11.9"
                        step="0.5"
                        value={inchPartInput}
                        onChange={(e) => setInchPartInput(e.target.value)}
                        placeholder="9"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-400">
                        in
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {heightUnit === 'cm' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 font-mono">
                    Height in Centimeters (cm)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="90"
                      max="250"
                      step="0.5"
                      value={cmInput}
                      onChange={(e) => setCmInput(e.target.value)}
                      placeholder="178"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-400">
                      cm
                    </span>
                  </div>
                </div>
              )}

              {heightUnit === 'm' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 font-mono">
                    Height in Meters (m)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.9"
                      max="2.5"
                      step="0.01"
                      value={metersInput}
                      onChange={(e) => setMetersInput(e.target.value)}
                      placeholder="1.78"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-400">
                      m
                    </span>
                  </div>
                </div>
              )}

              {heightUnit === 'in' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 font-mono">
                    Height in Total Inches (in)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="36"
                      max="96"
                      step="0.5"
                      value={inchesInput}
                      onChange={(e) => setInchesInput(e.target.value)}
                      placeholder="70"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-400">
                      in
                    </span>
                  </div>
                </div>
              )}

              {currentHeightCm && (
                <div className="text-[11px] text-slate-500 font-mono pt-1 flex flex-wrap gap-x-2">
                  <span>Equiv:</span>
                  <span>{fromCentimeters(currentHeightCm).feet}&apos;{fromCentimeters(currentHeightCm).inches}&quot;</span>
                  <span>•</span>
                  <span>{Math.round(currentHeightCm)} cm</span>
                  <span>•</span>
                  <span>{(currentHeightCm / 100).toFixed(2)} m</span>
                </div>
              )}
            </div>

            {/* Weight Section */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-teal-600" />
                  <span className="text-sm font-bold text-slate-800 font-editorial">
                    Weight Unit
                  </span>
                </div>

                <div className="flex items-center p-1 bg-slate-200/70 rounded-xl gap-1">
                  {(['kg', 'lbs'] as WeightUnit[]).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => handleWeightUnitChange(unit)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                        weightUnit === unit
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                      }`}
                    >
                      {unit.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1 font-mono">
                  Weight in {weightUnit === 'kg' ? 'Kilograms (kg)' : 'Pounds (lbs)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="30"
                    max="300"
                    step="0.5"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    placeholder={weightUnit === 'kg' ? '68' : '150'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-mono text-slate-400">
                    {weightUnit}
                  </span>
                </div>
              </div>

              {currentWeightKg && (
                <div className="text-[11px] text-slate-500 font-mono pt-1 flex items-center gap-2">
                  <span>Equiv:</span>
                  <span>{Math.round(currentWeightKg)} kg</span>
                  <span>•</span>
                  <span>{Math.round(currentWeightKg * 2.20462)} lbs</span>
                </div>
              )}
            </div>
          </div>

          {/* Body Proportions & Tailoring Guidance */}
          {bodyMetrics && (
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-editorial">
                    Atelier Silhouette Calibration
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border ${bodyMetrics.badgeColor}`}>
                    {bodyMetrics.category} (BMI {bodyMetrics.bmi})
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 font-mono border border-slate-200">
                    {bodyMetrics.heightCategory}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {bodyMetrics.tailoringRecommendation}
              </p>
            </div>
          )}
        </div>

        {/* 4. Footer Submit Action */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSaving}
            className="rounded-2xl px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg flex items-center gap-2"
            leftIcon={<Save className="w-4 h-4" />}
          >
            {isSaving ? "Saving Profile..." : "Save All Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
