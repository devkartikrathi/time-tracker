"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task, Category } from "@/types/timeTracking";

interface AnalyticsChartsProps {
  tasks: Task[];
  categories: Category[];
}

export function AnalyticsCharts({ tasks, categories }: AnalyticsChartsProps) {
  const { theme } = useTheme();
  // Aggregate data by category
  const categoryData = categories.map(category => {
    const categoryTasks = tasks.filter(task => task.mainCategory === category.id);
    return {
      name: category.name,
      hours: categoryTasks.length,
      color: category.color
    };
  }).filter(data => data.hours > 0);

  // Aggregate data by subcategory
  const subcategoryData: Array<{name: string; hours: number; color: string}> = [];
  
  categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      const subcategoryTasks = tasks.filter(
        task => task.mainCategory === category.id && task.subcategory === subcategory.id
      );
      if (subcategoryTasks.length > 0) {
        subcategoryData.push({
          name: subcategory.name,
          hours: subcategoryTasks.length,
          color: subcategory.color
        });
      }
    });
  });

  const totalHours = tasks.length;
  const unloggedHours = 24 - totalHours;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className={`p-3 rounded-lg border shadow-lg ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <p className={`font-medium ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{data.name}</p>
          <p className={`${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {data.value} hour{data.value !== 1 ? 's' : ''} 
            {totalHours > 0 && ` (${((data.value / 24) * 100).toFixed(1)}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Category Overview */}
      <Card className={`border shadow-sm ${
        theme === 'dark' 
          ? 'bg-gray-900 border-gray-800' 
          : 'bg-white border-gray-200'
      }`}>
        <CardHeader className="px-4 sm:px-6 py-3">
          <CardTitle className={`${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          } text-base sm:text-lg`}>Time by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="hours"
                  label={({ name, percent }) => `${name} (${((percent as number) * 100).toFixed(1)}%)`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className={`h-[300px] flex items-center justify-center ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No activities logged for this day
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subcategory Breakdown */}
      <Card className={`border shadow-sm ${
        theme === 'dark' 
          ? 'bg-gray-900 border-gray-800' 
          : 'bg-white border-gray-200'
      }`}>
        <CardHeader className="px-4 sm:px-6 py-3">
          <CardTitle className={`${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          } text-base sm:text-lg`}>Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {subcategoryData.length > 0 ? (
            <div className="space-y-3">
              {subcategoryData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm sm:text-base">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className={`${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>{item.name}</span>
                  </div>
                  <div className={`${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {item.hours} hour{item.hours !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
              {unloggedHours > 0 && (
                <div className={`flex items-center justify-between border-t pt-3 ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${
                      theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'
                    }`} />
                    <span className={`${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>Unlogged Time</span>
                  </div>
                  <div className={`${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {unloggedHours} hour{unloggedHours !== 1 ? 's' : ''}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={`text-center py-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              No activities logged for this day
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}