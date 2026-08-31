/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { HeightUnit, WeightUnit } from '../../types';
import {
  toCentimeters,
  fromCentimeters,
  toKilograms,
  fromKilograms,
  calculateBodyMetrics,
  HEIGHT_UNIT_LABELS,
  WEIGHT_UNIT_LABELS,
} from '../../utils/measurementUtils';
import { Button } from '../ui/Button';
import {
  Ruler,
  Scale,
  Sparkles,
  Check,
  ArrowRight,
  ShieldCheck,
  Info,
  Sliders,
  ChevronRight,
  X,
} from 'lucide-react';

interface FirstLoginMeasurementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FirstLoginMeasurementsModal({
  isOpen,
  onClose,
}: FirstLoginMeasurementsModalProps) {
  const { user, updateUser, showToast } = useApp();

  // Unit choices
  const [heightUnit, setHeightUnit] = useState<HeightUnit>(() => {
    return user.measurements?.heightUnit || 'ft_in';
  });

  const [weightUnit, setWeightUnit] = useState<WeightUnit>(() => {
    return user.measurements?.weightUnit || 'kg';
  });

  // State for raw inputs
  const [cmInput, setCmInput] = useState<string>('');
  const [metersInput, setMetersInput] = useState<string>('');
  const [inchesInput, setInchesInput] = useState<string>('');
  const [feetInput, setFeetInput] = useState<string>('5');
  const [inchPartInput, setInchPartInput] = useState<string>('9');

  const [weightInput, setWeightInput] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize from user measurements if already set
  useEffect(() => {
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
  }, [user.measurements]);

  // Compute canonical height in cm from active inputs
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

  // Compute canonical weight in kg from active inputs
  const currentWeightKg = useMemo(() => {
    const val = parseFloat(weightInput);
    return toKilograms(val, weightUnit);
  }, [weightInput, weightUnit]);

  // Sync converted values when user changes heightUnit
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

  // Sync converted values when user changes weightUnit
  const handleWeightUnitChange = (newUnit: WeightUnit) => {
    if (newUnit === weightUnit) return;

    if (currentWeightKg) {
      const convertedWeight = fromKilograms(currentWeightKg, newUnit);
      setWeightInput(convertedWeight ? String(convertedWeight) : '');
    }
    setWeightUnit(newUnit);
  };

  // Quick preset handlers
  const handleApplyPresetHeight = (cm: number) => {
    const conv = fromCentimeters(cm);
    setCmInput(String(conv.cm));
    setMetersInput(String(conv.meters));
    setInchesInput(String(conv.totalInches));
    setFeetInput(String(conv.feet));
    setInchPartInput(String(conv.inches));
  };

  const bodyMetrics = useMemo(() => {
    return calculateBodyMetrics(currentHeightCm, currentWeightKg);
  }, [currentHeightCm, currentWeightKg]);

  const handleSave = async (skip = false) => {
    try {
      setIsSubmitting(true);
      if (skip) {
        await updateUser({
          measurements: {
            ...user.measurements,
            hasCompletedFirstLoginMeasurements: true,
          },
        });
        showToast({
          title: 'Setup Skipped',
          description: 'You can update your body dimensions anytime in your Profile.',
          type: 'info',
        });
        onClose();
        return;
      }

      await updateUser({
        measurements: {
          heightCm: currentHeightCm,
          heightUnit,
          weightKg: currentWeightKg,
          weightUnit,
          hasCompletedFirstLoginMeasurements: true,
        },
      });

      showToast({
        title: 'Fit Profile Synchronized',
        description: 'Your height, weight, and silhouette proportions have been saved.',
        type: 'success',
      });

      onClose();
    } catch (err) {
      console.error(err);
      showToast({
        title: 'Failed to Save',
        description: 'An error occurred while saving your measurements.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto pb-28 sm:pb-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 my-auto mb-6 sm:my-auto max-h-[85vh] flex flex-col"
        >

          {/* Header Banner */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-6 sm:p-7 border-b border-slate-800">
            <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1.5 pr-6">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                    Initial Studio Calibration
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    First Login Setup
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-editorial">
                  Personalized Fit & Proportions
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
                  Calibrate your height & weight so the AI Stylist can tailor garment drape, jacket lengths, and vertical silhouette balance to your exact form.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSave(true)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-colors shrink-0"
                title="Skip for now"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* 1. Height Section with multi-unit support */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                    <Ruler className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-editorial">
                      Height Measurement
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Select your preferred measurement unit
                    </p>
                  </div>
                </div>

                {/* Unit Switcher Tabs */}
                <div className="flex items-center p-1 bg-slate-200/70 rounded-xl gap-1 self-start sm:self-auto">
                  {(['ft_in', 'cm', 'm', 'in'] as HeightUnit[]).map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => handleHeightUnitChange(unit)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                        heightUnit === unit
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                      }`}
                    >
                      {unit === 'ft_in' ? 'Feet & In' : unit.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Height Inputs */}
              <div>
                {heightUnit === 'ft_in' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
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
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                        />
                        <span className="absolute right-3 top-3 text-xs font-mono text-slate-400">
                          ft
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
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
                          className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                        />
                        <span className="absolute right-3 top-3 text-xs font-mono text-slate-400">
                          in
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {heightUnit === 'cm' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
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
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                      />
                      <span className="absolute right-3 top-3 text-xs font-mono text-slate-400">
                        cm
                      </span>
                    </div>
                  </div>
                )}

                {heightUnit === 'm' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
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
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                      />
                      <span className="absolute right-3 top-3 text-xs font-mono text-slate-400">
                        meters
                      </span>
                    </div>
                  </div>
                )}

                {heightUnit === 'in' && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
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
                        className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                      />
                      <span className="absolute right-3 top-3 text-xs font-mono text-slate-400">
                        inches
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Multi-unit conversion summary */}
              {currentHeightCm && (
                <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Equivalents:</span>
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <span>{fromCentimeters(currentHeightCm).feet}&apos; {fromCentimeters(currentHeightCm).inches}&quot;</span>
                    <span>•</span>
                    <span>{Math.round(currentHeightCm)} cm</span>
                    <span>•</span>
                    <span>{(currentHeightCm / 100).toFixed(2)} m</span>
                    <span>•</span>
                    <span>{(currentHeightCm / 2.54).toFixed(1)} in</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Weight Section with kg and lbs support */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-teal-800">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-editorial">
                      Weight Measurement
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Choose kilograms or pounds
                    </p>
                  </div>
                </div>

                {/* Weight Unit Switcher */}
                <div className="flex items-center p-1 bg-slate-200/70 rounded-xl gap-1 self-start sm:self-auto">
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
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5 font-mono">
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
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                  />
                  <span className="absolute right-3 top-3 text-xs font-mono text-slate-400">
                    {weightUnit}
                  </span>
                </div>
              </div>

              {/* Live Weight conversion summary */}
              {currentWeightKg && (
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Equivalents:</span>
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <span>{Math.round(currentWeightKg)} kg</span>
                    <span>•</span>
                    <span>{Math.round(currentWeightKg * 2.20462)} lbs</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Live Silhouette & Tailoring Proportions Preview */}
            {bodyMetrics && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950 font-editorial">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Calibrated Silhouette Insights</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${bodyMetrics.badgeColor}`}>
                    {bodyMetrics.category} (BMI {bodyMetrics.bmi})
                  </span>
                </div>

                <p className="text-slate-700 leading-relaxed text-[11px]">
                  {bodyMetrics.tailoringRecommendation}
                </p>
              </motion.div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                You can adjust your measurements and unit preferences at any time in your <strong>Profile</strong>.
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-slate-50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => handleSave(true)}
              className="text-xs text-slate-500 hover:text-slate-900 rounded-xl order-2 sm:order-1"
            >
              Skip for Now
            </Button>

            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              onClick={() => handleSave(false)}
              className="w-full sm:w-auto rounded-2xl px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg order-1 sm:order-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isSubmitting ? 'Saving Fit Profile...' : 'Save & Enter Atelier Studio'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
