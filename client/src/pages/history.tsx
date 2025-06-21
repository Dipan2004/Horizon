import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, MessageSquare, History as HistoryIcon, User } from "lucide-react";
import ResumeHistory from "@/components/resume-history";
import InterviewHistory from "@/components/interview-history";
import { useQuery } from "@tanstack/react-query";

interface HistoryStats {
  totalResumes: number;
  totalInterviews: number;
  averageScore: number | null;
  recentActivity: string;
}

export default function HistoryPage() {
  const [userEmail] = useState("demo@example.com"); // In a real app, get from auth

  // Fetch combined stats (you might want to create a dedicated endpoint for this)
  const { data: resumeStats } = useQuery({
    queryKey: [`/api/resumes/${userEmail}`],
    select: (data: any[]) => ({
      count: data.length,
      latest: data[0]?.createdAt
    })
  });

  const { data: interviewStats } = useQuery({
    queryKey: [`/api/interviews/${userEmail}`],
    select: (data: any[]) => ({
      count: data.length,
      averageScore: data.filter(i => i.score !== null).length > 0 
        ? data.filter(i => i.score !== null).reduce((sum, i) => sum + i.score, 0) / data.filter(i => i.score !== null).length
        : null,
      latest: data[0]?.createdAt
    })
  });

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <HistoryIcon className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your History</h1>
            <p className="text-muted-foreground">
              Track your progress and review past activities
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-surface shadow-sm border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{resumeStats?.count || 0}</p>
                  <p className="text-sm text-muted-foreground">Resumes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface shadow-sm border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{interviewStats?.count || 0}</p>
                  <p className="text-sm text-muted-foreground">Interviews</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface shadow-sm border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold text-lg">★</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {interviewStats?.averageScore ? interviewStats.averageScore.toFixed(1) : 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-surface shadow-sm border-border">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Last Activity</p>
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const resumeDate = resumeStats?.latest ? new Date(resumeStats.latest) : null;
                      const interviewDate = interviewStats?.latest ? new Date(interviewStats.latest) : null;
                      
                      if (!resumeDate && !interviewDate) return 'Never';
                      if (!resumeDate) return formatDate(interviewStats?.latest);
                      if (!interviewDate) return formatDate(resumeStats?.latest);
                      
                      return formatDate(resumeDate > interviewDate ? resumeStats?.latest : interviewStats?.latest);
                    })()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="resumes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="resumes" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Resume History</span>
            </TabsTrigger>
            <TabsTrigger value="interviews" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Interview History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumes" className="space-y-6">
            <ResumeHistory userEmail={userEmail} />
          </TabsContent>

          <TabsContent value="interviews" className="space-y-6">
            <InterviewHistory userEmail={userEmail} />
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card className="bg-surface shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                className="h-auto p-4 flex flex-col items-center space-y-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => window.location.href = '/dashboard'}
              >
                <FileText className="w-6 h-6" />
                <span>Upload New Resume</span>
              </Button>
              
              <Button 
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => window.location.href = '/interview'}
              >
                <MessageSquare className="w-6 h-6" />
                <span>Start Mock Interview</span>
              </Button>
              
              <Button 
                variant="outline"
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => window.location.href = '/research'}
              >
                <span className="text-lg">🔍</span>
                <span>Research Company</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}