"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome to FemCare
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your comprehensive companion for birth control management, cycle tracking, and reproductive health monitoring.
        </p>
        <Button 
          onClick={() => router.push('/dashboard')} 
          size="lg"
          className="mt-6 bg-pink-500 hover:bg-pink-600"
        >
          Get Started
        </Button>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Cycle Tracking</CardTitle>
            <CardDescription>
              Track your menstrual cycle and get predictions for fertile and safe days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => router.push('/cycle')}
              className="w-full"
            >
              Start Tracking
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Birth Control Reminders</CardTitle>
            <CardDescription>
              Set reminders for pills, injections, and other contraceptive methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => router.push('/reminders')}
              className="w-full"
            >
              Set Reminders
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Health Monitoring</CardTitle>
            <CardDescription>
              Log symptoms, track weight, and monitor your overall health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => router.push('/health')}
              className="w-full"
            >
              Monitor Health
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Education</CardTitle>
            <CardDescription>
              Learn about family planning, contraceptive methods, and reproductive health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => router.push('/education')}
              className="w-full"
            >
              Learn More
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Community Support</CardTitle>
            <CardDescription>
              Connect with others, ask questions, and get support anonymously
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => router.push('/community')}
              className="w-full"
            >
              Join Community
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">Dashboard</CardTitle>
            <CardDescription>
              View your overview, upcoming reminders, and recent activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              View Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
