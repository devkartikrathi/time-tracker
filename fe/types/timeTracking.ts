export type CategoryType = 'REST' | 'WORK' | 'OTHER'

// Hour data structure for the new daily task format
export interface HourData {
  taskName: string;
  category: CategoryType;
  subcategoryId: string;
  duration: number; // hours (currently always 1)
  // Optional: Include subcategory data for display
  subcategory?: {
    id: string;
    name: string;
    color: string;
    category: CategoryType;
  };
}

// New optimized daily task structure
export interface DailyTask {
  id: string;
  date: string; // YYYY-MM-DD format
  wellBeingTags: WellBeingTag[];
  hours: (HourData | null)[]; // Array of 24 hours, null for empty hours
}

// Legacy task structure - for backward compatibility with analytics
export interface Task {
  id: string;
  date: string; // YYYY-MM-DD format
  hour: number; // 0-23
  taskName: string;
  category: CategoryType;
  subcategoryId: string;
  wellBeingTags?: WellBeingTag[];
  duration: number; // hours (currently always 1)
  // Optional: Include subcategory data for display
  subcategory?: {
    id: string;
    name: string;
    color: string;
    category: CategoryType;
  };
}

export interface Subcategory {
  id: string;
  name: string;
  color: string;
  category: CategoryType;
}

export interface Category {
  id: CategoryType;
  name: string;
  color: string;
  subcategories: Subcategory[];
}

export interface Goal {
  id: string;
  name: string;
  targetHours: number;
  category: CategoryType;
  subcategoryId: string; // Required - goals must be for specific subcategories
}

export type WellBeingTag =
  | 'Physical'
  | 'Mental'
  | 'Social'
  | 'Spiritual'
  | 'Growth'
  | 'Family'
  | 'Mission'
  | 'Money'
  | 'Romance'
  | 'Friends'
  | 'Joy';