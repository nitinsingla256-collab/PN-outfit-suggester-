/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HeightUnit, WeightUnit, UserMeasurements } from '../types';

export const HEIGHT_UNIT_LABELS: Record<HeightUnit, { label: string; short: string; placeholder: string; example: string }> = {
  ft_in: {
    label: 'Feet & Inches (ft & in)',
    short: 'ft / in',
    placeholder: 'e.g. 5 ft 10 in',
    example: "5' 10\"",
  },
  cm: {
    label: 'Centimeters (cm)',
    short: 'cm',
    placeholder: 'e.g. 178',
    example: '178 cm',
  },
  m: {
    label: 'Meters (m)',
    short: 'm',
    placeholder: 'e.g. 1.78',
    example: '1.78 m',
  },
  in: {
    label: 'Inches (in)',
    short: 'in',
    placeholder: 'e.g. 70',
    example: '70 in',
  },
};

export const WEIGHT_UNIT_LABELS: Record<WeightUnit, { label: string; short: string; placeholder: string; example: string }> = {
  kg: {
    label: 'Kilograms (kg)',
    short: 'kg',
    placeholder: 'e.g. 68',
    example: '68 kg',
  },
  lbs: {
    label: 'Pounds (lbs)',
    short: 'lbs',
    placeholder: 'e.g. 150',
    example: '150 lbs',
  },
};

/**
 * Converts any height representation to centimeters (canonical store).
 */
export function toCentimeters(
  value: {
    feet?: number;
    inches?: number;
    cm?: number;
    meters?: number;
    totalInches?: number;
  },
  unit: HeightUnit
): number | undefined {
  if (unit === 'cm') {
    if (value.cm === undefined || isNaN(value.cm) || value.cm <= 0) return undefined;
    return Math.round(value.cm * 10) / 10;
  }

  if (unit === 'm') {
    if (value.meters === undefined || isNaN(value.meters) || value.meters <= 0) return undefined;
    return Math.round(value.meters * 100 * 10) / 10;
  }

  if (unit === 'in') {
    if (value.totalInches === undefined || isNaN(value.totalInches) || value.totalInches <= 0) return undefined;
    return Math.round(value.totalInches * 2.54 * 10) / 10;
  }

  if (unit === 'ft_in') {
    const feet = value.feet || 0;
    const inches = value.inches || 0;
    if (feet <= 0 && inches <= 0) return undefined;
    const totalInches = feet * 12 + inches;
    return Math.round(totalInches * 2.54 * 10) / 10;
  }

  return undefined;
}

/**
 * Converts centimeters to specific unit presentation values.
 */
export function fromCentimeters(cm?: number): {
  cm: number | undefined;
  meters: number | undefined;
  totalInches: number | undefined;
  feet: number | undefined;
  inches: number | undefined;
} {
  if (!cm || cm <= 0 || isNaN(cm)) {
    return {
      cm: undefined,
      meters: undefined,
      totalInches: undefined,
      feet: undefined,
      inches: undefined,
    };
  }

  const meters = Math.round((cm / 100) * 100) / 100;
  const totalInches = Math.round((cm / 2.54) * 10) / 10;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round((totalInches % 12) * 10) / 10;

  if (inches >= 12) {
    feet += 1;
    inches = 0;
  }

  return {
    cm: Math.round(cm * 10) / 10,
    meters,
    totalInches,
    feet,
    inches,
  };
}

/**
 * Converts any weight representation to kilograms (canonical store).
 */
export function toKilograms(val: number | undefined, unit: WeightUnit): number | undefined {
  if (val === undefined || isNaN(val) || val <= 0) return undefined;
  if (unit === 'kg') return Math.round(val * 10) / 10;
  if (unit === 'lbs') return Math.round((val / 2.20462262) * 10) / 10;
  return undefined;
}

/**
 * Converts kilograms to specific weight unit.
 */
export function fromKilograms(kg?: number, unit: WeightUnit = 'kg'): number | undefined {
  if (kg === undefined || isNaN(kg) || kg <= 0) return undefined;
  if (unit === 'kg') return Math.round(kg * 10) / 10;
  if (unit === 'lbs') return Math.round(kg * 2.20462262 * 10) / 10;
  return undefined;
}

/**
 * Format height for display in any selected unit.
 */
export function formatHeight(heightCm?: number, unit: HeightUnit = 'cm'): string {
  if (!heightCm || heightCm <= 0) return 'Not configured';

  const converted = fromCentimeters(heightCm);
  switch (unit) {
    case 'ft_in':
      return `${converted.feet || 0}' ${converted.inches || 0}" (${Math.round(heightCm)} cm)`;
    case 'cm':
      return `${Math.round(heightCm)} cm`;
    case 'm':
      return `${converted.meters} m`;
    case 'in':
      return `${converted.totalInches} in`;
    default:
      return `${Math.round(heightCm)} cm`;
  }
}

/**
 * Format weight for display in any selected unit.
 */
export function formatWeight(weightKg?: number, unit: WeightUnit = 'kg'): string {
  if (!weightKg || weightKg <= 0) return 'Not configured';

  if (unit === 'lbs') {
    const lbs = Math.round(weightKg * 2.20462262);
    return `${lbs} lbs (${Math.round(weightKg)} kg)`;
  }
  return `${Math.round(weightKg)} kg`;
}

/**
 * Calculate BMI and sartorial silhouette proportion category.
 */
export function calculateBodyMetrics(heightCm?: number, weightKg?: number) {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    return null;
  }

  const heightMeters = heightCm / 100;
  const bmi = Math.round((weightKg / (heightMeters * heightMeters)) * 10) / 10;

  let category = 'Balanced Proportions';
  let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let tailoringRecommendation = 'Standard luxury tailoring cuts draped with clean vertical alignment.';

  if (bmi < 18.5) {
    category = 'Slender & Elongated';
    badgeColor = 'bg-sky-50 text-sky-800 border-sky-200';
    tailoringRecommendation = 'Structured tailoring, layered knits, and horizontal textures (e.g. corduroy, heavier gauge wool) add volume and architectural presence.';
  } else if (bmi >= 18.5 && bmi < 25) {
    category = 'Harmonious Silhouette';
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    tailoringRecommendation = 'Universal fit flexibility. Flattering in both structured Italian tailoring and relaxed, minimalist draping.';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Athletic / Solid Form';
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
    tailoringRecommendation = 'Unstructured blazers, vertical seam details, single-breasted coats, and slightly tapered trousers maintain sleek vertical lines.';
  } else {
    category = 'Substantial / Generous Fit';
    badgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';
    tailoringRecommendation = 'Monochromatic tonal layering, elongated outerwear hems, and high-rise pleated trousers optimize comfort and statuesque posture.';
  }

  // Height specific nuance
  let heightCategory = 'Average Stature';
  if (heightCm < 160) {
    heightCategory = 'Petite Frame';
  } else if (heightCm > 183) {
    heightCategory = 'Tall & Commanding';
  }

  return {
    bmi,
    category,
    badgeColor,
    heightCategory,
    tailoringRecommendation,
  };
}
