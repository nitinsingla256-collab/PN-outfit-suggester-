import { PersonalStyleProfile } from '../types';

export function isStyleProfileComplete(profile: PersonalStyleProfile | undefined): boolean {
  if (!profile) return false;

  // Required core fields
  if (!profile.age) return false;
  if (!profile.gender) return false;
  if (!profile.heightCm) return false;
  if (!profile.weightKg) return false;

  // Photo & Analysis required
  if (!profile.hasPhotoAnalyzed) return false;
  if (!profile.visualAnalysis) return false;

  // Preferences required
  if (!profile.preferredFit) return false;
  if (!profile.preferredStyles || profile.preferredStyles.length === 0) return false;
  if (!profile.preferredColors || profile.preferredColors.length === 0) return false;

  // Sizing
  if (!profile.topSize || !profile.bottomSize || !profile.shoeSize) return false;

  // User confirmation
  if (!profile.lastConfirmedAt) return false;
  if (!profile.isCompleted) return false;

  return true;
}
