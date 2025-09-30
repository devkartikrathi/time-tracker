"use client";

import { useState, useEffect } from "react";
import { useUser } from '@clerk/nextjs';
import { MonthlyGrid } from "./MonthlyGrid";
import { Analytics } from "./Analytics";
import { CategorySetup } from "./CategorySetup";
import { GoalsTracking } from "./GoalsTracking";
import { Navbar } from "./Navbar";
// import { AnalyticsNavbar } from "./AnalyticsNavbar";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task, Category, Goal, WellBeingTag } from "@/types/timeTracking";
import { CATEGORY_LIST } from "@/lib/constants";

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
      } catch {}
    };
    load();
  }, []);

  // Load tasks when date changes - for MonthlyGrid, load entire month
  useEffect(() => {
    const loadTasks = async () => {
      try {
        if (activeTab === "dashboard") {
          // For MonthlyGrid, load tasks for the entire month
          const year = selectedDate.getFullYear();
          const month = selectedDate.getMonth();
          const startDate = new Date(year, month, 1);
          const endDate = new Date(year, month + 1, 0);
          
          const startDateStr = startDate.toISOString().split('T')[0];
          const endDateStr = endDate.toISOString().split('T')[0];
          
          const res = await fetch(`/api/tasks?startDate=${startDateStr}&endDate=${endDateStr}`);
          const json = await res.json();
          setTasks(json.data || []);
        } else {
          // For other views, load tasks for the specific date
          const date = selectedDate.toISOString().split('T')[0];
          const res = await fetch(`/api/tasks?date=${date}`);
          const json = await res.json();
          setTasks(json.data || []);
        }
      } catch {}
    };
    loadTasks();
  }, [selectedDate, activeTab]);

  const addOrUpdateTask = async (task: Omit<Task, 'id'>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: task.date,
          hour: task.hour,
          taskName: task.taskName,
          duration: task.duration,
          wellBeingTags: task.wellBeingTags || [],
          category: task.category,
          subcategoryId: task.subcategoryId,
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        const savedTask = result.data;
        
        // Update local state immediately for faster UI response
        setTasks(prev => {
          const existingIndex = prev.findIndex(t => 
            t.date === savedTask.date && t.hour === savedTask.hour
          );
          
          if (existingIndex >= 0) {
            // Update existing task
            const updated = [...prev];
            updated[existingIndex] = savedTask;
            return updated;
          } else {
            // Add new task
            return [...prev, savedTask].sort((a, b) => {
              if (a.date !== b.date) return a.date.localeCompare(b.date);
              return a.hour - b.hour;
            });
          }
        });
      }
    } catch {}
  };

  const removeTask = async (taskId: string) => {
    // Find task with this composed id or fallback to first match
    const target = tasks.find(t => t.id === taskId) || tasks.find(t => `${t.date}-${t.hour}` === taskId);
    if (!target) return;
    try {
      const response = await fetch(`/api/tasks/${target.id}`, { method: 'DELETE' });
      
      if (response.ok) {
        // Update local state immediately for faster UI response
        setTasks(prev => prev.filter(t => t.id !== target.id));
      }
    } catch {}
  };

  const updateCategories = async (_newCategories: Category[]) => {
    // Re-fetch subcategories from server and rebuild categories
    try {
      const res = await fetch('/api/subcategories');
      const json = await res.json();
      
      // Group subcategories by category
      const subcategories = json.data || [];
      const categoriesWithSubs = defaultCategories.map(cat => ({
        ...cat,
        subcategories: subcategories.filter((sub: any) => sub.category === cat.id)
      }));
      
      setCategories(categoriesWithSubs);
    } catch {}
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
              categories={categories}
              onTaskUpdate={addOrUpdateTask}
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
                const selectedDateStr = selectedDate.toISOString().split('T')[0];
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