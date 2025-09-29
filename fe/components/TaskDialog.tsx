"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task, Category, WellBeingTag } from "@/types/timeTracking";

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

const wellBeingOptions: WellBeingTag[] = [
  'Physical', 'Mental', 'Social', 'Spiritual', 'Growth', 
  'Family', 'Mission', 'Money', 'Romance', 'Friends', 'Joy'
];

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
  const [selectedCategory, setSelectedCategory] = useState(existingTask?.mainCategory || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState(existingTask?.subcategory || '');
  const [selectedWellBeingTags, setSelectedWellBeingTags] = useState<WellBeingTag[]>(
    existingTask?.wellBeingTags || []
  );

  const formatHour = (hour: number) => {
    if (hour === 0) return "12:00 AM";
    if (hour === 12) return "12:00 PM";
    if (hour < 12) return `${hour}:00 AM`;
    return `${hour - 12}:00 PM`;
  };

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);
  const availableSubcategories = selectedCategoryData?.subcategories || [];

  useEffect(() => {
    if (selectedCategory && !selectedSubcategory) {
      const firstSubcategory = availableSubcategories[0];
      if (firstSubcategory) {
        setSelectedSubcategory(firstSubcategory.id);
      }
    }
  }, [selectedCategory, selectedSubcategory, availableSubcategories]);

  const handleSave = () => {
    if (!selectedCategory || !selectedSubcategory) return;

    const subcategory = availableSubcategories.find(s => s.id === selectedSubcategory);
    if (!subcategory) return;

    onSave({
      taskName: subcategory.name, // Use subcategory name as task name
      mainCategory: selectedCategory,
      subcategory: selectedSubcategory,
      subcategoryId: selectedSubcategory,
      color: subcategory.color,
      wellBeingTags: selectedWellBeingTags,
      duration: 1
    });
  };

  const toggleWellBeingTag = (tag: WellBeingTag) => {
    setSelectedWellBeingTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
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
            <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className={`${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className={theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id} className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded shadow-sm"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && availableSubcategories.length > 0 && (
            <div className="space-y-3">
              <Label className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Activity</Label>
              <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                <SelectTrigger className={`${theme === 'dark' ? 'bg-gray-800 border-gray-600 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent className={theme === 'dark' ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'}>
                  {availableSubcategories.map(subcategory => (
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
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-3">
            <Label className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Well-being Tags (Optional)
            </Label>
            <div className="flex flex-wrap gap-2">
              {wellBeingOptions.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedWellBeingTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer transition-all duration-200 text-xs ${
                    selectedWellBeingTags.includes(tag)
                      ? theme === 'dark' 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "bg-blue-600 text-white hover:bg-blue-700"
                      : theme === 'dark'
                        ? "border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500"
                        : "border-gray-300 text-gray-600 hover:bg-gray-100 hover:border-gray-400"
                  }`}
                  onClick={() => toggleWellBeingTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
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
              disabled={!selectedCategory || !selectedSubcategory}
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