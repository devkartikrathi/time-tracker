"use client";

import { useState } from "react";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { GoalsTracking } from "./GoalsTracking";
import { WellBeingWheel } from "./WellBeingWheel";
import { TrendsChart } from "./TrendsChart";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task, Category, Goal } from "@/types/timeTracking";

interface AnalyticsProps {
  tasks: Task[];
  categories: Category[];
  goals: Goal[];
  selectedDate: Date;
  activeView?: "overview" | "trends";
  onViewChange?: (view: "overview" | "trends") => void;
  onCreateGoal?: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal?: (goal: Goal) => void;
  onDeleteGoal?: (goalId: string) => void;
}

export function Analytics({ tasks, categories, goals, selectedDate, activeView = "overview", onViewChange, onCreateGoal, onUpdateGoal, onDeleteGoal }: AnalyticsProps) {
  const { theme } = useTheme();

  // Get tasks for the selected date
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const todayTasks = tasks.filter(task => task.date === selectedDateStr);

  // Get tasks for the past 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(selectedDate);
    date.setDate(selectedDate.getDate() - i);
    return date.toISOString().split('T')[0];
  });

  const weekTasks = tasks.filter(task => last7Days.includes(task.date));

  // Calculate well-being scores based on tasks
  const calculateWellBeingScores = () => {
    const scores = {
      mission: 0,
      money: 0,
      growth: 0,
      physical: 0,
      mental: 0,
      spiritual: 0,
      romance: 0,
      friends: 0,
      family: 0,
      joy: 0,
    };

    // Simple scoring based on task categories and well-being tags
    todayTasks.forEach(task => {
      task.wellBeingTags?.forEach(tag => {
        const normalizedTag = tag.toLowerCase();
        if (normalizedTag in scores) {
          scores[normalizedTag as keyof typeof scores] += 1;
        }
      });
    });

    // Normalize scores to 0-10 scale
    const maxScore = Math.max(...Object.values(scores), 1);
    Object.keys(scores).forEach(key => {
      scores[key as keyof typeof scores] = Math.min(10, Math.round((scores[key as keyof typeof scores] / maxScore) * 10));
    });

    return scores;
  };

  return (
    <div className="space-y-8">

      {/* Content */}
      <div className="space-y-8">
        {activeView === "overview" && (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AnalyticsCharts tasks={todayTasks} categories={categories} />
              <div className="flex justify-center items-center">
                <WellBeingWheel data={calculateWellBeingScores()} size={360} />
              </div>
            </div>

            {/* Trends (moved from Trends tab) */}
            <div className="mt-2">
              <TrendsChart tasks={weekTasks} categories={categories} selectedDate={selectedDate} />
            </div>
          </div>
        )}
        
        {/* Goals page moved to main navbar; removed from sub-views */}
        
        {activeView === "trends" && (
          <TrendsChart tasks={weekTasks} categories={categories} selectedDate={selectedDate} />
        )}
      </div>
    </div>
  );
}