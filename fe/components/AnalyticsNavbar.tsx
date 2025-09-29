"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { BarChart3, TrendingUp } from 'lucide-react';

interface AnalyticsNavbarProps {
  activeView: "overview" | "trends";
  onViewChange: (view: "overview" | "trends") => void;
}

const analyticsItems = [
  {
    id: "overview" as const,
    name: "Overview",
    icon: BarChart3,
    description: "Summary and key metrics"
  },
  {
    id: "trends" as const,
    name: "Trends",
    icon: TrendingUp,
    description: "Activity patterns over time"
  }
];

export function AnalyticsNavbar({ activeView, onViewChange }: AnalyticsNavbarProps) {
  const { theme } = useTheme();

  return (
    <div className={`sticky top-16 z-40 backdrop-blur-md border-b ${
      theme === 'dark' 
        ? 'bg-gray-900/80 border-gray-800' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Analytics Navigation */}
          <div className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
            {analyticsItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600"
                      : theme === 'dark'
                        ? "text-gray-400 hover:text-white hover:bg-gray-700/50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.name}</span>
                  <span className="sm:hidden">{item.name.charAt(0)}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <div className={`text-xs px-3 py-1 rounded-full ${
              theme === 'dark' 
                ? 'bg-gray-800 text-gray-300' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              Last 30 days
            </div>
            <div className={`w-2 h-2 rounded-full ${
              theme === 'dark' ? 'bg-green-500' : 'bg-green-400'
            }`}></div>
            <span className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Live
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
