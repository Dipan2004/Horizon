import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare, 
  Clock, 
  SkipForward, 
  Send, 
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Question {
  id: string;
  text: string;
  type: string;
  difficulty: string;
}

interface InterviewSession {
  id: number;
  questions: Question[];
  responses: any[];
  completed: boolean;
}

interface Feedback {
  score: number;
  strengths: string[];
  improvements: string[];
  suggestion: string;
}

export default function MockInterview() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [response, setResponse] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [responseTime, setResponseTime] = useState("0m 0s");
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Start interview session
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/interview/start', {
        userId: 1,
        companyName: "TechCorp Inc.",
        position: "Senior Developer"
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSessionId(data.id);
      setStartTime(new Date());
      toast({
        title: "Interview started",
        description: "Your mock interview session has begun."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to start interview",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Get interview session
  const { data: session, isLoading } = useQuery<InterviewSession>({
    queryKey: ['/api/interview/sessions', sessionId],
    enabled: !!sessionId,
    queryFn: async () => {
      const response = await fetch(`/api/interview/sessions/1`);
      const sessions = await response.json();
      return sessions.find((s: InterviewSession) => s.id === sessionId);
    }
  });

  // Submit response
  const submitResponseMutation = useMutation({
    mutationFn: async ({ questionId, response }: { questionId: string; response: string }) => {
      const res = await apiRequest('POST', `/api/interview/${sessionId}/response`, {
        questionId,
        response
      });
      return res.json();
    },
    onSuccess: (data) => {
      setFeedback(data.feedback);
      setResponse("");
      setWordCount(0);
      toast({
        title: "Response submitted",
        description: "AI feedback has been generated for your answer."
      });
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update word count
  useEffect(() => {
    const words = response.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [response]);

  // Update response time
  useEffect(() => {
    if (!startTime) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setResponseTime(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const currentQuestion = session?.questions?.[currentQuestionIndex];
  const progress = session ? ((currentQuestionIndex + 1) / session.questions.length) * 100 : 0;

  const handleSubmitResponse = () => {
    if (!currentQuestion || !response.trim() || !sessionId) return;
    
    submitResponseMutation.mutate({
      questionId: currentQuestion.id,
      response: response.trim()
    });
  };

  const handleNextQuestion = () => {
    if (!session || currentQuestionIndex >= session.questions.length - 1) return;
    
    setCurrentQuestionIndex(prev => prev + 1);
    setFeedback(null);
    setStartTime(new Date());
  };

  const handleSkipQuestion = () => {
    handleNextQuestion();
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Main Interview Panel */}
      <div className="lg:col-span-2">
        <Card className="bg-surface shadow-sm border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-foreground">Mock Interview</CardTitle>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">Voice</Button>
                <Button variant="secondary" size="sm">Text</Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {!sessionId ? (
              <div className="text-center py-8">
                <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Ready to practice?</h3>
                <p className="text-muted-foreground mb-6">
                  Start your mock interview session to practice with AI-generated questions.
                </p>
                <Button 
                  onClick={() => startSessionMutation.mutate()}
                  disabled={startSessionMutation.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {startSessionMutation.isPending ? "Starting..." : "Start Interview"}
                </Button>
              </div>
            ) : (
              <>
                {/* Current Question */}
                {currentQuestion && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-white text-sm font-medium">AI</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <p className="text-foreground font-medium">
                            Question #{currentQuestionIndex + 1}
                          </p>
                          <Badge variant="outline">{currentQuestion.type}</Badge>
                          <Badge variant="outline">{currentQuestion.difficulty}</Badge>
                        </div>
                        <p className="text-foreground">{currentQuestion.text}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Response Input */}
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type your response here..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    className="min-h-32 resize-none"
                    disabled={submitResponseMutation.isPending}
                  />
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Response time: {responseTime}</span>
                      </div>
                      <span>Word count: {wordCount}</span>
                    </div>
                    <div className="flex space-x-3">
                      <Button 
                        variant="outline" 
                        onClick={handleSkipQuestion}
                        disabled={!session || currentQuestionIndex >= session.questions.length - 1}
                      >
                        <SkipForward className="w-4 h-4 mr-2" />
                        Skip Question
                      </Button>
                      <Button 
                        onClick={handleSubmitResponse}
                        disabled={!response.trim() || submitResponseMutation.isPending}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {submitResponseMutation.isPending ? "Submitting..." : "Submit Answer"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* AI Feedback */}
                {feedback && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900 mb-2">AI Feedback</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-blue-800">Score:</span>
                            <Badge className="bg-blue-100 text-blue-800">{feedback.score}/10</Badge>
                          </div>
                          {feedback.strengths && feedback.strengths.length > 0 && (
                            <div>
                              <span className="text-blue-800 font-medium">Strengths:</span>
                              <ul className="list-disc list-inside text-blue-700 ml-2">
                                {feedback.strengths.map((strength, index) => (
                                  <li key={index}>{strength}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {feedback.improvements && feedback.improvements.length > 0 && (
                            <div>
                              <span className="text-blue-800 font-medium">Areas for improvement:</span>
                              <ul className="list-disc list-inside text-blue-700 ml-2">
                                {feedback.improvements.map((improvement, index) => (
                                  <li key={index}>{improvement}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {feedback.suggestion && (
                            <div>
                              <span className="text-blue-800 font-medium">Suggestion:</span>
                              <p className="text-blue-700">{feedback.suggestion}</p>
                            </div>
                          )}
                        </div>
                        {currentQuestionIndex < (session?.questions.length || 0) - 1 && (
                          <Button 
                            className="mt-3" 
                            size="sm" 
                            onClick={handleNextQuestion}
                          >
                            Next Question
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress & Stats Sidebar */}
      <div className="space-y-6">
        {/* Progress Card */}
        <Card className="bg-surface shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Interview Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Questions Answered</span>
              <span className="font-medium text-foreground">
                {session ? `${currentQuestionIndex}/${session.questions.length}` : "0/0"}
              </span>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Avg. Response Time</span>
              <span>{responseTime}</span>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="bg-surface shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Confidence Level</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-muted rounded-full">
                  <div className="w-12 h-2 bg-accent rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-accent">75%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Answer Quality</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-muted rounded-full">
                  <div className="w-14 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-blue-600">85%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Communication</span>
              <div className="flex items-center space-x-2">
                <div className="w-16 h-2 bg-muted rounded-full">
                  <div className="w-10 h-2 bg-yellow-500 rounded-full"></div>
                </div>
                <span className="text-sm font-medium text-yellow-600">65%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="bg-surface shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Use the STAR method for behavioral questions</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Include specific metrics and outcomes</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Keep responses between 1-2 minutes</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
