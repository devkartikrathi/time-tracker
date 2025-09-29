"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function DateSelector({ selectedDate, onDateChange }: DateSelectorProps) {
  const { theme } = useTheme();
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="flex items-center justify-center space-x-4">
      <Button
        variant="outline"
        size="sm"
        onClick={goToPreviousDay}
        className={theme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <div className="text-center">
        <Button
          variant={isToday ? "secondary" : "outline"}
          onClick={goToToday}
          className={theme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}
        >
          <Calendar className="w-4 h-4 mr-2" />
          {isToday ? "Today" : "Go to Today"}
        </Button>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={goToNextDay}
        className={theme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}