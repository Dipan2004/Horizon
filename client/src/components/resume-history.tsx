import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, FileText, Calendar, Eye, Trash2, Download } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Resume {
  id: number;
  userEmail: string;
  rawText: string;
  skills: string[];
  experience: string;
  achievements: string[];
  createdAt: string;
}

interface ResumeHistoryProps {
  userEmail?: string;
}

export default function ResumeHistory({ userEmail = "demo@example.com" }: ResumeHistoryProps) {
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's resumes
  const { data: resumes = [], isLoading, error } = useQuery<Resume[]>({
    queryKey: [`/api/resumes/${userEmail}`],
    enabled: !!userEmail
  });

  // Delete resume mutation (you'll need to implement this endpoint)
  const deleteMutation = useMutation({
    mutationFn: async (resumeId: number) => {
      const response = await apiRequest('DELETE', `/api/resume/${resumeId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/resumes/${userEmail}`] });
      toast({
        title: "Resume deleted",
        description: "Resume has been removed from your history."
      });
      setSelectedResume(null);
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete resume",
        variant: "destructive"
      });
    }
  });

  const handleViewResume = (resume: Resume) => {
    setSelectedResume(resume);
  };

  const handleDeleteResume = (resumeId: number) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      deleteMutation.mutate(resumeId);
    }
  };

  const handleDownloadResume = (resume: Resume) => {
    // Create a downloadable text file
    const blob = new Blob([resume.rawText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resume_${resume.id}_${new Date(resume.createdAt).toLocaleDateString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  if (isLoading) {
    return (
      <Card className="bg-surface shadow-sm border-border">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading resume history...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-surface shadow-sm border-border">
        <CardContent className="p-8 text-center">
          <p className="text-destructive">Failed to load resumes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resume List */}
      <Card className="bg-surface shadow-sm border-border">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <History className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-xl text-foreground">Resume History</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent>
          {resumes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No resumes uploaded yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Upload your first resume to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">
                          Resume #{resume.id}
                        </h3>
                        <div className="flex items-center space-x-1 text-muted-foreground text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(resume.createdAt)}</span>
                        </div>
                      </div>
                      
                      {/* Skills Preview */}
                      {resume.skills && resume.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {resume.skills.slice(0, 5).map((skill, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs"
                            >
                              {skill}
                            </Badge>
                          ))}
                          {resume.skills.length > 5 && (
                            <Badge variant="outline" className="text-xs">
                              +{resume.skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* Experience Preview */}
                      {resume.experience && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {resume.experience.substring(0, 100)}...
                        </p>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewResume(resume)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadResume(resume)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteResume(resume.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resume Detail Modal */}
      {selectedResume && (
        <Card className="bg-surface shadow-sm border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl text-foreground">
                    Resume #{selectedResume.id}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Uploaded {formatDate(selectedResume.createdAt)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedResume(null)}
              >
                Close
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Skills */}
            {selectedResume.skills && selectedResume.skills.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Skills ({selectedResume.skills.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedResume.skills.map((skill, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="bg-blue-100 text-primary"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {selectedResume.experience && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Experience Summary</h4>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                    {selectedResume.experience}
                  </p>
                </div>
              </div>
            )}

            {/* Achievements */}
            {selectedResume.achievements && selectedResume.achievements.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Key Achievements</h4>
                <div className="p-4 bg-muted rounded-lg">
                  <ul className="space-y-2">
                    {selectedResume.achievements.map((achievement, index) => (
                      <li key={index} className="text-muted-foreground text-sm flex items-start space-x-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Raw Text */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Original Text</h4>
              <div className="p-4 bg-muted rounded-lg max-h-64 overflow-y-auto">
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">
                  {selectedResume.rawText}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}