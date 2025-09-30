"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
 
import { Trash2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task, Category } from "@/types/timeTracking";

interface TaskDialogProps {
  hour: number;
  existingTask?: Task;
  categories: Category[];
  onSave: (task: any) => void;
  onRemove?: () => void;
  onClose: () => void;
  isMultiSelect?: boolean;
  selectedCount?: number;
}

 

export function TaskDialog({
  hour,
  existingTask,
  categories,
  onSave,
  onRemove,
  onClose,
  isMultiSelect = false,
  selectedCount = 1
}: TaskDialogProps) {
  const { theme } = useTheme();
  const [selectedSubcategory, setSelectedSubcategory] = useState(existingTask?.subcategoryId || '');
  

  const formatHour = (hour: number) => {
    if (hour === 0) return "12:00 AM";
    if (hour === 12) return "12:00 PM";
    if (hour < 12) return `${hour}:00 AM`;
    return `${hour - 12}:00 PM`;
  };

  // Flatten subcategories for a single select, but we will render grouped by category headings
  const subcategoryOptions = useMemo(() => {
    return categories.flatMap(cat => (cat.subcategories || []).map(sub => ({
      id: sub.id,
      name: sub.name,
      color: sub.color,
      category: cat.id
    })));
  }, [categories]);

  useEffect(() => {
    if (!selectedSubcategory) {
      const first = subcategoryOptions[0];
      if (first) setSelectedSubcategory(first.id);
    }
  }, [selectedSubcategory, subcategoryOptions]);

  const handleSave = () => {
    if (!selectedSubcategory) return;

    const subcategory = subcategoryOptions.find(s => s.id === selectedSubcategory);
    if (!subcategory) return;

    onSave({
      taskName: subcategory.name, // Use subcategory name as task name
      category: subcategory.category as any,
      subcategoryId: selectedSubcategory,
      duration: 1
    });
  };
 

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[425px] ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
        <DialogHeader>
          <DialogTitle className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
            {isMultiSelect 
              ? `Add Activity to ${selectedCount} Selected Cells`
              : existingTask 
                ? 'Edit Activity' 
                : 'Add Activity'
            } {!isMultiSelect && `- ${formatHour(hour)}`}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {isMultiSelect && (
            <div className={`p-3 rounded-lg border ${
              theme === 'dark' 
                ? 'bg-blue-900/20 border-blue-700 text-blue-300' 
                : 'bg-blue-50 border-blue-200 text-blue-700'
            }`}>
              <p className="text-sm font-medium">
                You have selected {selectedCount} cell{selectedCount !== 1 ? 's' : ''}. 
                The same activity will be applied to all selected cells.
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Activity</Label>
            <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
              <SelectTrigger className={`${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                <SelectValue placeholder="Select activity" />
              </SelectTrigger>
              <SelectContent className={theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}>
                {categories.map(category => (
                  <div key={category.id}>
                    <div className={`px-2 py-1 text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{category.name}</div>
                    {(category.subcategories || []).map(subcategory => (
                      <SelectItem key={subcategory.id} value={subcategory.id} className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subcategory.color }}
                          />
                          <span>{subcategory.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>

          
        </div>

        <div className="flex justify-between">
          <div>
            {onRemove && (
              <Button
                onClick={onRemove}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className={theme === 'dark' ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedSubcategory}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              {existingTask ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}