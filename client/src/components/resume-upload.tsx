import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Upload, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Interface matching your Neon DB schema
interface Resume {
  id: number;
  userEmail: string;
  rawText: string;
  skills: string[];
  experience: string;
  achievements: string[];
  createdAt: string;
}

interface ResumeUploadProps {
  userEmail?: string; // Make it configurable
}

export default function ResumeUpload({ userEmail = "demo@example.com" }: ResumeUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [processingFile, setProcessingFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get existing resumes for this user
  const { data: resumes = [], isLoading } = useQuery<Resume[]>({
    queryKey: [`/api/resumes/${userEmail}`],
    enabled: !!userEmail
  });

  // Get the most recent resume
  const latestResume = resumes?.[0];

  // Save resume mutation (using new Neon DB endpoint)
  const saveResumeMutation = useMutation({
    mutationFn: async ({ rawText, skills, experience, achievements }: {
      rawText: string;
      skills: string[];
      experience: string;
      achievements: string[];
    }) => {
      const response = await apiRequest('POST', '/api/save-resume', {
        userEmail,
        rawText,
        skills,
        experience,
        achievements
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/resumes/${userEmail}`] });
      toast({
        title: "Resume saved successfully",
        description: "Your resume has been analyzed and saved to your profile."
      });
      setProcessingFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save resume",
        variant: "destructive"
      });
      setProcessingFile(null);
    }
  });

  // File upload and AI analysis
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('document') && !file.name.endsWith('.txt')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, DOCX, or TXT file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setProcessingFile(file.name);
    setUploading(true);

    try {
      // For demo purposes, we'll simulate file reading and AI analysis
      // In a real app, you'd want to send this to your AI service
      const fileText = await readFileAsText(file);
      
      // Simulate AI analysis (replace with actual AI service call)
      const mockAnalysis = {
        skills: extractSkillsFromText(fileText),
        experience: extractExperienceFromText(fileText),
        achievements: extractAchievementsFromText(fileText)
      };

      // Save to database
      await saveResumeMutation.mutateAsync({
        rawText: fileText,
        skills: mockAnalysis.skills,
        experience: mockAnalysis.experience,
        achievements: mockAnalysis.achievements
      });

    } catch (error) {
      toast({
        title: "Processing failed",
        description: "Failed to process the resume file.",
        variant: "destructive"
      });
      setProcessingFile(null);
    } finally {
      setUploading(false);
    }
  };

  // Helper function to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Mock AI analysis functions (replace with actual AI service calls)
  const extractSkillsFromText = (text: string): string[] => {
    const commonSkills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'SQL',
      'Git', 'Docker', 'AWS', 'MongoDB', 'PostgreSQL', 'Express', 'Vue.js',
      'Angular', 'HTML', 'CSS', 'REST API', 'GraphQL', 'Kubernetes'
    ];
    
    return commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    ).slice(0, 10);
  };

  const extractExperienceFromText = (text: string): string => {
    // Simple experience extraction logic
    const lines = text.split('\n');
    const experienceKeywords = ['experience', 'worked', 'developed', 'managed', 'led'];
    
    const experienceLines = lines.filter(line =>
      experienceKeywords.some(keyword =>
        line.toLowerCase().includes(keyword)
      )
    );
    
    return experienceLines.slice(0, 3).join(' ').substring(0, 200) + '...';
  };

  const extractAchievementsFromText = (text: string): string[] => {
    // Simple achievements extraction
    const lines = text.split('\n');
    const achievementKeywords = ['achieved', 'increased', 'reduced', 'improved', 'built', 'created'];
    
    return lines
      .filter(line =>
        achievementKeywords.some(keyword =>
          line.toLowerCase().includes(keyword)
        )
      )
      .slice(0, 5)
      .map(line => line.trim())
      .filter(line => line.length > 10);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <Card className="bg-surface shadow-sm border-border">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading resume data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface shadow-sm border-border">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl text-foreground">Resume Analysis</CardTitle>
            {resumes.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {resumes.length} resume{resumes.length > 1 ? 's' : ''} uploaded
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div 
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={handleUploadClick}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground mb-2">
            {latestResume ? 'Upload New Resume' : 'Upload your resume'}
          </p>
          <p className="text-muted-foreground">Drag and drop your PDF, DOCX, or TXT file here</p>
          <Button 
            className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={uploading}
          >
            {uploading ? 'Processing...' : 'Choose File'}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.txt"
            className="hidden"
          />
        </div>

        {/* Processing Status */}
        {uploading && processingFile && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium text-foreground">Processing {processingFile}</span>
              <span className="text-sm text-accent font-medium">Analyzing...</span>
            </div>
            <Progress value={75} className="w-full" />
          </div>
        )}

        {/* Latest Resume Display */}
        {latestResume && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <div>
                  <span className="font-medium text-foreground">Latest Resume</span>
                  <p className="text-xs text-muted-foreground">
                    Uploaded {new Date(latestResume.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Skills */}
            {latestResume.skills && latestResume.skills.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium text-foreground">Skills Extracted</span>
                  <span className="text-sm text-accent font-medium">{latestResume.skills.length} found</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {latestResume.skills.map((skill, index) => (
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
            {latestResume.experience && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Experience Summary</h4>
                <p className="text-muted-foreground text-sm">{latestResume.experience}</p>
              </div>
            )}

            {/* Achievements */}
            {latestResume.achievements && latestResume.achievements.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Key Achievements</h4>
                <ul className="space-y-1">
                  {latestResume.achievements.map((achievement, index) => (
                    <li key={index} className="text-muted-foreground text-sm flex items-start space-x-2">
                      <span className="text-accent">•</span>
                      <span>{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!latestResume && !uploading && (
          <div className="text-center text-muted-foreground text-sm">
            <AlertCircle className="w-5 h-5 mx-auto mb-2" />
            Upload your resume to get started with personalized interview preparation
          </div>
        )}
      </CardContent>
    </Card>
  );
}