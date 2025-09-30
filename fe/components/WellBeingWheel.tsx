"use client";

import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useMemo, useState } from "react";

interface WellBeingWheelProps {
  data?: { [key: string]: number };
  size?: number;
  selectedDate?: Date | string; // Optional, currently unused for aggregation
}

const wellBeingAspects = [
  { key: 'mission', label: 'Mission', color: '#06B6D4', angle: 0 },
  { key: 'money', label: 'Money', color: '#0891B2', angle: 36 },
  { key: 'growth', label: 'Growth', color: '#0D9488', angle: 72 },
  { key: 'physical', label: 'Physical', color: '#EC4899', angle: 108 },
  { key: 'mental', label: 'Mental', color: '#DC2626', angle: 144 },
  { key: 'spiritual', label: 'Spiritual', color: '#F472B6', angle: 180 },
  { key: 'romance', label: 'Romance', color: '#FDE047', angle: 216 },
  { key: 'friends', label: 'Friends', color: '#A16207', angle: 252 },
  { key: 'family', label: 'Family', color: '#D97706', angle: 288 },
  { key: 'joy', label: 'Joy', color: '#10B981', angle: 324 },
];

export function WellBeingWheel({ data = {}, size = 300, selectedDate }: WellBeingWheelProps) {
  const { theme } = useTheme();
  const [valuesState, setValuesState] = useState<Record<string, number> | null>(null);
  const [loading, setLoading] = useState(false);

  const dateStr = useMemo(() => {
    if (typeof selectedDate === 'string' && selectedDate) return selectedDate;
    const d = selectedDate instanceof Date ? selectedDate : new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, [selectedDate]);

  // Initialize from server daily_tasks.wellBeingTags (aggregate across ALL records)
  useEffect(() => {
    const fetchDaily = async () => {
      try {
        setLoading(true);
        // No date filter: fetch all daily_tasks for this user
        const res = await fetch(`/api/daily-tasks`);
        const json = await res.json();
        const rows: Array<{ wellBeingTags?: string[] }> = Array.isArray(json.data) ? json.data : [];

        const counts: Record<string, number> = Object.fromEntries(
          wellBeingAspects.map(a => [a.key, 0])
        );
        rows.forEach(row => {
          (row.wellBeingTags || []).forEach(tag => {
            const t = String(tag).toLowerCase();
            const aspect = wellBeingAspects.find(a => a.key === t || (t === 'social' && a.key === 'friends'));
            if (aspect) counts[aspect.key] = (counts[aspect.key] || 0) + 1;
          });
        });

        // Use raw counts but clamp to 0-10 for rendering
        const clamped: Record<string, number> = Object.fromEntries(
          wellBeingAspects.map(a => [a.key, Math.max(0, Math.min(10, counts[a.key] || 0))])
        );

        // If still zero across the board, fall back to provided data prop
        const sum = Object.values(clamped).reduce((s, v) => s + v, 0);
        setValuesState(sum > 0 ? clamped : Object.fromEntries(
          wellBeingAspects.map(a => [a.key, Math.max(0, Math.min(10, Number(data[a.key] || 0)))]))
        );
      } catch {
        // If fetch fails, still render from provided data
        const fallback: Record<string, number> = Object.fromEntries(
          wellBeingAspects.map(a => [a.key, Math.max(0, Math.min(10, Number(data[a.key] || 0)))])
        );
        setValuesState(fallback);
      } finally {
        setLoading(false);
      }
    };
    fetchDaily();
  }, [dateStr]);
  
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.4;
  
  const getPoint = (angle: number, distance: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: centerX + Math.cos(rad) * distance,
      y: centerY + Math.sin(rad) * distance,
    };
  };

  const createPath = (values: number[]) => {
    const points = values.map((value, index) => {
      const angle = wellBeingAspects[index].angle;
      const distance = (value / 10) * radius;
      return getPoint(angle, distance);
    });
    
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    path += ' Z';
    return path;
  };

  const currentValues = valuesState || Object.fromEntries(wellBeingAspects.map(a => [a.key, Number(data[a.key] || 0)]));
  const values = wellBeingAspects.map(aspect => currentValues[aspect.key] || 0);
  const pathData = createPath(values);

  // Read-only: no setters or save function

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative">
        <svg width={size} height={size} className="drop-shadow-sm">
          {/* Background circle */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke={theme === 'dark' ? '#374151' : '#E5E7EB'}
            strokeWidth="1"
          />
          
          {/* Grid lines */}
          {Array.from({ length: 10 }, (_, i) => {
            const gridRadius = (radius * (i + 1)) / 10;
            return (
              <circle
                key={i}
                cx={centerX}
                cy={centerY}
                r={gridRadius}
                fill="none"
                stroke={theme === 'dark' ? '#374151' : '#E5E7EB'}
                strokeWidth="0.5"
                opacity="0.3"
              />
            );
          })}
          
          {/* Radial lines */}
          {wellBeingAspects.map((aspect) => {
            const point = getPoint(aspect.angle, radius);
            return (
              <line
                key={aspect.key}
                x1={centerX}
                y1={centerY}
                x2={point.x}
                y2={point.y}
                stroke={theme === 'dark' ? '#374151' : '#E5E7EB'}
                strokeWidth="0.5"
                opacity="0.3"
              />
            );
          })}
          
          {/* Data area */}
          <path
            d={pathData}
            fill={theme === 'dark' ? '#1F2937' : '#F3F4F6'}
            fillOpacity="0.3"
            stroke={theme === 'dark' ? '#6B7280' : '#9CA3AF'}
            strokeWidth="1.5"
          />
          
          {/* Data points */}
          {wellBeingAspects.map((aspect, index) => {
            const value = values[index];
            const point = getPoint(aspect.angle, (value / 10) * radius);
            return (
              <circle
                key={aspect.key}
                cx={point.x}
                cy={point.y}
                r="4"
                fill={aspect.color}
                stroke={theme === 'dark' ? '#1F2937' : '#FFFFFF'}
                strokeWidth="2"
              />
            );
          })}
          
          {/* Labels */}
          {wellBeingAspects.map((aspect) => {
            const labelPoint = getPoint(aspect.angle, radius + 20);
            return (
              <text
                key={`label-${aspect.key}`}
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                {aspect.label}
              </text>
            );
          })}
        </svg>
      </div>
      
      {/* Read-only legend: shows clamped counts per aspect aggregated from DB */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {wellBeingAspects.map((aspect) => (
          <div key={aspect.key} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: aspect.color }}
            />
            <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
              {aspect.label}: {valuesState ? valuesState[aspect.key] || 0 : 0}/10
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}