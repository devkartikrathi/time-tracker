"use client";

import React from 'react';
import { TimeTrackingApp } from "@/components/TimeTrackingApp";
import { Navbar } from "@/components/Navbar";
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, BarChart3, Target, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const hasClerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!hasClerkKey) {
    return (
      <div className="min-h-screen relative bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Navigation */}
        <Navbar isAuthenticated={false} />

        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center">
              {/* Announcement Banner */}
              <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-2 mb-8">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Introducing TimeTracker Pro</span>
                <span className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 cursor-pointer">Learn more →</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
                <span className="block">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Track</span>
                  <span> Time,</span>
                </span>
                <span className="block">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Transform</span>
                  <span> Life</span>
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Break down your 24 hours into meaningful categories. Track work, rest, and personal time with beautiful visualizations and insights.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Link href="/sign-up">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    Start Tracking Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/sign-in">
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
              </div>

              {/* Setup Notice */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8 max-w-4xl mx-auto shadow-lg">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🔧</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-200 mb-4">
                  Setup Required
                </h3>
                <p className="text-amber-700 dark:text-amber-300 mb-6 text-lg">
                  To enable authentication, please add your Clerk API keys to the environment variables.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-amber-600 dark:text-amber-400">
                  <div className="flex items-center space-x-3 p-4 bg-amber-100 dark:bg-amber-800/30 rounded-lg">
                    <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <p className="text-sm">Get your keys from <a href="https://dashboard.clerk.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-amber-800 dark:hover:text-amber-200">Clerk Dashboard</a></p>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-amber-100 dark:bg-amber-800/30 rounded-lg">
                    <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <p className="text-sm">Add them to your <code className="bg-amber-200 dark:bg-amber-700 px-2 py-1 rounded font-mono text-xs">.env.local</code> file</p>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-amber-100 dark:bg-amber-800/30 rounded-lg">
                    <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <p className="text-sm">Restart the development server</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Background Elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-grid-slate/5 animate-grid"></div>
            <div className="absolute -top-56 -right-40 w-[36rem] h-[36rem] bg-gradient-to-br from-blue-500/25 via-purple-500/25 to-pink-500/25 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-56 -left-40 w-[36rem] h-[36rem] bg-gradient-to-tr from-purple-500/25 via-pink-500/25 to-orange-500/25 rounded-full blur-3xl"></div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-24 bg-white/60 dark:bg-gray-900/60 backdrop-blur">
          <div className="absolute inset-0 -z-10 bg-grid-slate/5 animate-grid"></div>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Everything you need to optimize your time
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Powerful features designed to help you understand and improve how you spend your most valuable resource.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature - Smart Analytics */}
              <div className="group p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Smart Analytics</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Get insights into your time patterns with beautiful charts and trend analysis.
                </p>
              </div>

              {/* Feature - Goal Tracking */}
              <div className="group p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Goal Tracking</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Set and track goals for different activities. Stay motivated with progress visualization.
                </p>
              </div>

              {/* Feature - Custom Categories */}
              <div className="group p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Custom Categories</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Create your own categories and subcategories. Organize your time exactly how you want.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative py-24 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="absolute inset-0 -z-10 bg-grid-slate/5 animate-grid"></div>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Trusted by thousands of users
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Join the community of time-conscious individuals
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">10K+</div>
                <div className="text-gray-600 dark:text-gray-300">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2">1M+</div>
                <div className="text-gray-600 dark:text-gray-300">Hours Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-green-600 dark:text-green-400 mb-2">95%</div>
                <div className="text-gray-600 dark:text-gray-300">User Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-orange-600 dark:text-orange-400 mb-2">24/7</div>
                <div className="text-gray-600 dark:text-gray-300">Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section removed */}

        {/* Footer */}
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">© 2025. All rights reserved.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Made with <span className="text-red-500">❤</span> and <span>☕</span></p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // If Clerk is configured, use the authenticated version
  return <AuthenticatedHome />;
}

function AuthenticatedHome() {
  // Dynamically import Clerk components to avoid SSR issues
  const [ClerkComponents, setClerkComponents] = React.useState<any>(null);
  
  React.useEffect(() => {
    import('@clerk/nextjs').then((clerk) => {
      setClerkComponents(clerk);
    });
  }, []);

  if (!ClerkComponents) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  const { useUser, SignInButton, SignUpButton } = ClerkComponents;
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

    if (!isSignedIn) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
          {/* Navigation */}
          <Navbar isAuthenticated={false} />

        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-16">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
                <span className="block">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Track</span>
                  <span> Time,</span>
                </span>
                <span className="block">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Transform</span>
                  <span> Life</span>
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Break down your 24 hours into meaningful categories. Track work, rest, and personal time with beautiful visualizations and insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <SignUpButton mode="modal">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg">
                    Start Tracking Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-gray-300 dark:border-gray-600">
                    Sign In
                  </Button>
                </SignInButton>
              </div>
            </div>
          </div>

        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate/5 animate-grid"></div>
          <div className="absolute -top-56 -right-40 w-[36rem] h-[36rem] bg-gradient-to-br from-blue-500/25 via-purple-500/25 to-pink-500/25 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-56 -left-40 w-[36rem] h-[36rem] bg-gradient-to-tr from-purple-500/25 via-pink-500/25 to-orange-500/25 rounded-full blur-3xl"></div>
        </div>
        </div>

        {/* Features Section */}
        <div className="relative py-24 bg-white/60 dark:bg-gray-900/60 backdrop-blur">
          <div className="absolute inset-0 -z-10 bg-grid-slate/5 animate-grid"></div>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Everything you need to optimize your time
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Powerful features designed to help you understand and improve how you spend your most valuable resource.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature - Smart Analytics */}
              <div className="group p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Smart Analytics</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Get insights into your time patterns with beautiful charts and trend analysis.
                </p>
              </div>

              {/* Feature - Goal Tracking */}
              <div className="group p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Goal Tracking</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Set and track goals for different activities. Stay motivated with progress visualization.
                </p>
              </div>

              {/* Feature - Custom Categories */}
              <div className="group p-8 rounded-2xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Custom Categories</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Create your own categories and subcategories. Organize your time exactly how you want.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">© 2025. All rights reserved.</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Made with <span className="text-red-500">❤</span> and <span>☕</span></p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return <TimeTrackingApp />;
}