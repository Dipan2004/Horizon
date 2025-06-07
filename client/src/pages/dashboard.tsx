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
    <div className="min-h-screen bg-black nothing-grid text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-8 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-4 h-4 border border-white/20 flex items-center justify-center nothing-fade-in">
              <div className="w-1 h-1 bg-red-500 rounded-full nothing-pulse"></div>
            </div>
            <h1 className="text-lg font-light tracking-widest text-white">horizon</h1>
            <div className="nothing-dots w-12 h-px"></div>
            <span className="text-xs font-light opacity-50 tracking-wide text-white/70">career.assistant</span>
          </div>
          
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 opacity-40">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <span className="text-xs font-light tracking-wide text-white/60">secure</span>
            </div>
            <div className="flex items-center space-x-2 opacity-40">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <span className="text-xs font-light tracking-wide text-white/60">private</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-16">
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-16 nothing-fade-in">
            {/* Welcome Section */}
            <div className="border border-white/10 p-12 bg-black/40 backdrop-blur-sm">
              <div className="max-w-3xl">
                <h2 className="text-2xl font-light tracking-wide mb-6 text-white">
                  prepare.interview.succeed
                </h2>
                <p className="text-sm font-light text-white/60 mb-8 leading-relaxed">
                  minimal ai-powered career assistance / upload resume / practice interviews / get real-time guidance
                </p>
                <div className="flex space-x-6">
                  <button
                    onClick={() => setActiveTab("resume")}
                    className="bg-red-500 text-black px-6 py-3 text-xs font-medium tracking-wide hover:bg-red-400 transition-all"
                  >
                    upload.resume
                  </button>
                  <button
                    onClick={() => setActiveTab("assistant")}
                    className="border border-white/20 px-6 py-3 text-xs font-light tracking-wide text-white/60 hover:text-white transition-all"
                  >
                    try.assistant
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-12">
              <div className="border border-white/10 p-8 bg-black/20">
                <div className="flex items-center space-x-3 mb-6">
                  <FileText className="w-4 h-4 text-white/60" />
                  <h3 className="text-sm font-light tracking-wide text-white">resume.analysis</h3>
                </div>
                <p className="text-xs font-light text-white/50 mb-6 leading-relaxed">
                  ai-powered parsing / skill extraction / experience mapping
                </p>
                <button 
                  onClick={() => setActiveTab("resume")}
                  className="text-xs font-light tracking-wide text-white/60 hover:text-white transition-all"
                >
                  upload →
                </button>
              </div>

              <div className="border border-white/10 p-8 bg-black/20">
                <div className="flex items-center space-x-3 mb-6">
                  <Building2 className="w-4 h-4 text-white/60" />
                  <h3 className="text-sm font-light tracking-wide text-white">company.research</h3>
                </div>
                <p className="text-xs font-light text-white/50 mb-6 leading-relaxed">
                  culture insights / mission analysis / role requirements
                </p>
                <button 
                  onClick={() => setActiveTab("research")}
                  className="text-xs font-light tracking-wide text-white/60 hover:text-white transition-all"
                >
                  research →
                </button>
              </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mb-3 nothing-pulse"></div>
                <p className="text-xs font-light text-white/40 tracking-wide">providers.ready</p>
              </div>
              <div className="text-center">
                <div className="w-2 h-2 border border-white/30 rounded-full mx-auto mb-3"></div>
                <p className="text-xs font-light text-white/40 tracking-wide">resume.pending</p>
              </div>
              <div className="text-center">
                <div className="w-2 h-2 border border-white/30 rounded-full mx-auto mb-3"></div>
                <p className="text-xs font-light text-white/40 tracking-wide">practice.available</p>
              </div>
              <div className="text-center">
                <div className="w-2 h-2 border border-white/30 rounded-full mx-auto mb-3"></div>
                <p className="text-xs font-light text-white/40 tracking-wide">assistant.standby</p>
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

          <div className="flex justify-center mt-16">
            <div className="flex space-x-12 text-xs font-light tracking-wide">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-2 ${activeTab === "overview" ? "text-white border-b border-red-500" : "text-white/40 hover:text-white/80"} transition-all`}
              >
                overview
              </button>
              <button
                onClick={() => setActiveTab("resume")}
                className={`py-2 ${activeTab === "resume" ? "text-white border-b border-red-500" : "text-white/40 hover:text-white/80"} transition-all`}
              >
                resume
              </button>
              <button
                onClick={() => setActiveTab("research")}
                className={`py-2 ${activeTab === "research" ? "text-white border-b border-red-500" : "text-white/40 hover:text-white/80"} transition-all`}
              >
                research
              </button>
              <button
                onClick={() => setActiveTab("practice")}
                className={`py-2 ${activeTab === "practice" ? "text-white border-b border-red-500" : "text-white/40 hover:text-white/80"} transition-all`}
              >
                practice
              </button>
              <button
                onClick={() => setActiveTab("assistant")}
                className={`py-2 ${activeTab === "assistant" ? "text-white border-b border-red-500" : "text-white/40 hover:text-white/80"} transition-all`}
              >
                assistant
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`py-2 ${activeTab === "settings" ? "text-white border-b border-red-500" : "text-white/40 hover:text-white/80"} transition-all`}
              >
                providers
              </button>
            </div>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-24 py-8">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
            <span className="text-xs font-light tracking-wide text-white/40">horizon.career.assistant</span>
            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
          </div>
          <p className="text-xs font-light text-white/30 tracking-wide">minimal.private.effective</p>
        </div>
      </footer>
    </div>
  );
}
