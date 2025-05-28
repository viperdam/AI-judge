
import type { ComprehensiveProfileData } from '../types';

const COMPREHENSIVE_PROFILE_STORAGE_KEY = 'aiRelationshipAdvisorComprehensiveProfile_v2'; // New key for new data structure

export const saveProfileData = (profileData: ComprehensiveProfileData): void => {
  try {
    const serializedData = JSON.stringify(profileData);
    localStorage.setItem(COMPREHENSIVE_PROFILE_STORAGE_KEY, serializedData);
  } catch (error) {
    console.error("Error saving comprehensive profile data to localStorage:", error);
  }
};

export const loadProfileData = (): ComprehensiveProfileData | null => {
  try {
    const serializedData = localStorage.getItem(COMPREHENSIVE_PROFILE_STORAGE_KEY);
    if (serializedData === null) {
      return null;
    }
    return JSON.parse(serializedData) as ComprehensiveProfileData;
  } catch (error) {
    console.error("Error loading comprehensive profile data from localStorage:", error);
    localStorage.removeItem(COMPREHENSIVE_PROFILE_STORAGE_KEY); // Clear potentially corrupted data
    return null;
  }
};

export const clearProfileData = (): void => {
  try {
    localStorage.removeItem(COMPREHENSIVE_PROFILE_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing comprehensive profile data from localStorage:", error);
  }
};
