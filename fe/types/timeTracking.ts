export type CategoryType = 'REST' | 'WORK' | 'OTHER'

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