"use client";

import { useState } from "react";
import { format, getDaysInMonth, addMonths, subMonths } from "date-fns";
import { TaskDialog } from "./TaskDialog";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Task, Category, DailyTask, HourData, WellBeingTag } from "@/types/timeTracking";
import { getTaskForHour, updateHourInDailyTask } from "@/lib/task-converter";

interface MonthlyGridProps {
  selectedDate: Date;
  tasks: Task[]; // Keep for backward compatibility
  dailyTasks: DailyTask[]; // New optimized daily tasks
  categories: Category[];
  onTaskUpdate: (task: Omit<Task, 'id'>) => void; // Keep for backward compatibility
  onDailyTaskUpdate: (dailyTask: DailyTask) => void; // New daily task update
  onTaskRemove: (taskId: string) => void;
  onDateChange?: (date: Date) => void;
}

export function MonthlyGrid({
  selectedDate,
  tasks,
  dailyTasks,
  categories,
  onTaskUpdate,
  onDailyTaskUpdate,
  onTaskRemove,
  onDateChange
}: MonthlyGridProps) {
  const { theme } = useTheme();
  const [selectedCell, setSelectedCell] = useState<{day: number, hour: number} | null>(null);
  const [selectedCells, setSelectedCells] = useState<{day: number, hour: number}[]>([]);
  const [isMultiSelecting, setIsMultiSelecting] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showDayTagsDialog, setShowDayTagsDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedDayTags, setSelectedDayTags] = useState<WellBeingTag[]>([]);

  const wellBeingOptions: WellBeingTag[] = [
    'Physical','Mental','Social','Spiritual','Growth','Family','Mission','Money','Romance','Friends','Joy'
  ];

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

  const handleDayLabelClick = (day: number) => {
    setSelectedDay(day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dailyTask = dailyTasks.find(dt => dt.date === dateStr);
    setSelectedDayTags(dailyTask?.wellBeingTags || []);
    setShowDayTagsDialog(true);
  };

  const toggleDayTag = (tag: WellBeingTag) => {
    setSelectedDayTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const saveDayTags = () => {
    if (selectedDay == null) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    let dailyTask = dailyTasks.find(dt => dt.date === dateStr);
    if (!dailyTask) {
      dailyTask = {
        id: `temp-${dateStr}`,
        date: dateStr,
        wellBeingTags: [...selectedDayTags],
        hours: Array(24).fill(null)
      };
    } else {
      dailyTask = {
        ...dailyTask,
        wellBeingTags: [...selectedDayTags]
      };
    }
    onDailyTaskUpdate(dailyTask);
    setShowDayTagsDialog(false);
    setSelectedDay(null);
  };

  const handleTaskSave = async (taskData: any) => {
    if (selectedCells.length > 0) {
      // Group cells by date for daily task updates
      const cellsByDate = new Map<string, {day: number, hour: number}[]>();
      
      selectedCells.forEach(cell => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
        if (!cellsByDate.has(dateStr)) {
          cellsByDate.set(dateStr, []);
        }
        cellsByDate.get(dateStr)!.push(cell);
      });

      // Process each date
      for (const [dateStr, cells] of Array.from(cellsByDate.entries())) {
        // Find or create daily task for this date
        let dailyTask = dailyTasks.find(dt => dt.date === dateStr);
        
        if (!dailyTask) {
          // Create new daily task
          dailyTask = {
            id: `temp-${dateStr}`,
            date: dateStr,
            wellBeingTags: taskData.wellBeingTags || [],
            hours: Array(24).fill(null)
          };
        }

        // Update each hour in the daily task
        cells.forEach((cell: {day: number, hour: number}) => {
          const hourData: HourData = {
            taskName: taskData.taskName,
            category: taskData.category,
            subcategoryId: taskData.subcategoryId,
            duration: taskData.duration || 1,
            subcategory: categories
              .find(cat => cat.id === taskData.category)
              ?.subcategories.find(sub => sub.id === taskData.subcategoryId)
          };

          dailyTask = updateHourInDailyTask(dailyTask!, cell.hour, hourData);
        });

        // Update well-being tags for the entire day
        if (taskData.wellBeingTags) {
          dailyTask.wellBeingTags = Array.from(new Set([...dailyTask.wellBeingTags, ...taskData.wellBeingTags]));
        }

        // Call the daily task update handler
        onDailyTaskUpdate(dailyTask);
      }
      
      setShowTaskDialog(false);
      setSelectedCell(null);
      setSelectedCells([]);
      setIsMultiSelecting(false);
    }
  };

  const handleTaskRemove = () => {
    if (selectedCells.length > 0) {
      // Group cells by date for daily task updates
      const cellsByDate = new Map<string, {day: number, hour: number}[]>();
      
      selectedCells.forEach(cell => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
        if (!cellsByDate.has(dateStr)) {
          cellsByDate.set(dateStr, []);
        }
        cellsByDate.get(dateStr)!.push(cell);
      });

      // Process each date
      for (const [dateStr, cells] of Array.from(cellsByDate.entries())) {
        // Find daily task for this date
        let dailyTask = dailyTasks.find(dt => dt.date === dateStr);
        
        if (dailyTask) {
          // Update each hour to null in the daily task
          cells.forEach((cell: {day: number, hour: number}) => {
            dailyTask = updateHourInDailyTask(dailyTask!, cell.hour, null);
          });

          // Check if all hours are null - if so, we might want to remove the entire daily task
          const hasAnyTasks = dailyTask.hours.some(hour => hour !== null);
          
          if (hasAnyTasks) {
            // Update the daily task with cleared hours
            onDailyTaskUpdate(dailyTask);
          } else {
            // All hours are empty, remove the daily task entirely
            // We'll need to add a remove daily task handler
            // For now, just update with empty hours
            onDailyTaskUpdate(dailyTask);
          }
        }
      }
      
      setShowTaskDialog(false);
      setSelectedCell(null);
      setSelectedCells([]);
      setIsMultiSelecting(false);
    }
  };

  const getTaskForCell = (day: number, hour: number): Task | null => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Try to get from daily tasks first (new optimized format)
    const dailyTask = dailyTasks.find(dt => dt.date === dateStr);
    if (dailyTask) {
      const hourData = getTaskForHour(dailyTask, hour);
      if (hourData) {
        return {
          id: `${dailyTask.id}-${hour}`,
          date: dateStr,
          hour: hour,
          taskName: hourData.taskName,
          category: hourData.category,
          subcategoryId: hourData.subcategoryId,
          wellBeingTags: dailyTask.wellBeingTags,
          duration: hourData.duration,
          subcategory: hourData.subcategory
        };
      }
    }
    
    // Fallback to legacy individual tasks
    const legacyTask = tasks.find(task => task.date === dateStr && task.hour === hour);
    if (legacyTask) {
      return legacyTask;
    }
    
    return null;
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
          <h2 className="text-lg sm:text-2xl font-semibold tracking-tight">
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
          {days.map(day => {
            const hasTasksForDay = tasks.some(task => {
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              return task.date === dateStr;
            });
            
            return (
            <div key={day} className="flex mb-0.5 sm:mb-1">
              {/* Day Label */}
              <div onClick={() => handleDayLabelClick(day)} className={`w-10 sm:w-12 h-6 sm:h-8 flex items-center justify-center text-xs sm:text-sm font-medium border-r border-gray-200 dark:border-gray-700 cursor-pointer ${
                hasTasksForDay 
                  ? 'text-gray-900 dark:text-gray-100 font-semibold' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
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
                    className={`w-6 sm:w-8 h-6 sm:h-8 border-l border-b transition-all duration-200 ${
                      theme === 'dark' 
                        ? 'border-gray-700/60 hover:bg-gray-700/50' 
                        : 'border-gray-200/60 hover:bg-gray-100/50'
                    } ${
                      task ? 'shadow-md hover:shadow-lg' : 'hover:shadow-sm'
                    } ${
                      isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                    }`}
                    style={{
                      backgroundColor: task 
                        ? (subcategory?.color || category?.color || 'transparent')
                        : isSelected 
                          ? 'rgba(59, 130, 246, 0.1)'
                          : theme === 'dark'
                            ? 'rgba(17, 24, 39, 0.5)' // Darker background for empty cells in dark mode
                            : 'rgba(249, 250, 251, 0.5)' // Light background for empty cells in light mode
                    }}
                    title={task ? `${category?.name || 'Unknown'}: ${task.taskName}` : `Day ${day}, Hour ${hour}${isSelected ? ' (Selected)' : ''}`}
                  />
                );
              })}
            </div>
            );
          })}
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

      {/* Day Tags Dialog */}
      {showDayTagsDialog && selectedDay !== null && (
        <Dialog open onOpenChange={() => setShowDayTagsDialog(false)}>
          <DialogContent className={`sm:max-w-[425px] ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
            <DialogHeader>
              <DialogTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                Set Well-being Tags - {format(new Date(year, month, selectedDay), 'MMM d, yyyy')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-2">
              <div className="space-y-3">
                <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Well-being Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {wellBeingOptions.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedDayTags.includes(tag) ? 'default' : 'outline'}
                      className={`cursor-pointer transition-all duration-200 text-xs ${
                        selectedDayTags.includes(tag)
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : theme === 'dark'
                            ? 'border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400'
                      }`}
                      onClick={() => toggleDayTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  className={theme === 'dark' ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}
                  onClick={() => setShowDayTagsDialog(false)}
                >
                  Cancel
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" onClick={saveDayTags}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
