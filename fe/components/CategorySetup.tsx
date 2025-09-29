"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, CreditCard as Edit2, Check, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { Category } from "@/types/timeTracking";

interface CategorySetupProps {
  categories: Category[];
  onSave: (categories: Category[]) => void;
  onClose: () => void;
}

export function CategorySetup({ categories, onSave, onClose }: CategorySetupProps) {
  const { theme } = useTheme();
  // Generate N shades around a base hex color by varying lightness
  const generateShades = (hex: string, count: number): string[] => {
    const toRgb = (h: string) => {
      const s = h.replace('#', '');
      const bigint = parseInt(s.length === 3 ? s.split('').map(c => c + c).join('') : s, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return { r, g, b };
    };
    const rgbToHsl = (r: number, g: number, b: number) => {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0; const l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max - min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break; // 0 sector
          case g: h = (b - r) / d + 2; break;              // 2 sector
          case b: h = (r - g) / d + 4; break;              // 4 sector
        }
        h /= 6;
      }
      return { h, s, l };
    };
    const hslToHex = (h: number, s: number, l: number) => {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      let r: number, g: number, b: number;
      if (s === 0) {
        r = g = b = l; // achromatic
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      const toHex = (x: number) => {
        const v = Math.round(x * 255);
        const s = v.toString(16).padStart(2, '0');
        return s;
      };
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };
    const baseRgb = toRgb(hex);
    const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
    const shades: string[] = [];
    const start = Math.max(0.05, baseHsl.l * 0.3);
    const end = Math.min(0.95, 1 - (1 - baseHsl.l) * 0.3);
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const l = start + (end - start) * t;
      shades.push(hslToHex(baseHsl.h, baseHsl.s, l));
    }
    return shades;
  };
  const [editingCategories, setEditingCategories] = useState<Category[]>(
    categories.map(cat => ({ ...cat, subcategories: [...cat.subcategories] }))
  );
  const [editingSubcategory, setEditingSubcategory] = useState<{
    categoryId: string;
    subcategoryId: string | null;
    name: string;
    color: string;
  } | null>(null);

  const handleSave = () => {
    onSave(editingCategories);
    onClose();
  };

  const addSubcategory = (categoryId: string) => {
    const parent = editingCategories.find(c => c.id === categoryId);
    setEditingSubcategory({
      categoryId,
      subcategoryId: null,
      name: '',
      color: parent?.color || '#000000'
    });
  };

  const editSubcategory = (categoryId: string, subcategoryId: string) => {
    const category = editingCategories.find(c => c.id === categoryId);
    const subcategory = category?.subcategories.find(s => s.id === subcategoryId);
    
    if (subcategory) {
      setEditingSubcategory({
        categoryId,
        subcategoryId,
        name: subcategory.name,
        color: subcategory.color
      });
    }
  };

  const saveSubcategory = () => {
    if (!editingSubcategory || !editingSubcategory.name.trim()) return;

    setEditingCategories(prev => prev.map(category => {
      if (category.id === editingSubcategory.categoryId) {
        const subcategories = [...category.subcategories];
        
        if (editingSubcategory.subcategoryId) {
          // Edit existing
          const index = subcategories.findIndex(s => s.id === editingSubcategory.subcategoryId);
          if (index >= 0) {
            subcategories[index] = {
              ...subcategories[index],
              name: editingSubcategory.name,
              color: editingSubcategory.color
            };
          }
        } else {
          // Add new
          const newId = `${category.id}-${Date.now()}`;
          subcategories.push({
            id: newId,
            name: editingSubcategory.name,
            color: editingSubcategory.color
          });
        }
        
        return { ...category, subcategories };
      }
      return category;
    }));

    setEditingSubcategory(null);
  };

  const removeSubcategory = (categoryId: string, subcategoryId: string) => {
    setEditingCategories(prev => prev.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          subcategories: category.subcategories.filter(s => s.id !== subcategoryId)
        };
      }
      return category;
    }));
  };

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {editingCategories.map(category => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.subcategories.map(subcategory => (
                      <div key={subcategory.id} className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: subcategory.color }}
                          />
                          <span>{subcategory.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => editSubcategory(category.id, subcategory.id)}
                            className={theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeSubcategory(category.id, subcategory.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      onClick={() => addSubcategory(category.id)}
                      variant="outline"
                      size="sm"
                      className={`w-full ${
                        theme === 'dark' 
                          ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Subcategory
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className={`flex justify-between pt-6 border-t ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <Button
              onClick={onClose}
              variant="outline"
              className={theme === 'dark' ? 'border-gray-600 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-100'}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className={theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}
            >
              Save Changes
            </Button>
          </div>

        </DialogContent>
      </Dialog>

      {/* Subcategory Edit Dialog */}
      {editingSubcategory && (
        <Dialog open onOpenChange={() => setEditingSubcategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSubcategory.subcategoryId ? 'Edit' : 'Add'} Subcategory
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editingSubcategory.name}
                  onChange={(e) => setEditingSubcategory({
                    ...editingSubcategory,
                    name: e.target.value
                  })}
                  placeholder="Subcategory name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Shade</Label>
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const parent = editingCategories.find(c => c.id === editingSubcategory.categoryId);
                    const base = parent?.color || '#000000';
                    // Generate 8 shades between darker and lighter of base
                    const shades = generateShades(base, 8);
                    return shades.map((shade) => (
                      <button
                        key={shade}
                        type="button"
                        onClick={() => setEditingSubcategory({ ...editingSubcategory, color: shade })}
                        className={`w-8 h-8 rounded border ${
                          editingSubcategory.color.toLowerCase() === shade.toLowerCase()
                            ? 'ring-2 ring-blue-500'
                            : ''
                        } ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
                        style={{ backgroundColor: shade }}
                        title={shade}
                      />
                    ));
                  })()}
                </div>
                <div className="flex items-center space-x-3">
                  <Input
                    value={editingSubcategory.color}
                    onChange={(e) => setEditingSubcategory({
                      ...editingSubcategory,
                      color: e.target.value
                    })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setEditingSubcategory(null)}
                variant="outline"
                className={theme === 'dark' ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-300 hover:bg-gray-100'}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={saveSubcategory}
                disabled={!editingSubcategory.name.trim()}
                className={theme === 'dark' ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}
              >
                <Check className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}