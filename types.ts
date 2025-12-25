
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

export enum ActivityLevel {
  SEDENTARY = 'SEDENTARY', // Little or no exercise
  LIGHT = 'LIGHT', // Light exercise 1-3 days/week
  MODERATE = 'MODERATE', // Moderate exercise 3-5 days/week
  ACTIVE = 'ACTIVE', // Hard exercise 6-7 days/week
  VERY_ACTIVE = 'VERY_ACTIVE' // Very hard exercise & physical job
}

export enum Goal {
  LOSE_WEIGHT = 'LOSE_WEIGHT',
  MAINTAIN = 'MAINTAIN',
  GAIN_MUSCLE = 'GAIN_MUSCLE'
}

export type MealCategory = 'DESAYUNO' | 'ALMUERZO' | 'CENA' | 'SNACK';

export interface UserProfile {
  name: string;
  gender: Gender;
  age: number;
  height: number; // cm
  weight: number; // kg
  activityLevel: ActivityLevel;
  goal: Goal;
  targetCalories: number; // Calculated daily goal
  macroTargets: Macros; // Calculated gram goals
  hasOnboarded: boolean;
}

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  macros: Macros;
  timestamp: number;
  description: string; // The raw input
  category: MealCategory;
}

export interface Exercise {
  id: string;
  name: string;
  caloriesBurned: number;
  durationMinutes: number;
  timestamp: number;
  scheduledTime?: string; // HH:mm format
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  meals: Meal[];
  exercises: Exercise[];
}

export interface Suggestion {
  name: string;
  calories: number;
  description: string;
}

export interface ActivitySuggestion {
  activity: string; // Name of exercise
  details: string; // "4 series x 12 reps al fallo"
  technique: string; // "Codos pegados, baja lento"
  durationMinutes: number;
  caloriesBurned: number;
  intensity: string;
  icon?: string; // Optional UI helper
  homeAlternative: {
    activity: string;
    details: string;
    technique: string;
  };
}

export interface Prognosis {
  prediction: string; // "Perderás 0.5kg esta semana"
  advice: string;
  status: 'ON_TRACK' | 'SLOW' | 'WARNING';
}
