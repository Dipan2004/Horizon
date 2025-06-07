import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Building2, Search, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CompanyInsights {
  id: number;
  companyName: string;
  position: string;
  culture: string;
  mission: string;
  recentNews: string;
  requiredSkills: string[];
}

export default function CompanyResearch() {
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [insights, setInsights] = useState<CompanyInsights | null>(null);
  const { toast } = useToast();

  const researchMutation = useMutation({
    mutationFn: async ({ companyName, position }: { companyName: string; position: string }) => {
      const response = await apiRequest('POST', '/api/company/research', {
        companyName,
        position
      });
      return response.json();
    },
    onSuccess: (data) => {
      setInsights(data);
      toast({
        title: "Research completed",
        description: "Company insights have been generated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Research failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleResearch = () => {
    if (!companyName.trim() || !position.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both company name and position.",
        variant: "destructive"
      });
      return;
    }

    researchMutation.mutate({ companyName: companyName.trim(), position: position.trim() });
  };

  return (
    <Card className="bg-surface shadow-sm border-border">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-accent" />
          </div>
          <CardTitle className="text-xl text-foreground">Company Research</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex space-x-3">
            <Input
              placeholder="Company name (e.g., Google, Microsoft)"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="flex-1"
            />
            <Input
              placeholder="Job position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="flex-1"
            />
          </div>
          <Button 
            onClick={handleResearch}
            disabled={researchMutation.isPending}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {researchMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Researching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Research Company
              </>
            )}
          </Button>
        </div>

        {insights && (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Company Culture</h4>
              <p className="text-muted-foreground text-sm">
                {insights.culture || "No culture information available"}
              </p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Mission & Values</h4>
              <p className="text-muted-foreground text-sm">
                {insights.mission || "No mission information available"}
              </p>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold text-foreground mb-2">Recent News</h4>
              <p className="text-muted-foreground text-sm">
                {insights.recentNews || "No recent news available"}
              </p>
            </div>
            
            {insights.requiredSkills && insights.requiredSkills.length > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Key Skills Required</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {insights.requiredSkills.map((skill, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="bg-accent/10 text-accent"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!insights && !researchMutation.isPending && (
          <div className="text-center text-muted-foreground text-sm py-8">
            Enter a company name and position to get detailed insights about the role and organization.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
