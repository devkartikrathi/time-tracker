"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  const router = useRouter();
  const [occupation, setOccupation] = React.useState("");
  const [age, setAge] = React.useState("");
  const [focus, setFocus] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // If already completed, go home
    if (typeof window !== "undefined") {
      const done = localStorage.getItem("onboardingCompleted");
      if (done === "true") {
        router.replace("/");
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = { occupation, age, focus, ts: Date.now() };
    try {
      // Send to API to save onboarding data
      try {
        const response = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ occupation, age, focus }),
        });
        
        const responseData = await response.json();
        
        if (response.ok) {
          // Set localStorage as backup
          if (typeof window !== "undefined") {
            localStorage.setItem("onboardingCompleted", "true");
            localStorage.setItem("onboardingData", JSON.stringify(payload));
          }
          // Redirect to app
          router.replace("/");
          return;
        } else {
          alert(`Onboarding failed: ${responseData.error}`);
        }
      } catch (apiError) {
        alert('Failed to save onboarding data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 px-6">
      <Card className="w-full max-w-2xl border-gray-200 dark:border-gray-800 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold">
            Welcome to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TimeTracker</span>
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Help us personalize your experience. This takes less than a minute.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Occupation</Label>
                <Input
                  placeholder="e.g., Student, Engineer, Designer"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Age</Label>
                <Input type="number" min={1} max={120} placeholder="e.g., 27" value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>What do you want to focus on?</Label>
              <Input placeholder="e.g., Deep work, sleep, learning" value={focus} onChange={(e) => setFocus(e.target.value)} />
            </div>

            <div className="flex items-center justify-end pt-2">
              <Button
                type="submit"
                disabled={loading || !occupation || !age || !focus}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                {loading ? "Saving..." : "Continue"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


