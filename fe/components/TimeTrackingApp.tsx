"use client";

import { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { MonthlyGrid } from "./MonthlyGrid";
import { Analytics } from "./Analytics";
import { CategorySetup } from "./CategorySetup";
import { GoalsTracking } from "./GoalsTracking";
import { Navbar } from "./Navbar";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task, Category, Goal, WellBeingTag, DailyTask } from "@/types/timeTracking";
import { CATEGORY_LIST } from "@/lib/constants";
import { convertDailyTaskToTasks } from "@/lib/task-converter";
import { toast } from "sonner";

// Use constants for categories
const defaultCategories: Category[] = CATEGORY_LIST.map(cat => ({
  ...cat,
  subcategories: []
}));

const defaultGoals: Goal[] = [];

export function TimeTrackingApp() {
  const { theme } = useTheme();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"dashboard" | "analytics" | "goals">("dashboard");
  const [activeAnalyticsView, setActiveAnalyticsView] = useState<"overview" | "goals" | "trends">("overview");
  const [showCategorySetup, setShowCategorySetup] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [goals, setGoals] = useState<Goal[]>(defaultGoals);

  // Load subcategories and goals on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [subcatsRes, goalsRes] = await Promise.all([
          fetch('/api/subcategories'),
          fetch('/api/goals')
        ]);
        
        if (!subcatsRes.ok || !goalsRes.ok) {
          throw new Error('Failed to load data');
        }
        
        const subcatsJson = await subcatsRes.json();
        const goalsJson = await goalsRes.json();
        
        // Group subcategories by category
        const subcategories = subcatsJson.data || [];
        const categoriesWithSubs = defaultCategories.map(cat => ({
          ...cat,
          subcategories: subcategories.filter((sub: any) => sub.category === cat.id.toUpperCase())
        }));
        
        setCategories(categoriesWithSubs);
        setGoals(goalsJson.data || []);
      } catch (error) {
        console.error('Error loading categories and goals:', error);
        toast.error('Failed to load categories and goals. Please refresh the page.');
      }
    };
    load();
  }, []);

  // Load tasks when date changes - for MonthlyGrid, load entire month
  useEffect(() => {
    const loadTasks = async () => {
      try {
        if (activeTab === "dashboard") {
          // For MonthlyGrid, load daily tasks for the entire month (optimized)
          const year = selectedDate.getFullYear();
          const month = selectedDate.getMonth();
          const startDate = new Date(year, month, 1);
          const endDate = new Date(year, month + 1, 0);
          
          // Format dates as YYYY-MM-DD without timezone issues
          const startDateStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
          const endDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`;
          
          // Load daily tasks (new optimized format)
          const dailyTasksRes = await fetch(`/api/daily-tasks?startDate=${startDateStr}&endDate=${endDateStr}`);
          
          if (!dailyTasksRes.ok) {
            throw new Error('Failed to load daily tasks');
          }
          
          const dailyTasksJson = await dailyTasksRes.json();
          setDailyTasks(dailyTasksJson.data || []);
          
          // Convert daily tasks to individual tasks for backward compatibility
          const allTasks: Task[] = [];
          (dailyTasksJson.data || []).forEach((dailyTask: DailyTask) => {
            const convertedTasks = convertDailyTaskToTasks(dailyTask);
            allTasks.push(...convertedTasks);
          });
          setTasks(allTasks);
        } else {
          // For other views, load daily tasks for the specific date
          const date = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
          const dailyTasksRes = await fetch(`/api/daily-tasks?date=${date}`);
          
          if (!dailyTasksRes.ok) {
            throw new Error('Failed to load daily tasks');
          }
          
          const dailyTasksJson = await dailyTasksRes.json();
          setDailyTasks(dailyTasksJson.data || []);
          
          // Convert daily tasks to individual tasks for backward compatibility
          const allTasks: Task[] = [];
          (dailyTasksJson.data || []).forEach((dailyTask: DailyTask) => {
            const convertedTasks = convertDailyTaskToTasks(dailyTask);
            allTasks.push(...convertedTasks);
          });
          setTasks(allTasks);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
        toast.error('Failed to load tasks. Please try again.');
      }
    };
    loadTasks();
  }, [selectedDate, activeTab]);

  // Legacy function for backward compatibility - no longer used
  const addOrUpdateTask = async (task: Omit<Task, 'id'>) => {
    // This function is kept for backward compatibility but should not be called
  };

  const updateDailyTask = async (dailyTask: DailyTask) => {
    try {
      const response = await fetch('/api/daily-tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dailyTask.date,
          hours: dailyTask.hours,
          wellBeingTags: dailyTask.wellBeingTags
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update task');
      }
      
      const result = await response.json();
      const savedDailyTask = result.data;
      
      // Update local state immediately for faster UI response
      setDailyTasks(prev => {
        const existingIndex = prev.findIndex(dt => dt.date === savedDailyTask.date);
        
        if (existingIndex >= 0) {
          // Update existing daily task
          const updated = [...prev];
          updated[existingIndex] = savedDailyTask;
          return updated;
        } else {
          // Add new daily task
          return [...prev, savedDailyTask].sort((a, b) => a.date.localeCompare(b.date));
        }
      });
      
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update task. Please try again.');
    }
  };

  // Legacy function for backward compatibility - no longer used
  const removeTask = async (taskId: string) => {
    // This function is kept for backward compatibility but should not be called
  };

  const updateCategories = async (_newCategories: Category[]) => {
    // Re-fetch subcategories from server and rebuild categories
    try {
      const res = await fetch('/api/subcategories');
      
      if (!res.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const json = await res.json();
      
      // Group subcategories by category
      const subcategories = json.data || [];
      const categoriesWithSubs = defaultCategories.map(cat => ({
        ...cat,
        subcategories: subcategories.filter((sub: any) => sub.category === cat.id)
      }));
      
      setCategories(categoriesWithSubs);
      toast.success('Categories updated successfully!');
    } catch (error) {
      console.error('Error updating categories:', error);
      toast.error('Failed to update categories. Please try again.');
    }
  };


  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Main Navbar */}
      <Navbar 
        isAuthenticated={true} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onCategoriesClick={() => setShowCategorySetup(true)}
        activeAnalyticsView={activeAnalyticsView}
        onAnalyticsViewChange={setActiveAnalyticsView}
      />

      {/* Analytics sub-navbar removed */}

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Main Content */}
        <div className="w-full">
          {activeTab === "dashboard" ? (
            <MonthlyGrid
              selectedDate={selectedDate}
              tasks={tasks}
              dailyTasks={dailyTasks}
              categories={categories}
              onTaskUpdate={addOrUpdateTask}
              onDailyTaskUpdate={updateDailyTask}
              onTaskRemove={removeTask}
              onDateChange={setSelectedDate}
            />
          ) : activeTab === "analytics" ? (
            <div className="max-w-6xl mx-auto">
              <Analytics
                categories={categories}
                selectedDate={selectedDate}
                activeView={activeAnalyticsView}
                onViewChange={setActiveAnalyticsView}
              />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {(() => {
                const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
                const todayTasks = tasks.filter(t => t.date === selectedDateStr);
                return (
                  <GoalsTracking
                    categories={categories}
                    selectedDate={selectedDate}
                  />
                );
              })()}
            </div>
          )}
        </div>

        {/* Category Setup Modal */}
        {showCategorySetup && (
          <CategorySetup
            categories={categories}
            onSave={updateCategories}
            onClose={() => setShowCategorySetup(false)}
          />
        )}
      </div>
    </div>
  );
}