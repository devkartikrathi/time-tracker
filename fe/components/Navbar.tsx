"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Clock, Menu, X } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { UserButton as ClerkUserButton, SignInButton, SignUpButton } from '@clerk/nextjs';

interface NavbarProps {
  isAuthenticated?: boolean;
  activeTab?: "dashboard" | "analytics" | "goals";
  onTabChange?: (tab: "dashboard" | "analytics" | "goals") => void;
  onCategoriesClick?: () => void;
  activeAnalyticsView?: "overview" | "goals" | "trends";
  onAnalyticsViewChange?: (view: "overview" | "goals" | "trends") => void;
}

export function Navbar({ isAuthenticated = false, activeTab, onTabChange, onCategoriesClick, activeAnalyticsView, onAnalyticsViewChange }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  const navigationItems = [];

  return (
    <nav className={`sticky top-0 z-50 backdrop-blur-md border-b ${
      theme === 'dark' 
        ? 'bg-gray-900/80 border-gray-800' 
        : 'bg-white/80 border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 flex items-center justify-center text-gray-900 dark:text-white">
              <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Clock logo">
                <circle cx="12" cy="12" r="9"></circle>
                <path d="M12 7v5l3 2"></path>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              TimeTracker
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Main App Tabs */}
            {isAuthenticated && onTabChange && (
              <div className="flex items-center space-x-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => onTabChange('dashboard')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === 'dashboard'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onTabChange('analytics')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === 'analytics'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => onTabChange('goals')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                    activeTab === 'goals'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  }`}
                >
                  Goals
                </button>
              </div>
            )}
            
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Categories Link */}
            {isAuthenticated && onCategoriesClick && (
              <button
                onClick={onCategoriesClick}
                className={`hidden md:inline px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 border ${
                  theme === 'dark' 
                    ? 'text-gray-300 border-gray-700 hover:bg-gray-800 hover:border-gray-600 hover:text-white' 
                    : 'text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900'
                }`}
              >
                Select Categories
              </button>
            )}
            {/* Theme Toggle */}
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="sm"
              className={`p-2 rounded-lg transition-all duration-200 border ${
                theme === 'dark'
                  ? 'border-gray-700 hover:bg-gray-800 hover:border-gray-600 text-gray-400 hover:text-white'
                  : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-600 hover:text-gray-900'
              }`}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </Button>

            {isAuthenticated ? (
              <ClerkUserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                    userButtonPopoverCard: theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200',
                  }
                }}
              />
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                {hasClerk ? (
                  <>
                    <SignInButton mode="modal">
                      <Button
                        variant="ghost"
                        className={`text-sm font-medium transition-colors duration-200 ${
                          theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Log in
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200">
                        Sign up
                      </Button>
                    </SignUpButton>
                  </>
                ) : (
                  <>
                    <Link href="/sign-in">
                      <Button
                        variant="ghost"
                        className={`text-sm font-medium transition-colors duration-200 ${
                          theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Log in
                      </Button>
                    </Link>
                    <Link href="/sign-up">
                      <Button className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200">
                        Sign up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            )}

          {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t ${
            theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
          }`}>
            <div className="px-4 py-3 space-y-3">
              {isAuthenticated && onTabChange && (
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => { onTabChange('dashboard'); setIsMobileMenuOpen(false); }}
                    className={theme === 'dark' ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-100'}
                  >
                    Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { onTabChange('analytics'); setIsMobileMenuOpen(false); }}
                    className={theme === 'dark' ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-100'}
                  >
                    Analytics
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { onTabChange('goals'); setIsMobileMenuOpen(false); }}
                    className={theme === 'dark' ? 'border-gray-700 text-gray-300 hover:bg-gray-800' : 'border-gray-200 text-gray-700 hover:bg-gray-100'}
                  >
                    Goals
                  </Button>
                </div>
              )}
              {isAuthenticated && onAnalyticsViewChange && activeTab === 'analytics' && (
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="ghost" onClick={() => { onAnalyticsViewChange('overview'); setIsMobileMenuOpen(false); }} className={theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}>
                    Overview
                  </Button>
                  <Button variant="ghost" onClick={() => { onAnalyticsViewChange('goals'); setIsMobileMenuOpen(false); }} className={theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}>
                    Goals
                  </Button>
                  <Button variant="ghost" onClick={() => { onAnalyticsViewChange('trends'); setIsMobileMenuOpen(false); }} className={theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}>
                    Trends
                  </Button>
                </div>
              )}
              {isAuthenticated && onCategoriesClick && (
                <Button
                  onClick={() => { onCategoriesClick(); setIsMobileMenuOpen(false); }}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  Select Categories
                </Button>
              )}
              {!isAuthenticated && (
                <div className="flex items-center justify-between gap-2">
                  {hasClerk ? (
                    <>
                      <SignInButton mode="modal">
                        <Button
                          variant="ghost"
                          className={`flex-1 ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                          Log in
                        </Button>
                      </SignInButton>
                      <SignUpButton mode="modal">
                        <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">Sign up</Button>
                      </SignUpButton>
                    </>
                  ) : (
                    <>
                      <Link href="/sign-in" className="flex-1">
                        <Button
                          variant="ghost"
                          className={`w-full ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                          Log in
                        </Button>
                      </Link>
                      <Link href="/sign-up" className="flex-1">
                        <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">Sign up</Button>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
