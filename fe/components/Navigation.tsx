"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  activeTab: "dashboard" | "analytics";
  onTabChange: (tab: "dashboard" | "analytics") => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`flex items-center justify-between p-2 rounded-2xl border backdrop-blur-sm ${
      theme === 'dark' 
        ? 'border-gray-700/50 bg-gray-900/80' 
        : 'border-gray-200/50 bg-white/80'
    } shadow-lg`}>
      <div className="flex space-x-2">
        <button
          onClick={() => onTabChange("dashboard")}
          className={cn(
            "px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300",
            activeTab === "dashboard"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              : theme === 'dark'
                ? "text-gray-400 hover:text-white hover:bg-gray-800/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
          )}
        >
          Dashboard
        </button>
        <button
          onClick={() => onTabChange("analytics")}
          className={cn(
            "px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300",
            activeTab === "analytics"
              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
              : theme === 'dark'
                ? "text-gray-400 hover:text-white hover:bg-gray-800/50"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/50"
          )}
        >
          Analytics
        </button>
      </div>
      
      <Button
        onClick={toggleTheme}
        variant="ghost"
        size="sm"
        className={`p-3 rounded-xl transition-all duration-300 ${
          theme === 'dark'
            ? 'hover:bg-gray-800/50'
            : 'hover:bg-gray-100/50'
        }`}
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>
    </div>
  );
}