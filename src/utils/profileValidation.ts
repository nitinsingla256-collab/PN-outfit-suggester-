import { PersonalStyleProfile } from '../types';

export function isStyleProfileComplete(profile: PersonalStyleProfile | undefined): boolean {
  if (!profile) return false;
  return Boolean(
    profile.isCompleted || 
    (profile.preferredFit && Array.isArray(profile.preferredStyles) && profile.preferredStyles.length > 0)
  );
}

