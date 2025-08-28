"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  dataUtils, 
  cycleUtils, 
  dateUtils, 
  CycleData, 
  Reminder, 
  HealthLog 
} from "@/lib/utils";
import Link from "next/link";

export default function DashboardPage() {
  const [cycles, setCycles] = useState<CycleData[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage
    const loadData = () => {
      try {
        const cycleData = dataUtils.getCycleData();
        const reminderData = dataUtils.getReminders();
        const healthData = dataUtils.getHealthLogs();
        
        setCycles(cycleData);
        setReminders(reminderData);
        setHealthLogs(healthData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get current cycle information
  const getCurrentCycleInfo = () => {
    if (cycles.length === 0) return null;
    
    const latestCycle = cycles[cycles.length - 1];
    const today = new Date();
    const cycleDay = cycleUtils.calculateCycleDay(today, latestCycle.startDate);
    const phase = cycleUtils.getCyclePhase(cycleDay, latestCycle.cycleLength);
    const nextPeriod = cycleUtils.calculateNextPeriod(latestCycle.startDate, latestCycle.cycleLength);
    const ovulation = cycleUtils.calculateOvulation(latestCycle.startDate, latestCycle.cycleLength);
    const fertileWindow = cycleUtils.calculateFertileWindow(latestCycle.startDate, latestCycle.cycleLength);
    
    return {
      cycleDay,
      phase,
      nextPeriod,
      ovulation,
      fertileWindow,
      daysUntilPeriod: dateUtils.getDaysUntil(nextPeriod),
      daysUntilOvulation: dateUtils.getDaysUntil(ovulation),
      isInFertileWindow: cycleUtils.isInFertileWindow(today, latestCycle.startDate, latestCycle.cycleLength)
    };
  };

  // Get upcoming reminders (next 3 days)
  const getUpcomingReminders = () => {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    return reminders
      .filter(reminder => reminder.isActive)
      .slice(0, 3); // Show first 3 active reminders
  };

  // Get recent health trends
  const getRecentHealthTrends = () => {
    const recentLogs = healthLogs
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7); // Last 7 entries
    
    return recentLogs;
  };

  const currentCycle = getCurrentCycleInfo();
  const upcomingReminders = getUpcomingReminders();
  const recentHealth = getRecentHealthTrends();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Your reproductive health overview</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Today</p>
          <p className="text-lg font-semibold">{dateUtils.formatDate(new Date())}</p>
        </div>
      </div>

      {/* Current Cycle Status */}
      {currentCycle ? (
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Current Cycle Status</span>
              <Badge variant={currentCycle.isInFertileWindow ? "destructive" : "secondary"}>
                {currentCycle.phase}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-600">Day {currentCycle.cycleDay}</p>
                <p className="text-sm text-gray-600">Cycle Day</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {currentCycle.daysUntilPeriod > 0 ? currentCycle.daysUntilPeriod : 0} days
                </p>
                <p className="text-sm text-gray-600">Until Next Period</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {currentCycle.daysUntilOvulation > 0 ? currentCycle.daysUntilOvulation : 0} days
                </p>
                <p className="text-sm text-gray-600">Until Ovulation</p>
              </div>
            </div>
            
            {currentCycle.isInFertileWindow && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 font-medium text-center">
                  You are currently in your fertile window
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Cycle Progress</span>
                <span>{Math.round((currentCycle.cycleDay / 28) * 100)}%</span>
              </div>
              <Progress value={(currentCycle.cycleDay / 28) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">No cycle data found. Start tracking your cycle to see predictions and insights.</p>
            <Link href="/cycle">
              <Button className="bg-pink-500 hover:bg-pink-600">Start Cycle Tracking</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Reminders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upcoming Reminders</span>
              <Link href="/reminders">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardTitle>
            <CardDescription>Your birth control reminders</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingReminders.length > 0 ? (
              <div className="space-y-3">
                {upcomingReminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{reminder.title}</p>
                      <p className="text-sm text-gray-600 capitalize">{reminder.type} • {reminder.frequency}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{reminder.time}</p>
                      <Badge variant={reminder.isActive ? "default" : "secondary"} className="text-xs">
                        {reminder.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-3">No reminders set</p>
                <Link href="/reminders">
                  <Button variant="outline" size="sm">Add Reminder</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Health Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Health Logs</span>
              <Link href="/health">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardTitle>
            <CardDescription>Your recent health entries</CardDescription>
          </CardHeader>
          <CardContent>
            {recentHealth.length > 0 ? (
              <div className="space-y-3">
                {recentHealth.slice(0, 3).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{dateUtils.formatShortDate(new Date(log.date))}</p>
                      <p className="text-sm text-gray-600">
                        Mood: {log.mood} • {log.symptoms.length} symptoms
                      </p>
                    </div>
                    {log.weight && (
                      <div className="text-right">
                        <p className="text-sm font-medium">{log.weight} lbs</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-3">No health logs yet</p>
                <Link href="/health">
                  <Button variant="outline" size="sm">Add Health Log</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/cycle">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <span className="text-2xl mb-1">📅</span>
                <span className="text-sm">Log Period</span>
              </Button>
            </Link>
            <Link href="/reminders">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <span className="text-2xl mb-1">⏰</span>
                <span className="text-sm">Set Reminder</span>
              </Button>
            </Link>
            <Link href="/health">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <span className="text-2xl mb-1">📊</span>
                <span className="text-sm">Log Symptoms</span>
              </Button>
            </Link>
            <Link href="/education">
              <Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                <span className="text-2xl mb-1">📚</span>
                <span className="text-sm">Learn</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
