'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import { useTheme, Theme } from './ThemeProvider';

interface ThemeToggleProps {
  variant?: 'dropdown' | 'button' | 'pills';
  className?: string;
}

export default function ThemeToggle({ variant = 'dropdown', className = '' }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'button') {
    return (
      <button
        onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        className={`p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
        title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} mode`}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
        )}
      </button>
    );
  }

  if (variant === 'pills') {
    const options: { id: Theme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
      { id: 'light', label: 'Light', icon: Sun },
      { id: 'dark', label: 'Dark', icon: Moon },
      { id: 'system', label: 'System', icon: Laptop },
    ];

    return (
      <div className={`flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 ${className}`}>
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-white dark:bg-[#0F2C59] text-blue-600 dark:text-amber-400 shadow-sm border border-slate-200/60 dark:border-blue-500/40'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Default: dropdown
  const themeIcons: Record<Theme, React.ComponentType<{ className?: string }>> = {
    light: Sun,
    dark: Moon,
    system: Laptop,
  };

  const CurrentIcon = themeIcons[theme] || Sun;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700/80"
        title="Change Theme Mode"
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-amber-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
        <span className="text-xs font-semibold capitalize hidden sm:inline">{theme}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {(['light', 'dark', 'system'] as Theme[]).map((t) => {
            const Icon = themeIcons[t];
            const isSelected = theme === t;
            return (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                  isSelected
                    ? 'text-blue-600 dark:text-amber-400 bg-blue-50/60 dark:bg-blue-950/40 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="capitalize">{t}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
