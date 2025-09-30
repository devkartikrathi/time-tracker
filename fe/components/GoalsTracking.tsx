"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleCheck as CheckCircle, Clock, CircleAlert as AlertCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task, Category, Goal, DailyTask } from "@/types/timeTracking";
import { convertDailyTaskToTasks } from "@/lib/task-converter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GoalsTrackingProps {
  categories: Category[];
  selectedDate: Date;
}

export function GoalsTracking({ categories, selectedDate }: GoalsTrackingProps) {
  const { theme } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<null | { mode: 'create' } | { mode: 'edit', goal: Goal }>(null);
  const [form, setForm] = useState<{ name: string; targetHours: string; category: string; subcategoryId: string }>({ name: '', targetHours: '1', category: '', subcategoryId: '' });

  // Selected date in YYYY-MM-DD format for daily computations
  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  // Fetch goals and tasks data from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch only the selected day's records for daily goal calculation
        const startDateStr = selectedDateStr;
        const endDateStr = selectedDateStr;
        
        const [dailyTasksRes, goalsRes] = await Promise.all([
          fetch(`/api/daily-tasks?startDate=${startDateStr}&endDate=${endDateStr}`),
          fetch('/api/goals')
        ]);
        
        const dailyTasksJson = await dailyTasksRes.json();
        const goalsJson = await goalsRes.json();
        
        setDailyTasks(dailyTasksJson.data || []);
        setGoals(goalsJson.data || []);
        
        // Convert daily task to individual tasks for goals compatibility
        const allTasks: Task[] = [];
        (dailyTasksJson.data || []).forEach((dailyTask: DailyTask) => {
          const convertedTasks = convertDailyTaskToTasks(dailyTask);
          allTasks.push(...convertedTasks);
        });
        setTasks(allTasks);
      } catch (error) {
        console.error('Error fetching goals data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [selectedDate, selectedDateStr]);

  const startCreate = () => {
    const firstCategory = categories[0];
    const firstSubcategory = firstCategory?.subcategories[0];
    setForm({ 
      name: '', 
      targetHours: '1', 
      category: firstCategory?.id || '', 
      subcategoryId: firstSubcategory?.id || '' 
    });
    setOpen({ mode: 'create' });
  };
  const startEdit = (goal: Goal) => {
    setForm({ name: goal.name, targetHours: String(goal.targetHours), category: goal.category, subcategoryId: goal.subcategoryId });
    setOpen({ mode: 'edit', goal });
  };
  const save = async () => {
    const payload: Omit<Goal, 'id'> = {
      name: form.name.trim() || 'New Goal',
      targetHours: Math.max(1, Number(form.targetHours) || 1),
      category: form.category as any,
      subcategoryId: form.subcategoryId
    };
    try {
      if (open?.mode === 'create') {
        const response = await fetch('/api/goals', { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(payload) 
        });
        if (response.ok) {
          const result = await response.json();
          setGoals(prev => [...prev, result.data]);
        }
      } else if (open?.mode === 'edit' && open.goal) {
        const response = await fetch(`/api/goals/${open.goal.id}`, { 
          method: 'PATCH', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(payload) 
        });
        if (response.ok) {
          const result = await response.json();
          setGoals(prev => prev.map(g => g.id === open.goal.id ? result.data : g));
        }
      }
    } catch (error) {
      console.error('Error saving goal:', error);
    }
    setOpen(null);
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const response = await fetch(`/api/goals/${goalId}`, { method: 'DELETE' });
      if (response.ok) {
        setGoals(prev => prev.filter(g => g.id !== goalId));
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };
  const getGoalProgress = (goal: Goal) => {
    // Only count tasks for the selected day and matching category/subcategory
    const relevantTasks = tasks.filter(task => {
      return task.date === selectedDateStr && task.category === goal.category && task.subcategoryId === goal.subcategoryId;
    });

    const currentHours = relevantTasks.length;
    const progress = Math.min((currentHours / goal.targetHours) * 100, 100);
    
    return {
      current: currentHours,
      target: goal.targetHours,
      progress,
      status: currentHours >= goal.targetHours ? 'completed' : 
               currentHours >= goal.targetHours * 0.8 ? 'on-track' : 'behind'
    };
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'on-track':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'on-track':
        return 'text-yellow-500';
      default:
        return 'text-red-500';
    }
  };

  if (loading) {
    return (
      <Card className={`border shadow-sm ${
        theme === 'dark' 
          ? 'bg-gray-900 border-gray-800' 
          : 'bg-white border-gray-200'
      }`}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Goals Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading goals...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border shadow-sm ${
      theme === 'dark' 
        ? 'bg-gray-900 border-gray-800' 
        : 'bg-white border-gray-200'
    }`}>
      <CardHeader className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          } text-base sm:text-lg`}>Daily Goals</CardTitle>
          <Button size="sm" onClick={startCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Add Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="space-y-4 sm:space-y-6">
          {goals.map(goal => {
            const progress = getGoalProgress(goal);
            
            return (
              <div key={goal.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(progress.status)}
                    <div>
                      <h4 className={`font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-gray-900'
                      } text-sm sm:text-base`}>{goal.name}</h4>
                      <p className={`text-xs sm:text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {progress.current} / {progress.target} hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-xs sm:text-sm font-medium ${getStatusColor(progress.status)}`}>
                      {progress.progress.toFixed(0)}%
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => startEdit(goal)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-red-500" onClick={() => deleteGoal(goal.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div 
                  className={`h-2 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                >
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress.progress, 100)}%` }}
                  />
                </div>
                
                <div className={`flex justify-between text-xs sm:text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <span>
                    {progress.status === 'completed' ? 'Goal achieved!' :
                     progress.status === 'on-track' ? 'On track' :
                     `${progress.target - progress.current} hours remaining`}
                  </span>
                  {progress.status !== 'completed' && (
                    <span>
                      Target: {goal.targetHours} hours
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          
          {goals.length === 0 && (
            <div className={`text-center py-6 sm:py-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No goals set yet
            </div>
          )}
        </div>
      </CardContent>
      {open && (
        <Dialog open onOpenChange={() => setOpen(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{open.mode === 'create' ? 'Add Goal' : 'Edit Goal'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Target hours (per day)</Label>
                <Input type="number" min={1} value={form.targetHours} onChange={(e) => setForm({ ...form, targetHours: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => {
                  const selectedCategory = categories.find(c => c.id === v);
                  const firstSubcategory = selectedCategory?.subcategories[0];
                  setForm({ 
                    ...form, 
                    category: v, 
                    subcategoryId: firstSubcategory?.id || '' 
                  });
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {form.category && (
                <div className="space-y-1">
                  <Label>Subcategory (required)</Label>
                  <Select value={form.subcategoryId} onValueChange={(v) => setForm({ ...form, subcategoryId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {(categories.find(c => c.id === form.category)?.subcategories || []).map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(null)}>Cancel</Button>
                <Button 
                  onClick={save} 
                  disabled={!form.name.trim() || !form.subcategoryId}
                >
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}