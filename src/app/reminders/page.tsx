"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  dataUtils, 
  generateId, 
  Reminder 
} from "@/lib/utils";

const REMINDER_TYPES = [
  { value: 'pill', label: 'Birth Control Pill' },
  { value: 'injection', label: 'Contraceptive Injection' },
  { value: 'condom', label: 'Condom Use Tracking' },
  { value: 'other', label: 'Other' }
];

const FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'custom', label: 'Custom' }
];

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadReminders = () => {
      try {
        const reminderData = dataUtils.getReminders();
        setReminders(reminderData);
      } catch (error) {
        console.error('Error loading reminders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReminders();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !type || !time || !frequency) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const newReminder: Reminder = {
        id: generateId(),
        type: type as 'pill' | 'injection' | 'condom' | 'other',
        title: title.trim(),
        time,
        frequency: frequency as 'daily' | 'weekly' | 'monthly' | 'custom',
        isActive: true,
        createdAt: new Date().toISOString()
      };

      const updatedReminders = [...reminders, newReminder];
      const success = dataUtils.saveReminders(updatedReminders);

      if (success) {
        setReminders(updatedReminders);
        
        // Reset form
        setTitle("");
        setType("");
        setTime("");
        setFrequency("");
        
        alert("Reminder created successfully!");
      } else {
        alert("Failed to save reminder. Please try again.");
      }
    } catch (error) {
      console.error('Error saving reminder:', error);
      alert("An error occurred while saving. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReminder = (reminderId: string) => {
    const updatedReminders = reminders.map(reminder =>
      reminder.id === reminderId
        ? { ...reminder, isActive: !reminder.isActive }
        : reminder
    );
    
    const success = dataUtils.saveReminders(updatedReminders);
    if (success) {
      setReminders(updatedReminders);
    } else {
      alert("Failed to update reminder. Please try again.");
    }
  };

  const deleteReminder = (reminderId: string) => {
    if (confirm("Are you sure you want to delete this reminder?")) {
      const updatedReminders = reminders.filter(reminder => reminder.id !== reminderId);
      const success = dataUtils.saveReminders(updatedReminders);
      
      if (success) {
        setReminders(updatedReminders);
      } else {
        alert("Failed to delete reminder. Please try again.");
      }
    }
  };

  const markAsTaken = (reminderId: string) => {
    const updatedReminders = reminders.map(reminder =>
      reminder.id === reminderId
        ? { ...reminder, lastTaken: new Date().toISOString() }
        : reminder
    );
    
    const success = dataUtils.saveReminders(updatedReminders);
    if (success) {
      setReminders(updatedReminders);
    } else {
      alert("Failed to update reminder. Please try again.");
    }
  };

  const getTypeLabel = (type: string) => {
    const typeObj = REMINDER_TYPES.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getFrequencyLabel = (freq: string) => {
    const freqObj = FREQUENCIES.find(f => f.value === freq);
    return freqObj ? freqObj.label : freq;
  };

  const formatLastTaken = (lastTaken?: string) => {
    if (!lastTaken) return "Never";
    
    const date = new Date(lastTaken);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Birth Control Reminders</h1>
        <p className="text-gray-600 mt-1">Set and manage your contraceptive reminders</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Add New Reminder */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Reminder</CardTitle>
            <CardDescription>Set up a new birth control reminder</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Reminder Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Take birth control pill"
                  required
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">Contraceptive Type *</Label>
                <Select value={type} onValueChange={setType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contraceptive type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REMINDER_TYPES.map((reminderType) => (
                      <SelectItem key={reminderType.value} value={reminderType.value}>
                        {reminderType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label htmlFor="time">Reminder Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>

              {/* Frequency */}
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency *</Label>
                <Select value={frequency} onValueChange={setFrequency} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-pink-500 hover:bg-pink-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Reminder"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Reminders */}
        <Card>
          <CardHeader>
            <CardTitle>Your Reminders</CardTitle>
            <CardDescription>Manage your active reminders</CardDescription>
          </CardHeader>
          <CardContent>
            {reminders.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {reminders
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((reminder) => (
                    <div key={reminder.id} className="p-4 border rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">{reminder.title}</h3>
                          <p className="text-sm text-gray-600">
                            {getTypeLabel(reminder.type)} • {reminder.time} • {getFrequencyLabel(reminder.frequency)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={reminder.isActive}
                            onCheckedChange={() => toggleReminder(reminder.id)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteReminder(reminder.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant={reminder.isActive ? "default" : "secondary"}>
                            {reminder.isActive ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Last taken: {formatLastTaken(reminder.lastTaken)}
                          </span>
                        </div>
                        
                        {reminder.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsTaken(reminder.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            Mark as Taken
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No reminders set up yet</p>
                <p className="text-sm text-gray-500 mt-1">Create your first reminder to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Reminder Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ul className="space-y-2 text-sm">
            <li>• Set reminders for the same time each day for birth control pills</li>
            <li>• Use the "Mark as Taken" feature to track your compliance</li>
            <li>• Set injection reminders 1-2 weeks before your next appointment</li>
            <li>• Enable browser notifications for better reminder effectiveness</li>
            <li>• Consider setting backup reminders 15-30 minutes after the main one</li>
          </ul>
        </CardContent>
      </Card>

      {/* Statistics */}
      {reminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Reminder Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-600">{reminders.length}</p>
                <p className="text-sm text-gray-600">Total Reminders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {reminders.filter(r => r.isActive).length}
                </p>
                <p className="text-sm text-gray-600">Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {reminders.filter(r => r.type === 'pill').length}
                </p>
                <p className="text-sm text-gray-600">Pill Reminders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {reminders.filter(r => r.lastTaken).length}
                </p>
                <p className="text-sm text-gray-600">Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
