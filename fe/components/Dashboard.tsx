"use client";

import { useState } from "react";
import { HourBlock } from "./HourBlock";
import { TaskDialog } from "./TaskDialog";
import { DateSelector } from "./DateSelector";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task, Category } from "@/types/timeTracking";

interface DashboardProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  tasks: Task[];
  categories: Category[];
  onTaskUpdate: (task: Omit<Task, 'id'>) => void;
  onTaskRemove: (taskId: string) => void;
}

export function Dashboard({
  selectedDate,
  onDateChange,
  tasks,
  categories,
  onTaskUpdate,
  onTaskRemove
}: DashboardProps) {
  const { theme } = useTheme();
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleHourClick = (hour: number) => {
    setSelectedHour(hour);
    setShowTaskDialog(true);
  };

  const handleTaskSave = (taskData: any) => {
    const task = {
      ...taskData,
      date: selectedDate.toISOString().split('T')[0],
      hour: selectedHour!,
    };
    onTaskUpdate(task);
    setShowTaskDialog(false);
    setSelectedHour(null);
  };

  const handleTaskRemove = () => {
    if (selectedHour !== null) {
      const taskId = `${selectedDate.toISOString().split('T')[0]}-${selectedHour}`;
      onTaskRemove(taskId);
      setShowTaskDialog(false);
      setSelectedHour(null);
    }
  };

  const getTaskForHour = (hour: number) => {
    return tasks.find(task => task.hour === hour);
  };

  const existingTask = selectedHour !== null ? getTaskForHour(selectedHour) : null;

  return (
    <div className="space-y-8">
      {/* Date Selector */}
      <div className="flex justify-center">
        <DateSelector selectedDate={selectedDate} onDateChange={onDateChange} />
      </div>

      {/* Grid Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          {selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </h2>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Click on any hour to add or edit activities
        </p>
      </div>

      {/* 24-Hour Grid */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
          {hours.map(hour => (
            <HourBlock
              key={hour}
              hour={hour}
              task={getTaskForHour(hour)}
              onClick={() => handleHourClick(hour)}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <h3 className="text-lg font-semibold mb-6">Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-5 h-5 rounded-lg shadow-sm"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-semibold text-lg">{category.name}</span>
              </div>
              <div className="ml-8 space-y-2">
                {category.subcategories.map(sub => (
                  <div key={sub.id} className="flex items-center space-x-3 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: sub.color }}
                    />
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>{sub.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Dialog */}
      {showTaskDialog && selectedHour !== null && (
        <TaskDialog
          hour={selectedHour}
          existingTask={existingTask || undefined}
          categories={categories}
          onSave={handleTaskSave}
          onRemove={existingTask ? handleTaskRemove : undefined}
          onClose={() => {
            setShowTaskDialog(false);
            setSelectedHour(null);
          }}
        />
      )}
    </div>
  );
}