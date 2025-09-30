"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
const ResponsiveContainerTyped = ResponsiveContainer as any;
const LineChartTyped = LineChart as any;
const LineTyped = Line as any;
const XAxisTyped = XAxis as any;
const YAxisTyped = YAxis as any;
const CartesianGridTyped = CartesianGrid as any;
const TooltipTyped = Tooltip as any;
const LegendTyped = Legend as any;
const BarChartTyped = BarChart as any;
const BarTyped = Bar as any;
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
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
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
      const categoryTasks = dayTasks.filter(task => task.category === category.id);
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
          <ResponsiveContainerTyped width="100%" height={300}>
            <LineChartTyped data={trendData}>
              <CartesianGridTyped strokeDasharray="3 3" stroke={theme === 'dark' ? "#374151" : "#E5E7EB"} />
              <XAxisTyped 
                dataKey="date" 
                stroke={theme === 'dark' ? "#9CA3AF" : "#6B7280"}
                fontSize={12}
              />
              <YAxisTyped 
                stroke={theme === 'dark' ? "#9CA3AF" : "#6B7280"}
                fontSize={12}
              />
              <TooltipTyped content={<CustomTooltip />} />
              <LegendTyped />
              {categories.map(category => (
                <LineTyped
                  key={category.id}
                  type="monotone"
                  dataKey={category.name}
                  stroke={category.color}
                  strokeWidth={2}
                  dot={{ fill: category.color, strokeWidth: 2, r: 4 }}
                />
              ))}
            </LineChartTyped>
          </ResponsiveContainerTyped>
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
          <ResponsiveContainerTyped width="100%" height={300}>
            <BarChartTyped data={trendData}>
              <CartesianGridTyped strokeDasharray="3 3" stroke={theme === 'dark' ? "#374151" : "#E5E7EB"} />
              <XAxisTyped 
                dataKey="date" 
                stroke={theme === 'dark' ? "#9CA3AF" : "#6B7280"}
                fontSize={12}
              />
              <YAxisTyped 
                stroke={theme === 'dark' ? "#9CA3AF" : "#6B7280"}
                fontSize={12}
              />
              <TooltipTyped content={<CustomTooltip />} />
              <LegendTyped />
              {categories.map((category, index) => (
                <BarTyped
                  key={category.id}
                  dataKey={category.name}
                  stackId="hours"
                  fill={category.color}
                />
              ))}
            </BarChartTyped>
          </ResponsiveContainerTyped>
        </CardContent>
      </Card>
    </div>
  );
}