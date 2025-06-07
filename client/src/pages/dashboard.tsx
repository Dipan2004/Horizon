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
    <div className="min-h-screen bg-white nothing-grid">
      {/* Header */}
      <header className="nothing-border border-b px-8 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-4 h-4 nothing-border flex items-center justify-center nothing-fade-in">
              <div className="w-1 h-1 bg-black rounded-full nothing-pulse"></div>
            </div>
            <h1 className="text-lg font-light tracking-widest">horizon</h1>
            <div className="nothing-dots w-12 h-px"></div>
            <span className="text-xs font-light opacity-50 tracking-wide">career.assistant</span>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 opacity-40">
              <div className="w-1 h-1 bg-black rounded-full"></div>
              <span className="text-xs font-light tracking-wide">secure</span>
            </div>
            <div className="flex items-center space-x-2 opacity-40">
              <div className="w-1 h-1 bg-black rounded-full"></div>
              <span className="text-xs font-light tracking-wide">private</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-16">
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-16 nothing-fade-in">
            {/* Welcome Section */}
            <div className="nothing-card p-12">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-light tracking-wide mb-6">
                  prepare.interview.succeed
                </h2>
                <p className="text-sm font-light opacity-60 mb-8 leading-relaxed">
                  minimal ai-powered career assistance / upload resume / practice interviews / get real-time guidance
                </p>
                <div className="flex space-x-6">
                  <button
                    onClick={() => setActiveTab("resume")}
                    className="nothing-border px-6 py-3 text-xs font-light tracking-wide hover:bg-black hover:text-white transition-all"
                  >
                    upload.resume
                  </button>
                  <button
                    onClick={() => setActiveTab("assistant")}
                    className="px-6 py-3 text-xs font-light tracking-wide opacity-60 hover:opacity-100 transition-all"
                  >
                    try.assistant
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-12">
              <div className="nothing-card p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <FileText className="w-4 h-4 opacity-60" />
                  <h3 className="text-sm font-light tracking-wide">resume.analysis</h3>
                </div>
                <p className="text-xs font-light opacity-50 mb-6 leading-relaxed">
                  ai-powered parsing / skill extraction / experience mapping
                </p>
                <button 
                  onClick={() => setActiveTab("resume")}
                  className="text-xs font-light tracking-wide opacity-60 hover:opacity-100 transition-all"
                >
                  upload →
                </button>
              </div>

              <div className="nothing-card p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Building2 className="w-4 h-4 opacity-60" />
                  <h3 className="text-sm font-light tracking-wide">company.research</h3>
                </div>
                <p className="text-xs font-light opacity-50 mb-6 leading-relaxed">
                  culture insights / mission analysis / role requirements
                </p>
                <button 
                  onClick={() => setActiveTab("research")}
                  className="text-xs font-light tracking-wide opacity-60 hover:opacity-100 transition-all"
                >
                  research →
                </button>
              </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-2 h-2 bg-black rounded-full mx-auto mb-3 nothing-pulse"></div>
                <p className="text-xs font-light opacity-40 tracking-wide">providers.ready</p>
              </div>
              <div className="text-center">
                <div className="w-2 h-2 border border-black rounded-full mx-auto mb-3"></div>
                <p className="text-xs font-light opacity-40 tracking-wide">resume.pending</p>
              </div>
              <div className="text-center">
                <div className="w-2 h-2 border border-black rounded-full mx-auto mb-3"></div>
                <p className="text-xs font-light opacity-40 tracking-wide">practice.available</p>
              </div>
              <div className="text-center">
                <div className="w-2 h-2 border border-black rounded-full mx-auto mb-3"></div>
                <p className="text-xs font-light opacity-40 tracking-wide">assistant.standby</p>
              </div>
            </div>
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
