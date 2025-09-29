"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CircleCheck as CheckCircle, Clock, CircleAlert as AlertCircle, Plus, Pencil, Trash2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task, Category, Goal } from "@/types/timeTracking";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface GoalsTrackingProps {
  tasks: Task[];
  categories: Category[];
  goals: Goal[];
  onCreateGoal?: (goal: Omit<Goal, 'id'>) => void;
  onUpdateGoal?: (goal: Goal) => void;
  onDeleteGoal?: (goalId: string) => void;
}

export function GoalsTracking({ tasks, categories, goals, onCreateGoal, onUpdateGoal, onDeleteGoal }: GoalsTrackingProps) {
  const { theme } = useTheme();
  const [open, setOpen] = useState<null | { mode: 'create' } | { mode: 'edit', goal: Goal }>(null);
  const [form, setForm] = useState<{ name: string; targetHours: string; categoryId: string; subcategoryId?: string }>({ name: '', targetHours: '1', categoryId: '', subcategoryId: undefined });

  const startCreate = () => {
    setForm({ name: '', targetHours: '1', categoryId: categories[0]?.id || '', subcategoryId: undefined });
    setOpen({ mode: 'create' });
  };
  const startEdit = (goal: Goal) => {
    setForm({ name: goal.name, targetHours: String(goal.targetHours), categoryId: goal.categoryId, subcategoryId: goal.subcategoryId });
    setOpen({ mode: 'edit', goal });
  };
  const save = () => {
    const payload: Omit<Goal, 'id'> = {
      name: form.name.trim() || 'New Goal',
      targetHours: Math.max(1, Number(form.targetHours) || 1),
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId || undefined
    };
    if (open?.mode === 'create' && onCreateGoal) onCreateGoal(payload);
    if (open?.mode === 'edit' && onUpdateGoal && open.goal) onUpdateGoal({ id: open.goal.id, ...payload });
    setOpen(null);
  };
  const getGoalProgress = (goal: Goal) => {
    const relevantTasks = tasks.filter(task => {
      if (goal.subcategoryId) {
        return task.mainCategory === goal.categoryId && task.subcategory === goal.subcategoryId;
      }
      return task.mainCategory === goal.categoryId;
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
          {onCreateGoal && (
            <Button size="sm" onClick={startCreate} className="gap-2">
              <Plus className="w-4 h-4" /> Add Goal
            </Button>
          )}
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
                    {onUpdateGoal && (
                      <Button size="icon" variant="ghost" onClick={() => startEdit(goal)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                    )}
                    {onDeleteGoal && (
                      <Button size="icon" variant="ghost" className="text-red-500" onClick={() => onDeleteGoal(goal.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <Progress 
                  value={progress.progress} 
                  className={`h-2 ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                />
                
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
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v, subcategoryId: undefined })}>
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
              {form.categoryId && (
                <div className="space-y-1">
                  <Label>Subcategory (optional)</Label>
                  <Select value={form.subcategoryId ?? '__none__'} onValueChange={(v) => setForm({ ...form, subcategoryId: v === '__none__' ? undefined : v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="All subcategories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">All</SelectItem>
                      {(categories.find(c => c.id === form.categoryId)?.subcategories || []).map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setOpen(null)}>Cancel</Button>
                <Button onClick={save}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}