"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useTheme } from "@/contexts/ThemeContext";
import type { Task, Category } from "@/types/timeTracking";

interface TrendsChartProps {
  tasks: Task[];
  categories: Category[];
  selectedDate: Date;
}

export function TrendsChart({ tasks, categories, selectedDate }: TrendsChartProps) {
  const { theme } = useTheme();
  // Generate data for the past 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(selectedDate);
    date.setDate(selectedDate.getDate() - (6 - i));
    return {
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    };
  });

  const trendData = last7Days.map(day => {
    const dayTasks = tasks.filter(task => task.date === day.date);
    
    const dataPoint: any = {
      date: day.label,
      total: dayTasks.length
    };

    // Add category data
    categories.forEach(category => {
      const categoryTasks = dayTasks.filter(task => task.mainCategory === category.id);
      dataPoint[category.name] = categoryTasks.length;
    });

    return dataPoint;
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 rounded-lg border shadow-lg ${
          theme === 'dark' 
            ? 'bg-gray-800 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <p className={`font-medium mb-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className={`text-sm ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {entry.dataKey}: {entry.value} hour{entry.value !== 1 ? 's' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Weekly Trend Line Chart */}
      <Card className={`border shadow-sm ${
        theme === 'dark' 
          ? 'bg-gray-900 border-gray-800' 
          : 'bg-white border-gray-200'
      }`}>
        <CardHeader>
          <CardTitle className={`${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>7-Day Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#374151" : "#E5E7EB"} />
              <XAxis 
                dataKey="date" 
                stroke={theme === 'dark' ? "#9CA3AF" : "#6B7280"}
                fontSize={12}
              />
              <YAxis 
                stroke={theme === 'dark' ? "#9CA3AF" : "#6B7280"}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {categories.map(category => (
                <Line
                  key={category.id}
                  type="monotone"
                  dataKey={category.name}
                  stroke={category.color}
                  strokeWidth={2}
                  dot={{ fill: category.color, strokeWidth: 2, r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Daily Hours Bar Chart */}
      <Card className={`border shadow-sm ${
        theme === 'dark' 
          ? 'bg-gray-900 border-gray-800' 
          : 'bg-white border-gray-200'
      }`}>
        <CardHeader>
          <CardTitle className={`${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Daily Activity Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#374151" : "#E5E7EB"} />
              <XAxis 
                dataKey="date" 
                stroke={theme === 'dark' ? "#9CA3AF" : "#6B7280"}
                fontSize={12}
              />
              <YAxis 
                stroke={theme === 'dark' ? "#9CA3AF" : "#6B7280"}
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {categories.map((category, index) => (
                <Bar
                  key={category.id}
                  dataKey={category.name}
                  stackId="hours"
                  fill={category.color}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}