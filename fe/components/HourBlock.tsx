"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task } from "@/types/timeTracking";

interface HourBlockProps {
  hour: number;
  task?: Task;
  onClick: () => void;
}

export function HourBlock({ hour, task, onClick }: HourBlockProps) {
  const { theme } = useTheme();
  
  const formatHour = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "aspect-square border rounded-xl cursor-pointer transition-all duration-300",
        "hover:scale-105 hover:shadow-lg flex flex-col items-center justify-center p-2 group",
        "backdrop-blur-sm",
        task
          ? theme === 'dark' ? "border-gray-600 shadow-lg" : "border-gray-300 shadow-lg"
          : theme === 'dark' 
            ? "border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
            : "border-gray-200 hover:border-gray-300 hover:bg-white/50"
      )}
      style={{
        backgroundColor: task 
          ? `${task.color}CC` // Add transparency
          : theme === 'dark' 
            ? 'rgba(31, 41, 55, 0.3)' 
            : 'rgba(255, 255, 255, 0.3)',
      }}
    >
      <div className={`text-xs font-semibold text-center transition-colors ${
        task 
          ? 'text-white drop-shadow-sm' 
          : theme === 'dark' 
            ? 'text-gray-400 group-hover:text-gray-200' 
            : 'text-gray-500 group-hover:text-gray-700'
      }`}>
        {formatHour(hour)}
      </div>
      {task && (
        <div className="text-xs text-center mt-1 font-medium text-white drop-shadow-sm truncate w-full px-1">
          {task.taskName}
        </div>
      )}
    </div>
  );
}