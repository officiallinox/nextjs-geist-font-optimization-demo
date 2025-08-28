"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  dataUtils, 
  cycleUtils, 
  dateUtils, 
  generateId, 
  CycleData 
} from "@/lib/utils";
import { cn } from "@/lib/utils";

const COMMON_SYMPTOMS = [
  "Cramps", "Headache", "Bloating", "Mood swings", "Fatigue", 
  "Breast tenderness", "Acne", "Back pain", "Nausea", "Food cravings"
];

export default function CyclePage() {
  const [cycles, setCycles] = useState<CycleData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [cycleLength, setCycleLength] = useState<string>("28");
  const [periodLength, setPeriodLength] = useState<string>("5");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calendar states
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  useEffect(() => {
    const loadCycles = () => {
      try {
        const cycleData = dataUtils.getCycleData();
        setCycles(cycleData);
      } catch (error) {
        console.error('Error loading cycle data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCycles();
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
    
    if (!startDate) {
      alert("Please select a start date for your period");
      return;
    }

    setIsSubmitting(true);

    try {
      const newCycle: CycleData = {
        id: generateId(),
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString(),
        cycleLength: parseInt(cycleLength),
        periodLength: parseInt(periodLength),
        symptoms: selectedSymptoms,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString()
      };

      const updatedCycles = [...cycles, newCycle];
      const success = dataUtils.saveCycleData(updatedCycles);

      if (success) {
        setCycles(updatedCycles);
        
        // Reset form
        setStartDate(undefined);
        setEndDate(undefined);
        setCycleLength("28");
        setPeriodLength("5");
        setSelectedSymptoms([]);
        setNotes("");
        
        alert("Cycle data saved successfully!");
      } else {
        alert("Failed to save cycle data. Please try again.");
      }
    } catch (error) {
      console.error('Error saving cycle:', error);
      alert("An error occurred while saving. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCycle = (cycleId: string) => {
    if (confirm("Are you sure you want to delete this cycle entry?")) {
      const updatedCycles = cycles.filter(cycle => cycle.id !== cycleId);
      const success = dataUtils.saveCycleData(updatedCycles);
      
      if (success) {
        setCycles(updatedCycles);
      } else {
        alert("Failed to delete cycle. Please try again.");
      }
    }
  };

  // Get predictions based on latest cycle
  const getPredictions = () => {
    if (cycles.length === 0) return null;
    
    const latestCycle = cycles[cycles.length - 1];
    const today = new Date();
    
    try {
      const nextPeriod = cycleUtils.calculateNextPeriod(latestCycle.startDate, latestCycle.cycleLength);
      const ovulation = cycleUtils.calculateOvulation(latestCycle.startDate, latestCycle.cycleLength);
      const fertileWindow = cycleUtils.calculateFertileWindow(latestCycle.startDate, latestCycle.cycleLength);
      const cycleDay = cycleUtils.calculateCycleDay(today, latestCycle.startDate);
      const phase = cycleUtils.getCyclePhase(cycleDay, latestCycle.cycleLength);
      
      return {
        nextPeriod,
        ovulation,
        fertileWindow,
        cycleDay,
        phase,
        daysUntilPeriod: dateUtils.getDaysUntil(nextPeriod),
        daysUntilOvulation: dateUtils.getDaysUntil(ovulation)
      };
    } catch (error) {
      console.error('Error calculating predictions:', error);
      return null;
    }
  };

  const predictions = getPredictions();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading cycle data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cycle Tracking</h1>
        <p className="text-gray-600 mt-1">Track your menstrual cycle and get predictions</p>
      </div>

      {/* Predictions Card */}
      {predictions && (
        <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
          <CardHeader>
            <CardTitle>Current Cycle Predictions</CardTitle>
            <CardDescription>Based on your latest cycle data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-2xl font-bold text-pink-600">Day {predictions.cycleDay}</p>
                <p className="text-sm text-gray-600">Current Cycle Day</p>
                <Badge variant="secondary" className="mt-1">{predictions.phase}</Badge>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-2xl font-bold text-purple-600">
                  {predictions.daysUntilPeriod > 0 ? `${predictions.daysUntilPeriod} days` : 'Due'}
                </p>
                <p className="text-sm text-gray-600">Next Period</p>
                <p className="text-xs text-gray-500 mt-1">{dateUtils.formatShortDate(predictions.nextPeriod)}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-2xl font-bold text-blue-600">
                  {predictions.daysUntilOvulation > 0 ? `${predictions.daysUntilOvulation} days` : 'Today'}
                </p>
                <p className="text-sm text-gray-600">Ovulation</p>
                <p className="text-xs text-gray-500 mt-1">{dateUtils.formatShortDate(predictions.ovulation)}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-lg font-bold text-green-600">
                  {dateUtils.formatShortDate(predictions.fertileWindow.start)} - {dateUtils.formatShortDate(predictions.fertileWindow.end)}
                </p>
                <p className="text-sm text-gray-600">Fertile Window</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Add New Cycle */}
        <Card>
          <CardHeader>
            <CardTitle>Log New Cycle</CardTitle>
            <CardDescription>Record your menstrual cycle information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Period Start Date *</Label>
                <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      {startDate ? dateUtils.formatDate(startDate) : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setShowStartCalendar(false);
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="endDate">Period End Date (Optional)</Label>
                <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      {endDate ? dateUtils.formatDate(endDate) : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setShowEndCalendar(false);
                      }}
                      disabled={(date) => {
                        if (date > new Date()) return true;
                        if (startDate && date < startDate) return true;
                        return false;
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Cycle Length */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cycleLength">Cycle Length (days)</Label>
                  <Input
                    id="cycleLength"
                    type="number"
                    min="21"
                    max="35"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(e.target.value)}
                    placeholder="28"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodLength">Period Length (days)</Label>
                  <Input
                    id="periodLength"
                    type="number"
                    min="3"
                    max="8"
                    value={periodLength}
                    onChange={(e) => setPeriodLength(e.target.value)}
                    placeholder="5"
                  />
                </div>
              </div>

              {/* Symptoms */}
              <div className="space-y-2">
                <Label>Symptoms</Label>
                <div className="grid grid-cols-2 gap-2">
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
                  placeholder="Any additional notes about this cycle..."
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-pink-500 hover:bg-pink-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Cycle Data"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Cycle History */}
        <Card>
          <CardHeader>
            <CardTitle>Cycle History</CardTitle>
            <CardDescription>Your previous cycle records</CardDescription>
          </CardHeader>
          <CardContent>
            {cycles.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cycles
                  .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                  .map((cycle) => (
                    <div key={cycle.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {dateUtils.formatDate(new Date(cycle.startDate))}
                            {cycle.endDate && ` - ${dateUtils.formatDate(new Date(cycle.endDate))}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            Cycle: {cycle.cycleLength} days • Period: {cycle.periodLength} days
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCycle(cycle.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                      
                      {cycle.symptoms.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {cycle.symptoms.map((symptom) => (
                            <Badge key={symptom} variant="secondary" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      {cycle.notes && (
                        <p className="text-sm text-gray-600 italic">{cycle.notes}</p>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No cycle data recorded yet</p>
                <p className="text-sm text-gray-500 mt-1">Start by logging your first cycle</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
