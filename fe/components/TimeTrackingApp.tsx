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

const defaultCategories: Category[] = [
  {
    id: "rest",
    name: "REST",
    color: "#9ca3af", // Gray (improves readability in dark mode)
    subcategories: [
      { id: "sleep", name: "Sleep", color: "#1f2937" }, // Darker gray
      { id: "break", name: "Break", color: "#4b5563" }, // Medium gray
      { id: "nap", name: "Nap", color: "#6b7280" }, // Base gray
      { id: "relaxation", name: "Relaxation", color: "#9ca3af" }, // Light gray
      { id: "meditation", name: "Meditation", color: "#d1d5db" }, // Very light gray
      { id: "prayer", name: "Prayer", color: "#e5e7eb" }, // Lightest gray
      { id: "reflection", name: "Reflection", color: "#f3f4f6" }, // Almost white
    ]
  },
  {
    id: "work",
    name: "WORK",
    color: "#00ff00", // Bright green
    subcategories: [
      { id: "meetings", name: "Meetings", color: "#14532d" }, // Dark green
      { id: "coding", name: "Coding", color: "#166534" }, // Darker green
      { id: "planning", name: "Planning", color: "#16a34a" }, // Green
      { id: "emails", name: "Emails", color: "#22c55e" }, // Light green
      { id: "studying", name: "Studying", color: "#4ade80" }, // Lighter green
      { id: "reading", name: "Reading", color: "#86efac" }, // Very light green
      { id: "research", name: "Research", color: "#bbf7d0" }, // Lightest green
      { id: "practice", name: "Practice", color: "#dcfce7" }, // Almost white green
    ]
  },
  {
    id: "other",
    name: "OTHER",
    color: "#ff0000", // Bright red
    subcategories: [
      { id: "wasted", name: "Wasted", color: "#ff0000" }, // Bright red
      { id: "others_general", name: "Others", color: "#fda4af" }, // Pink
      { id: "spiritual", name: "Spiritual Learning", color: "#f59e0b" }, // Orange
      { id: "cooking", name: "Cooking", color: "#ea580c" }, // Dark orange
      { id: "cleaning", name: "Cleaning", color: "#f97316" }, // Base orange
      { id: "shopping", name: "Shopping", color: "#fb923c" }, // Light orange
      { id: "commute", name: "Commute", color: "#fdba74" }, // Lighter orange
      { id: "entertainment", name: "Entertainment", color: "#fed7aa" }, // Very light orange
      { id: "gaming", name: "Gaming", color: "#ffedd5" }, // Lightest orange
      { id: "social_media", name: "Social Media", color: "#fef3c7" }, // Almost white orange
      { id: "exercise", name: "Exercise", color: "#fbbf24" }, // Yellow-orange
      { id: "hobbies", name: "Hobbies", color: "#f59e0b" }, // Amber
      { id: "misc", name: "Miscellaneous", color: "#d97706" }, // Dark amber
    ]
  }
];

const defaultGoals: Goal[] = [
  { id: "rest-goal", name: "Rest Time", targetHours: 8, categoryId: "rest", subcategoryId: "sleep" },
  { id: "work-goal", name: "Work Time", targetHours: 8, categoryId: "work", subcategoryId: "meetings" },
  { id: "other-goal", name: "Other Activities", targetHours: 4, categoryId: "other", subcategoryId: "exercise" }
];

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

  // Generate tasks for current month for demo purposes (deterministic, full-day coverage)
  useEffect(() => {
    const getCategoryById = (id: string) => categories.find(c => c.id === id);
    const getSubcategory = (categoryId: string, subId: string) => {
      const cat = getCategoryById(categoryId);
      return cat?.subcategories.find(s => s.id === subId) || null;
    };

    const chooseActivity = (day: number, hour: number) => {
      // Night and early morning mostly REST
      if (hour <= 6 || hour >= 22) return { cat: 'rest', sub: 'sleep' } as const;

      const h = (day * 37 + hour * 13) % 100; // deterministic hash

      // 7-10am: more pink/others, some work, small spiritual, occasional wasted
      if (hour >= 7 && hour <= 10) {
        if (h < 65) return { cat: 'other', sub: 'others_general' } as const;
        if (h < 80) return { cat: 'work', sub: 'meetings' } as const;
        if (h < 90) return { cat: 'work', sub: 'studying' } as const;
        if (h < 96) return { cat: 'other', sub: 'wasted' } as const;
        return { cat: 'other', sub: 'spiritual' } as const;
      }

      // 11-20 core hours following the image's mix
      if (hour >= 11 && hour <= 20) {
        if (h < 50) return { cat: 'other', sub: 'others_general' } as const; // pink
        if (h < 75) return { cat: 'work', sub: 'coding' } as const;          // green
        if (h < 90) return { cat: 'work', sub: 'studying' } as const;        // dark green
        if (h < 97) return { cat: 'other', sub: 'wasted' } as const;         // red
        return { cat: 'other', sub: 'spiritual' } as const;                  // orange
      }

      // 21: wind down
      if (hour === 21) {
        if (h < 40) return { cat: 'other', sub: 'others_general' } as const;
        if (h < 60) return { cat: 'work', sub: 'reading' } as const;
        if (h < 80) return { cat: 'other', sub: 'spiritual' } as const;
        return { cat: 'rest', sub: 'relaxation' } as const;
      }

      return { cat: 'rest', sub: 'sleep' } as const;
    };

    const generateDemoTasks = () => {
      const demoTasks: Task[] = [];
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateStr = date.toISOString().split('T')[0];
        for (let hour = 0; hour < 24; hour++) {
          const { cat, sub } = chooseActivity(day, hour);
          const category = getCategoryById(cat);
          if (!category) continue;
          const foundSub = getSubcategory(cat, sub) || category.subcategories[0] || null;
          const safeSub = foundSub || { id: category.id, name: category.name, color: category.color };

          const wellBeingTags: WellBeingTag[] = [];
          if (cat === 'work') wellBeingTags.push('Mental', 'Growth');
          if (sub === 'spiritual') wellBeingTags.push('Spiritual');

          demoTasks.push({
            id: `${dateStr}-${hour}`,
            date: dateStr,
            hour,
            taskName: `${safeSub.name}`,
            mainCategory: category.id,
            subcategory: safeSub.id,
            color: safeSub.color,
            wellBeingTags,
            duration: 1
          });
        }
      }
      setTasks(demoTasks);
    };

    generateDemoTasks();
  }, [categories]);

  const addOrUpdateTask = (task: Omit<Task, 'id'>) => {
    const taskId = `${task.date}-${task.hour}`;
    console.log('addOrUpdateTask called with:', { task, taskId });
    setTasks(prev => {
      const existingIndex = prev.findIndex(t => t.id === taskId);
      const newTask = { ...task, id: taskId };
      
      console.log('Task processing:', { existingIndex, newTask, prevLength: prev.length });
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = newTask;
        console.log('Updated existing task');
        return updated;
      } else {
        console.log('Added new task');
        return [...prev, newTask];
      }
    });
  };

  const removeTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const updateCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
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
                tasks={tasks}
                categories={categories}
                goals={goals}
                selectedDate={selectedDate}
                activeView={activeAnalyticsView}
                onViewChange={setActiveAnalyticsView}
                onCreateGoal={(g) => setGoals(prev => [...prev, { id: `goal-${Date.now()}`, ...g }])}
                onUpdateGoal={(g) => setGoals(prev => prev.map(x => x.id === g.id ? g : x))}
                onDeleteGoal={(id) => setGoals(prev => prev.filter(x => x.id !== id))}
              />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {(() => {
                const selectedDateStr = selectedDate.toISOString().split('T')[0];
                const todayTasks = tasks.filter(t => t.date === selectedDateStr);
                return (
                  <GoalsTracking
                    tasks={todayTasks}
                    categories={categories}
                    goals={goals}
                    onCreateGoal={(g) => setGoals(prev => [...prev, { id: `goal-${Date.now()}`, ...g }])}
                    onUpdateGoal={(g) => setGoals(prev => prev.map(x => x.id === g.id ? g : x))}
                    onDeleteGoal={(id) => setGoals(prev => prev.filter(x => x.id !== id))}
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