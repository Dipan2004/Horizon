import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Calendar, Eye, Trash2, Star, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Interview {
  id: number;
  userEmail: string;
  question: string;
  answer: string;
  score: number | null;
  feedback: string | null;
  createdAt: string;
}

interface InterviewHistoryProps {
  userEmail?: string;
}

export default function InterviewHistory({ userEmail = "demo@example.com" }: InterviewHistoryProps) {
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's interviews
  const { data: interviews = [], isLoading, error } = useQuery<Interview[]>({
    queryKey: [`/api/interviews/${userEmail}`],
    enabled: !!userEmail
  });

  // Delete interview mutation (you'll need to implement this endpoint)
  const deleteMutation = useMutation({
    mutationFn: async (interviewId: number) => {
      const response = await apiRequest('DELETE', `/api/interview/${interviewId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/interviews/${userEmail}`] });
      toast({
        title: "Interview deleted",
        description: "Interview has been removed from your history."
      });
      setSelectedInterview(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete interview",
        variant: "destructive"
      });
    }
  });

  const handleViewInterview = (interview: Interview) => {
    setSelectedInterview(interview);
  };

  const handleDeleteInterview = (interviewId: number) => {
    if (confirm("Are you sure you want to delete this interview?")) {
      deleteMutation.mutate(interviewId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number | null) => {
    if (score === null) return 'secondary';
    if (score >= 8) return 'default';
    if (score >= 6) return 'secondary';
    return 'destructive';
  };

  // Group interviews by date
  const groupedInterviews = interviews.reduce((groups, interview) => {
    const date = new Date(interview.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(interview);
    return groups;
  }, {} as Record<string, Interview[]>);

  // Calculate average score
  const scoresOnly = interviews.filter(i => i.score !== null).map(i => i.score!);
  const averageScore = scoresOnly.length > 0 
    ? scoresOnly.reduce((sum, score) => sum + score, 0) / scoresOnly.length 
    : null;

  if (isLoading) {
    return (
      <Card className="bg-surface shadow-sm border-border">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading interview history...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-surface shadow-sm border-border">
        <CardContent className="p-8 text-center">
          <p className="text-destructive">Failed to load interviews</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Card */}
      {interviews.length > 0 && (
        <Card className="bg-surface shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Interview Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{interviews.length}</div>
                <div className="text-sm text-muted-foreground">Total Interviews</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">{scoresOnly.length}</div>
                <div className="text-sm text-muted-foreground">Scored Interviews</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                  {averageScore ? averageScore.toFixed(1) : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interview List */}
      <Card className="bg-surface shadow-sm border-border">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle className="text-xl text-foreground">Interview History</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent>
          {interviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No interviews completed yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start a mock interview to see your history here
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedInterviews).map(([date, dayInterviews]) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{date}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {dayInterviews.length} interview{dayInterviews.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  
                  <div className="space-y-3 ml-6">
                    {dayInterviews.map((interview) => (
                      <div
                        key={interview.id}
                        className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <MessageSquare className="w-4 h-4 text-primary flex-shrink-0" />
                              <div className="flex items-center space-x-2 min-w-0">
                                <span className="text-sm font-medium text-foreground">
                                  Interview #{interview.id}
                                </span>
                                <div className="flex items-center space-x-1 text-muted-foreground text-xs">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDate(interview.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Question Preview */}
                            <div className="mb-2">
                              <p className="text-sm font-medium text-foreground mb-1">Question:</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {interview.question}
                              </p>
                            </div>
                            
                            {/* Answer Preview */}
                            <div className="mb-3">
                              <p className="text-sm font-medium text-foreground mb-1">Answer:</p>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {interview.answer.substring(0, 150)}...
                              </p>
                            </div>
                            
                            {/* Score and Feedback */}
                            <div className="flex items-center space-x-3">
                              {interview.score !== null && (
                                <Badge variant={getScoreBadgeVariant(interview.score)}>
                                  <Star className="w-3 h-3 mr-1" />
                                  {interview.score}/10
                                </Badge>
                              )}
                              {interview.feedback && (
                                <Badge variant="outline" className="text-xs">
                                  Has Feedback
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewInterview(interview)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteInterview(interview.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interview Detail Modal */}
      {selectedInterview && (
        <Card className="bg-surface shadow-sm border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-foreground">
                    Interview #{selectedInterview.id}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedInterview.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {selectedInterview.score !== null && (
                  <Badge variant={getScoreBadgeVariant(selectedInterview.score)}>
                    <Star className="w-3 h-3 mr-1" />
                    {selectedInterview.score}/10
                  </Badge>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedInterview(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Question */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Question</h4>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-foreground">{selectedInterview.question}</p>
              </div>
            </div>

            {/* Answer */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Your Answer</h4>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {selectedInterview.answer}
                </p>
              </div>
            </div>

            {/* Feedback */}
            {selectedInterview.feedback && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">AI Feedback</h4>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-foreground whitespace-pre-wrap">
                    {selectedInterview.feedback}
                  </p>
                </div>
              </div>
            )}

            {/* Score Breakdown */}
            {selectedInterview.score !== null && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Score Analysis</h4>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Overall Score</span>
                    <Badge variant={getScoreBadgeVariant(selectedInterview.score)} className="text-base px-3 py-1">
                      <Star className="w-4 h-4 mr-1" />
                      {selectedInterview.score}/10
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {selectedInterview.score >= 8 && "Excellent response! Well structured and comprehensive."}
                    {selectedInterview.score >= 6 && selectedInterview.score < 8 && "Good response with room for improvement."}
                    {selectedInterview.score < 6 && "Consider practicing this type of question more."}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}