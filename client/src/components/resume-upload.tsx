import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Resume {
  id: number;
  filename: string;
  skills: string[];
  experience: string;
  achievements: string[];
}

export default function ResumeUpload() {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get existing resume
  const { data: resume, isLoading } = useQuery<Resume>({
    queryKey: ['/api/resume/user/1'],
    enabled: true
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('resume', file);
      
      const response = await apiRequest('POST', '/api/resume/upload', formData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/resume/user/1'] });
      toast({
        title: "Resume uploaded successfully",
        description: "Your resume has been analyzed and skills extracted."
      });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('document')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="bg-surface shadow-sm border-border">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-xl text-foreground">Resume Analysis</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!resume && (
          <div 
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={handleUploadClick}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">Upload your resume</p>
            <p className="text-muted-foreground">Drag and drop your PDF or DOCX file here</p>
            <Button 
              className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? 'Processing...' : 'Choose File'}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />
          </div>
        )}

        {uploadMutation.isPending && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium text-foreground">Processing Resume</span>
              <span className="text-sm text-accent font-medium">Analyzing...</span>
            </div>
            <Progress value={75} className="w-full" />
          </div>
        )}

        {resume && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-accent" />
                <span className="font-medium text-foreground">{resume.filename}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleUploadClick}
              >
                Replace
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />
            </div>

            {resume.skills && resume.skills.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="font-medium text-foreground">Skills Extracted</span>
                  <span className="text-sm text-accent font-medium">{resume.skills.length} found</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map((skill, index) => (
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

            {resume.experience && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Experience Summary</h4>
                <p className="text-muted-foreground text-sm">{resume.experience}</p>
              </div>
            )}

            {resume.achievements && resume.achievements.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Key Achievements</h4>
                <ul className="space-y-1">
                  {resume.achievements.map((achievement, index) => (
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

        {!resume && !uploadMutation.isPending && (
          <div className="text-center text-muted-foreground text-sm">
            <AlertCircle className="w-5 h-5 mx-auto mb-2" />
            Upload your resume to get started with personalized interview preparation
          </div>
        )}
      </CardContent>
    </Card>
  );
}
