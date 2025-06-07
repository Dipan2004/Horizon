import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Building2, 
  MessageSquare, 
  Headphones, 
  Crown,
  CheckCircle,
  AlertCircle,
  Zap,
  Shield,
  Unlock,
  Key
} from "lucide-react";
import ResumeUpload from "@/components/resume-upload";
import CompanyResearch from "@/components/company-research";
import MockInterview from "@/components/mock-interview";
import RealTimeAssistant from "@/components/real-time-assistant";
import APIKeyManager from "@/components/api-key-manager";
import RealtimeAssistant from "@/components/realtime-assistant";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Horizon</h1>
                <p className="text-xs text-muted-foreground">Your AI-Powered Career Assistant</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" onClick={() => setActiveTab("overview")}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => setActiveTab("practice")}>
                Practice
              </Button>
              <Button variant="ghost" onClick={() => setActiveTab("insights")}>
                Insights
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Crown className="w-4 h-4 mr-2" />
                Premium
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Welcome Section */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              <CardContent className="relative p-8">
                <div className="max-w-3xl">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Ace your next interview with AI assistance
                  </h2>
                  <p className="text-lg text-muted-foreground mb-6">
                    Upload your resume, get personalized insights, and practice with our AI-powered mock interviews.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      size="lg" 
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => setActiveTab("resume")}
                    >
                      Get Started
                    </Button>
                    <Button variant="outline" size="lg">
                      Watch Demo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
              <ResumeUpload />
              <CompanyResearch />
            </div>

            {/* Premium Features */}
            <Card className="bg-gradient-to-br from-primary/5 via-purple-50 to-accent/5 border-primary/20">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-4">Unlock Premium Features</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Get advanced AI assistance, detailed feedback, and unlimited practice sessions with Horizon Premium.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">Advanced AI Feedback</h4>
                    <p className="text-muted-foreground text-sm">
                      Get detailed analysis of your communication style, body language, and interview performance.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Unlock className="w-6 h-6 text-accent" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">Unlimited Practice</h4>
                    <p className="text-muted-foreground text-sm">
                      Practice with unlimited mock interviews tailored to your target companies and roles.
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-foreground mb-2">Privacy Focused</h4>
                    <p className="text-muted-foreground text-sm">
                      Local AI processing option ensures your interview data stays private and secure on your device.
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Upgrade to Premium - $9.99/month
                  </Button>
                  <p className="text-muted-foreground text-sm mt-2">7-day free trial • Cancel anytime</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resume Tab */}
          <TabsContent value="resume">
            <ResumeUpload />
          </TabsContent>

          {/* Company Research Tab */}
          <TabsContent value="research">
            <CompanyResearch />
          </TabsContent>

          {/* Mock Interview Tab */}
          <TabsContent value="practice">
            <MockInterview />
          </TabsContent>

          {/* Real-time Assistant Tab */}
          <TabsContent value="assistant">
            <RealtimeAssistant />
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="settings">
            <APIKeyManager />
          </TabsContent>

          <TabsList className="grid grid-cols-6 w-full max-w-3xl mx-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="resume" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Resume</span>
            </TabsTrigger>
            <TabsTrigger value="research" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Research</span>
            </TabsTrigger>
            <TabsTrigger value="practice" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Practice</span>
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <Headphones className="w-4 h-4" />
              <span className="hidden sm:inline">Live Assistant</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              <span className="hidden sm:inline">AI Keys</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">Horizon</span>
              </div>
              <p className="text-muted-foreground">Your AI-powered career assistant for interview success.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Resume Analysis</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Mock Interviews</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Company Research</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Real-time Assistance</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <Separator className="my-8" />
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Horizon. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
