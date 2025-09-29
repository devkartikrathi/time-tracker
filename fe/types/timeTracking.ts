export interface Task {
  id: string;
  date: string; // YYYY-MM-DD format
  hour: number; // 0-23
  taskName: string;
  mainCategory: string;
  subcategory: string;
  color: string;
  wellBeingTags?: WellBeingTag[];
  duration: number; // hours (currently always 1)
}

export interface Subcategory {
  id: string;
  name: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  subcategories: Subcategory[];
}

export interface Goal {
  id: string;
  name: string;
  targetHours: number;
  categoryId: string;
  subcategoryId?: string;
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