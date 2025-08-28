"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  dataUtils, 
  generateId, 
  dateUtils,
  Question,
  Answer 
} from "@/lib/utils";

export default function CommunityPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state for new question
  const [newQuestion, setNewQuestion] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state for new answer
  const [answerText, setAnswerText] = useState<string>("");
  const [answerAnonymous, setAnswerAnonymous] = useState<boolean>(true);
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);

  useEffect(() => {
    const loadQuestions = () => {
      try {
        const questionData = dataUtils.getQuestions();
        setQuestions(questionData);
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newQuestion.trim()) {
      alert("Please enter your question");
      return;
    }

    setIsSubmitting(true);

    try {
      const question: Question = {
        id: generateId(),
        question: newQuestion.trim(),
        isAnonymous,
        createdAt: new Date().toISOString(),
        answers: []
      };

      const updatedQuestions = [...questions, question];
      const success = dataUtils.saveQuestions(updatedQuestions);

      if (success) {
        setQuestions(updatedQuestions);
        setNewQuestion("");
        setIsAnonymous(true);
        alert("Your question has been posted successfully!");
      } else {
        alert("Failed to post question. Please try again.");
      }
    } catch (error) {
      console.error('Error posting question:', error);
      alert("An error occurred while posting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitAnswer = async (questionId: string) => {
    if (!answerText.trim()) {
      alert("Please enter your answer");
      return;
    }

    try {
      const answer: Answer = {
        id: generateId(),
        answer: answerText.trim(),
        isAnonymous: answerAnonymous,
        createdAt: new Date().toISOString()
      };

      const updatedQuestions = questions.map(question => {
        if (question.id === questionId) {
          return {
            ...question,
            answers: [...(question.answers || []), answer]
          };
        }
        return question;
      });

      const success = dataUtils.saveQuestions(updatedQuestions);

      if (success) {
        setQuestions(updatedQuestions);
        setAnswerText("");
        setAnswerAnonymous(true);
        setAnsweringQuestionId(null);
        alert("Your answer has been posted successfully!");
      } else {
        alert("Failed to post answer. Please try again.");
      }
    } catch (error) {
      console.error('Error posting answer:', error);
      alert("An error occurred while posting. Please try again.");
    }
  };

  const deleteQuestion = (questionId: string) => {
    if (confirm("Are you sure you want to delete this question?")) {
      const updatedQuestions = questions.filter(q => q.id !== questionId);
      const success = dataUtils.saveQuestions(updatedQuestions);
      
      if (success) {
        setQuestions(updatedQuestions);
      } else {
        alert("Failed to delete question. Please try again.");
      }
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return dateUtils.formatShortDate(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Community Support</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Connect with others, ask questions, and share experiences in a safe, supportive environment.
        </p>
      </div>

      <Tabs defaultValue="questions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="questions">Q&A Forum</TabsTrigger>
          <TabsTrigger value="ask">Ask Question</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        {/* Q&A Forum */}
        <TabsContent value="questions" className="space-y-4">
          {questions.length > 0 ? (
            <div className="space-y-4">
              {questions
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((question) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{question.question}</CardTitle>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={question.isAnonymous ? "secondary" : "outline"}>
                              {question.isAnonymous ? "Anonymous" : "User"}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatTimeAgo(question.createdAt)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Answers */}
                      {question.answers && question.answers.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">
                            Answers ({question.answers.length})
                          </h4>
                          {question.answers.map((answer) => (
                            <div key={answer.id} className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-gray-700 mb-2">{answer.answer}</p>
                              <div className="flex items-center space-x-2">
                                <Badge variant={answer.isAnonymous ? "secondary" : "outline"} className="text-xs">
                                  {answer.isAnonymous ? "Anonymous" : "User"}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {formatTimeAgo(answer.createdAt)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Answer Form */}
                      {answeringQuestionId === question.id ? (
                        <div className="space-y-3 border-t pt-4">
                          <Label htmlFor={`answer-${question.id}`}>Your Answer</Label>
                          <Textarea
                            id={`answer-${question.id}`}
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            placeholder="Share your experience or advice..."
                            rows={3}
                          />
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`anonymous-answer-${question.id}`}
                              checked={answerAnonymous}
                              onCheckedChange={setAnswerAnonymous}
                            />
                            <Label htmlFor={`anonymous-answer-${question.id}`} className="text-sm">
                              Post anonymously
                            </Label>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleSubmitAnswer(question.id)}
                              size="sm"
                              className="bg-pink-500 hover:bg-pink-600"
                            >
                              Post Answer
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAnsweringQuestionId(null);
                                setAnswerText("");
                                setAnswerAnonymous(true);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAnsweringQuestionId(question.id)}
                          className="mt-2"
                        >
                          Answer Question
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600 mb-4">No questions posted yet</p>
                <p className="text-sm text-gray-500">Be the first to ask a question and start the conversation!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Ask Question */}
        <TabsContent value="ask">
          <Card>
            <CardHeader>
              <CardTitle>Ask a Question</CardTitle>
              <CardDescription>
                Get support and advice from the community. Your privacy is protected.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Your Question *</Label>
                  <Textarea
                    id="question"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Ask about birth control, reproductive health, experiences, or any related topic..."
                    rows={4}
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                  <Label htmlFor="anonymous">Post anonymously</Label>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-pink-500 hover:bg-pink-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Posting..." : "Post Question"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Community Guidelines */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800">
              <ul className="space-y-2 text-sm">
                <li>• Be respectful and supportive of all community members</li>
                <li>• Share experiences and advice, but remember everyone's situation is different</li>
                <li>• Do not provide specific medical diagnoses or treatment recommendations</li>
                <li>• Encourage others to consult healthcare providers for medical concerns</li>
                <li>• Keep discussions relevant to reproductive health and birth control</li>
                <li>• Report any inappropriate content or behavior</li>
                <li>• Remember that this is a safe space for all individuals</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources */}
        <TabsContent value="resources" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Professional Help */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Support</CardTitle>
                <CardDescription>Connect with healthcare professionals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">Find a Healthcare Provider</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Use online directories to find gynecologists, family planning clinics, and reproductive health specialists in your area.
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">Telemedicine Options</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Many providers now offer virtual consultations for birth control counseling and prescription management.
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">Emergency Contacts</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Keep your healthcare provider's emergency contact information readily available.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Crisis Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Crisis & Support Resources</CardTitle>
                <CardDescription>Immediate help when you need it</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800">Crisis Hotlines</h4>
                  <p className="text-sm text-red-700 mt-1">
                    National Suicide Prevention Lifeline: 988<br/>
                    Crisis Text Line: Text HOME to 741741
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-800">Sexual Assault Support</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    RAINN National Hotline: 1-800-656-HOPE (4673)<br/>
                    Available 24/7 for confidential support
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800">Domestic Violence Support</h4>
                  <p className="text-sm text-green-700 mt-1">
                    National Domestic Violence Hotline: 1-800-799-7233<br/>
                    Text START to 88788
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Educational Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Educational Resources</CardTitle>
                <CardDescription>Reliable sources for reproductive health information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">Planned Parenthood</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Comprehensive reproductive health information and services
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">CDC Reproductive Health</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Evidence-based information on contraception and reproductive health
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">ACOG Patient Resources</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    American College of Obstetricians and Gynecologists patient education materials
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Local Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Local Resources</CardTitle>
                <CardDescription>Find help in your community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">Community Health Centers</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Federally qualified health centers often provide reproductive health services on a sliding fee scale
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">University Health Centers</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Many colleges and universities offer reproductive health services to students
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">Support Groups</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Look for local support groups for reproductive health, fertility, or related concerns
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Privacy Notice */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <p className="text-sm text-yellow-800">
            <strong>Privacy Notice:</strong> This community forum stores data locally on your device. 
            While we encourage anonymous posting for privacy, please avoid sharing personally identifiable information. 
            For medical emergencies, contact your healthcare provider or emergency services immediately.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
