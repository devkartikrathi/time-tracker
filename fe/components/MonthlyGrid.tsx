"use client";

import { useState } from "react";
import { format, getDaysInMonth, addMonths, subMonths } from "date-fns";
import { TaskDialog } from "./TaskDialog";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Task, Category } from "@/types/timeTracking";

interface MonthlyGridProps {
  selectedDate: Date;
  tasks: Task[];
  categories: Category[];
  onTaskUpdate: (task: Omit<Task, 'id'>) => void;
  onTaskRemove: (taskId: string) => void;
  onDateChange?: (date: Date) => void;
}

export function MonthlyGrid({
  selectedDate,
  tasks,
  categories,
  onTaskUpdate,
  onTaskRemove,
  onDateChange
}: MonthlyGridProps) {
  const { theme } = useTheme();
  const [selectedCell, setSelectedCell] = useState<{day: number, hour: number} | null>(null);
  const [selectedCells, setSelectedCells] = useState<{day: number, hour: number}[]>([]);
  const [isMultiSelecting, setIsMultiSelecting] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);

  // Navigation functions
  const goToPreviousMonth = () => {
    const newDate = subMonths(selectedDate, 1);
    onDateChange?.(newDate);
  };

  const goToNextMonth = () => {
    const newDate = addMonths(selectedDate, 1);
    onDateChange?.(newDate);
  };

  // Get the number of days in the current month
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const handleCellClick = (day: number, hour: number, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select mode
      setIsMultiSelecting(true);
      setSelectedCells(prev => {
        const cellKey = `${day}-${hour}`;
        const existingIndex = prev.findIndex(cell => `${cell.day}-${cell.hour}` === cellKey);
        
        if (existingIndex >= 0) {
          // Remove if already selected
          return prev.filter((_, index) => index !== existingIndex);
        } else {
          // Add to selection
          return [...prev, { day, hour }];
        }
      });
    } else {
      // If already in multi-select mode with a selection, open dialog without clearing selection
      if (isMultiSelecting && selectedCells.length > 0) {
        setSelectedCell(selectedCells[0]);
        setShowTaskDialog(true);
      } else {
        // Single select mode
        setSelectedCell({ day, hour });
        setSelectedCells([{ day, hour }]);
        setIsMultiSelecting(false);
        setShowTaskDialog(true);
      }
    }
  };

  const handleCellMouseDown = (day: number, hour: number, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
    }
  };

  const handleTaskSave = async (taskData: any) => {
    if (selectedCells.length > 0) {
      // Process tasks one by one with a small delay to avoid state conflicts
      for (let i = 0; i < selectedCells.length; i++) {
        const cell = selectedCells[i];
        const task = {
          ...taskData,
          date: `${year}-${String(month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`,
          hour: cell.hour,
        };
        onTaskUpdate(task);
        
        // Small delay to prevent state update conflicts
        if (i < selectedCells.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      
      setShowTaskDialog(false);
      setSelectedCell(null);
      setSelectedCells([]);
      setIsMultiSelecting(false);
    }
  };

  const handleTaskRemove = () => {
    if (selectedCells.length > 0) {
      selectedCells.forEach(cell => {
        const taskId = `${year}-${String(month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}-${cell.hour}`;
        onTaskRemove(taskId);
      });
      setShowTaskDialog(false);
      setSelectedCell(null);
      setSelectedCells([]);
      setIsMultiSelecting(false);
    }
  };

  const getTaskForCell = (day: number, hour: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.find(task => task.date === dateStr && task.hour === hour);
  };

  const isCellSelected = (day: number, hour: number) => {
    return selectedCells.some(cell => cell.day === day && cell.hour === hour);
  };

  const existingTask = selectedCell && !isMultiSelecting ? getTaskForCell(selectedCell.day, selectedCell.hour) : null;

  // Removed legend color map as legend UI is no longer displayed

  return (
    <div className="space-y-8 max-w-6xl mx-auto flex flex-col items-center">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 w-full max-w-4xl px-2 sm:px-0">
        <Button
          onClick={goToPreviousMonth}
          variant="outline"
          size="sm"
          className={`transition-all duration-200 ${
            theme === 'dark' 
              ? 'border-gray-700 hover:bg-gray-800 hover:border-gray-600' 
              : 'border-gray-300 hover:bg-gray-100 hover:border-gray-400'
          }`}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        
        <div className="text-center flex-1">
          <h2 className="text-xl sm:text-3xl font-semibold tracking-tight">
            {selectedDate.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long' 
            })}
          </h2>
        </div>
        
        <Button
          onClick={goToNextMonth}
          variant="outline"
          size="sm"
          className={`transition-all duration-200 ${
            theme === 'dark' 
              ? 'border-gray-700 hover:bg-gray-800 hover:border-gray-600' 
              : 'border-gray-300 hover:bg-gray-100 hover:border-gray-400'
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Legend removed as per request */}

      {/* Monthly Grid */}
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl p-3 sm:p-6 shadow-xl border border-gray-200/50 dark:border-gray-800/50 overflow-x-auto w-full max-w-4xl">
        <div className="min-w-max mx-auto">
          {/* Hour Headers */}
          <div className="flex mb-2">
            <div className="w-10 sm:w-12 h-8 flex items-center justify-center text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400">
              Day
            </div>
            {hours.map(hour => (
              <div 
                key={hour} 
                className="w-6 sm:w-8 h-6 sm:h-8 flex items-center justify-center text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700"
              >
                {hour}
              </div>
            ))}
          </div>

          {/* Grid Rows */}
          {days.map(day => (
            <div key={day} className="flex mb-0.5 sm:mb-1">
              {/* Day Label */}
              <div className="w-10 sm:w-12 h-6 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                {day}
              </div>
              
              {/* Hour Cells */}
              {hours.map(hour => {
                const task = getTaskForCell(day, hour);
                const category = task ? categories.find(cat => cat.id === task.category) : null;
                // Use subcategory data from the task object if available, otherwise fall back to finding it
                const subcategory = task?.subcategory || 
                  (task && category ? (category.subcategories.find(sub => sub.id === task.subcategoryId) || null) : null);
                
                const isSelected = isCellSelected(day, hour);
                
                return (
                  <button
                    key={`${day}-${hour}`}
                    onClick={(e) => handleCellClick(day, hour, e)}
                    onMouseDown={(e) => handleCellMouseDown(day, hour, e)}
                    className={`w-6 sm:w-8 h-6 sm:h-8 border-l border-b border-gray-200/60 dark:border-gray-700/60 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200 ${
                      task ? 'shadow-md hover:shadow-lg' : 'hover:shadow-sm'
                    } ${
                      isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                    }`}
                    style={{
                      backgroundColor: task 
                        ? (subcategory?.color || category?.color || 'transparent')
                        : isSelected 
                          ? 'rgba(59, 130, 246, 0.1)'
                          : 'transparent'
                    }}
                    title={task ? `${category?.name || 'Unknown'}: ${task.taskName}` : `Day ${day}, Hour ${hour}${isSelected ? ' (Selected)' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Task Dialog */}
      {showTaskDialog && (selectedCell || (selectedCells.length > 0 && isMultiSelecting)) && (
        <TaskDialog
          hour={selectedCell?.hour || 0}
          existingTask={existingTask || undefined}
          categories={categories}
          onSave={handleTaskSave}
          onRemove={existingTask ? handleTaskRemove : undefined}
          onClose={() => {
            setShowTaskDialog(false);
            setSelectedCell(null);
            setSelectedCells([]);
            setIsMultiSelecting(false);
          }}
          isMultiSelect={isMultiSelecting}
          selectedCount={selectedCells.length}
        />
      )}
    </div>
  );
}
