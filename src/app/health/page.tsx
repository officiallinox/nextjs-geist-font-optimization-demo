"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  dataUtils, 
  generateId, 
  dateUtils,
  HealthLog 
} from "@/lib/utils";
import { cn } from "@/lib/utils";

const COMMON_SYMPTOMS = [
  "Cramps", "Headache", "Bloating", "Mood swings", "Fatigue", 
  "Breast tenderness", "Acne", "Back pain", "Nausea", "Food cravings",
  "Hot flashes", "Sleep issues", "Anxiety", "Depression", "Irritability"
];

const MOOD_OPTIONS = [
  { value: "great", label: "Great", color: "bg-green-500" },
  { value: "good", label: "Good", color: "bg-blue-500" },
  { value: "okay", label: "Okay", color: "bg-yellow-500" },
  { value: "bad", label: "Bad", color: "bg-orange-500" },
  { value: "terrible", label: "Terrible", color: "bg-red-500" }
];

export default function HealthPage() {
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState<string>("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const loadHealthLogs = () => {
      try {
        const healthData = dataUtils.getHealthLogs();
        setHealthLogs(healthData);
      } catch (error) {
        console.error('Error loading health logs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadHealthLogs();
  }, []);

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mood) {
      alert("Please select your mood for the day");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if log already exists for this date
      const dateString = selectedDate.toISOString().split('T')[0];
      const existingLogIndex = healthLogs.findIndex(log => 
        log.date.split('T')[0] === dateString
      );

      const logData: HealthLog = {
        id: existingLogIndex >= 0 ? healthLogs[existingLogIndex].id : generateId(),
        date: selectedDate.toISOString(),
        weight: weight ? parseFloat(weight) : undefined,
        symptoms: selectedSymptoms,
        mood,
        notes: notes.trim() || undefined,
        createdAt: existingLogIndex >= 0 ? healthLogs[existingLogIndex].createdAt : new Date().toISOString()
      };

      let updatedLogs: HealthLog[];
      if (existingLogIndex >= 0) {
        // Update existing log
        updatedLogs = [...healthLogs];
        updatedLogs[existingLogIndex] = logData;
      } else {
        // Add new log
        updatedLogs = [...healthLogs, logData];
      }

      const success = dataUtils.saveHealthLogs(updatedLogs);

      if (success) {
        setHealthLogs(updatedLogs);
        
        // Reset form
        setSelectedDate(new Date());
        setWeight("");
        setSelectedSymptoms([]);
        setMood("");
        setNotes("");
        
        alert(existingLogIndex >= 0 ? "Health log updated successfully!" : "Health log saved successfully!");
      } else {
        alert("Failed to save health log. Please try again.");
      }
    } catch (error) {
      console.error('Error saving health log:', error);
      alert("An error occurred while saving. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteHealthLog = (logId: string) => {
    if (confirm("Are you sure you want to delete this health log?")) {
      const updatedLogs = healthLogs.filter(log => log.id !== logId);
      const success = dataUtils.saveHealthLogs(updatedLogs);
      
      if (success) {
        setHealthLogs(updatedLogs);
      } else {
        alert("Failed to delete health log. Please try again.");
      }
    }
  };

  const getMoodColor = (moodValue: string) => {
    const moodOption = MOOD_OPTIONS.find(option => option.value === moodValue);
    return moodOption ? moodOption.color : "bg-gray-500";
  };

  const getMoodLabel = (moodValue: string) => {
    const moodOption = MOOD_OPTIONS.find(option => option.value === moodValue);
    return moodOption ? moodOption.label : moodValue;
  };

  // Calculate BMI if weight is available
  const calculateBMI = (weightLbs: number, heightFt: number = 5.5): number => {
    const heightInches = heightFt * 12;
    const bmi = (weightLbs / (heightInches * heightInches)) * 703;
    return Math.round(bmi * 10) / 10;
  };

  // Get health trends
  const getHealthTrends = () => {
    if (healthLogs.length === 0) return null;

    const recentLogs = healthLogs
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30); // Last 30 entries

    const avgWeight = recentLogs
      .filter(log => log.weight)
      .reduce((sum, log, _, arr) => sum + (log.weight! / arr.length), 0);

    const moodCounts = recentLogs.reduce((acc, log) => {
      acc[log.mood] = (acc[log.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    const symptomCounts = recentLogs.reduce((acc, log) => {
      log.symptoms.forEach(symptom => {
        acc[symptom] = (acc[symptom] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const mostCommonSymptoms = Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    return {
      avgWeight: avgWeight || null,
      mostCommonMood,
      mostCommonSymptoms,
      totalEntries: recentLogs.length
    };
  };

  const trends = getHealthTrends();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Health Monitoring</h1>
        <p className="text-gray-600 mt-1">Track your symptoms, mood, and overall health</p>
      </div>

      {/* Health Trends */}
      {trends && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardHeader>
            <CardTitle>Health Trends</CardTitle>
            <CardDescription>Based on your recent health logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{trends.totalEntries}</p>
                <p className="text-sm text-gray-600">Total Entries</p>
              </div>
              {trends.avgWeight && (
                <div className="text-center p-4 bg-white rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{trends.avgWeight.toFixed(1)} lbs</p>
                  <p className="text-sm text-gray-600">Average Weight</p>
                  <p className="text-xs text-gray-500">BMI: {calculateBMI(trends.avgWeight)}</p>
                </div>
              )}
              {trends.mostCommonMood && (
                <div className="text-center p-4 bg-white rounded-lg">
                  <p className="text-lg font-bold text-purple-600">{getMoodLabel(trends.mostCommonMood)}</p>
                  <p className="text-sm text-gray-600">Most Common Mood</p>
                </div>
              )}
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm font-bold text-orange-600">
                  {trends.mostCommonSymptoms.length > 0 ? trends.mostCommonSymptoms[0][0] : "None"}
                </p>
                <p className="text-sm text-gray-600">Top Symptom</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Add New Health Log */}
        <Card>
          <CardHeader>
            <CardTitle>Log Health Data</CardTitle>
            <CardDescription>Record your daily health information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      {selectedDate ? dateUtils.formatDate(selectedDate) : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        if (date) setSelectedDate(date);
                        setShowCalendar(false);
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (lbs) - Optional</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="50"
                  max="500"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter your weight"
                />
              </div>

              {/* Mood */}
              <div className="space-y-2">
                <Label htmlFor="mood">Mood *</Label>
                <Select value={mood} onValueChange={setMood} required>
                  <SelectTrigger>
                    <SelectValue placeholder="How are you feeling today?" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOOD_OPTIONS.map((moodOption) => (
                      <SelectItem key={moodOption.value} value={moodOption.value}>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${moodOption.color}`}></div>
                          <span>{moodOption.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Symptoms */}
              <div className="space-y-2">
                <Label>Symptoms</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {COMMON_SYMPTOMS.map((symptom) => (
                    <div key={symptom} className="flex items-center space-x-2">
                      <Checkbox
                        id={symptom}
                        checked={selectedSymptoms.includes(symptom)}
                        onCheckedChange={() => handleSymptomToggle(symptom)}
                      />
                      <Label htmlFor={symptom} className="text-sm">{symptom}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes about your health today..."
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-pink-500 hover:bg-pink-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Health Log"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Health History */}
        <Card>
          <CardHeader>
            <CardTitle>Health History</CardTitle>
            <CardDescription>Your previous health logs</CardDescription>
          </CardHeader>
          <CardContent>
            {healthLogs.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {healthLogs
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((log) => (
                    <div key={log.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{dateUtils.formatDate(new Date(log.date))}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className={`w-3 h-3 rounded-full ${getMoodColor(log.mood)}`}></div>
                            <span className="text-sm text-gray-600">Mood: {getMoodLabel(log.mood)}</span>
                            {log.weight && (
                              <span className="text-sm text-gray-600">• Weight: {log.weight} lbs</span>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteHealthLog(log.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                      
                      {log.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {log.symptoms.map((symptom) => (
                            <Badge key={symptom} variant="secondary" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {log.notes && (
                        <p className="text-sm text-gray-600 italic">{log.notes}</p>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No health logs recorded yet</p>
                <p className="text-sm text-gray-500 mt-1">Start by logging your first health entry</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Health Tips */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">Health Tracking Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-green-800">
          <ul className="space-y-2 text-sm">
            <li>• Track your health daily for better pattern recognition</li>
            <li>• Note any correlation between symptoms and your menstrual cycle</li>
            <li>• Regular weight tracking can help identify health trends</li>
            <li>• Share your health logs with your healthcare provider during visits</li>
            <li>• Look for patterns in mood changes and symptoms</li>
            <li>• Consider tracking sleep, exercise, and diet for comprehensive health monitoring</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
