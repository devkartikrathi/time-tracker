"use client";

import { useState, useEffect } from "react";
import { AnalyticsCharts } from "./AnalyticsCharts";
import { GoalsTracking } from "./GoalsTracking";
import { WellBeingWheel } from "./WellBeingWheel";
import { TrendsChart } from "./TrendsChart";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task, Category, Goal } from "@/types/timeTracking";

interface AnalyticsProps {
  categories: Category[];
  selectedDate: Date;
  activeView?: "overview" | "goals" | "trends";
  onViewChange?: (view: "overview" | "goals" | "trends") => void;
}

export function Analytics({ categories, selectedDate, activeView = "overview", onViewChange }: AnalyticsProps) {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch analytics data from database
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        
        // Get tasks for the past 30 days for comprehensive analytics
        const endDate = new Date(selectedDate);
        const startDate = new Date(selectedDate);
        startDate.setDate(startDate.getDate() - 30);
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        const [tasksRes, goalsRes] = await Promise.all([
          fetch(`/api/tasks?startDate=${startDateStr}&endDate=${endDateStr}`),
          fetch('/api/goals')
        ]);
        
        const tasksJson = await tasksRes.json();
        const goalsJson = await goalsRes.json();
        
        setTasks(tasksJson.data || []);
        setGoals(goalsJson.data || []);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [selectedDate]);

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

  // Goal management functions
  const onCreateGoal = async (goal: Omit<Goal, 'id'>) => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      });
      
      if (response.ok) {
        const result = await response.json();
        setGoals(prev => [...prev, result.data]);
      }
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const onUpdateGoal = async (goal: Goal) => {
    try {
      const response = await fetch(`/api/goals/${goal.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      });
      
      if (response.ok) {
        const result = await response.json();
        setGoals(prev => prev.map(g => g.id === goal.id ? result.data : g));
      }
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const onDeleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setGoals(prev => prev.filter(g => g.id !== goalId));
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

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
        
        {activeView === "goals" && (
          <GoalsTracking categories={categories} selectedDate={selectedDate} />
        )}
        
        {activeView === "trends" && (
          <TrendsChart tasks={weekTasks} categories={categories} selectedDate={selectedDate} />
        )}
      </div>
    </div>
  );
}