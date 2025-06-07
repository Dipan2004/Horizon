import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Headphones, 
  Mic, 
  MicOff, 
  Settings, 
  Minimize2,
  CheckCircle,
  Info,
  AlertTriangle,
  Circle
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AssistanceSuggestion {
  keyPoints: string[];
  followUpSuggestions: string[];
  communicationTips: string[];
  relevantAchievements: string[];
}

interface ConversationMessage {
  speaker: 'interviewer' | 'user';
  text: string;
  timestamp: Date;
}

export default function RealTimeAssistant() {
  const [isActive, setIsActive] = useState(false);
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [suggestions, setSuggestions] = useState<AssistanceSuggestion | null>(null);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  // Mock conversation for demo
  useEffect(() => {
    if (isActive) {
      const mockConversation: ConversationMessage[] = [
        {
          speaker: 'interviewer',
          text: "Tell me about your experience with React and how you've used it in production applications.",
          timestamp: new Date(Date.now() - 30000)
        },
        {
          speaker: 'user',
          text: "I've been working with React for about three years now, and I've built several production applications...",
          timestamp: new Date(Date.now() - 10000)
        }
      ];
      setConversation(mockConversation);
    }
  }, [isActive]);

  // Get AI suggestions
  const getSuggestionsMutation = useMutation({
    mutationFn: async (conversationContext: string) => {
      const response = await apiRequest('POST', '/api/assistant/suggest', {
        context: "React development interview",
        conversation: conversationContext,
        userProfile: {
          skills: ["React", "JavaScript", "Node.js", "TypeScript"],
          experience: "3 years",
          achievements: ["Built e-commerce platform", "Improved performance by 40%"]
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSuggestions(data);
    },
    onError: (error) => {
      toast({
        title: "Failed to get suggestions",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleToggleSession = () => {
    setIsActive(!isActive);
    if (!isActive) {
      // Start session
      const conversationText = conversation.map(msg => `${msg.speaker}: ${msg.text}`).join('\n');
      getSuggestionsMutation.mutate(conversationText);
      toast({
        title: "Real-time assistance started",
        description: "AI is now listening and ready to provide suggestions."
      });
    } else {
      // End session
      setSuggestions(null);
      setConversation([]);
      toast({
        title: "Session ended",
        description: "Real-time assistance has been stopped."
      });
    }
  };

  const handleToggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast({
        title: "Started listening",
        description: "Microphone is now active for conversation capture."
      });
    } else {
      toast({
        title: "Stopped listening",
        description: "Microphone has been turned off."
      });
    }
  };

  return (
    <Card className="bg-surface shadow-sm border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Headphones className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-xl text-foreground">Real-Time Interview Assistant</CardTitle>
              <p className="text-sm text-muted-foreground">Live assistance during actual interviews</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Circle 
                className={`w-3 h-3 ${isActive ? 'text-green-500 fill-current' : 'text-muted-foreground'}`} 
              />
              <span className="text-sm text-muted-foreground">
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <Button 
              onClick={handleToggleSession}
              className={isActive 
                ? "bg-gray-600 text-gray-100 hover:bg-gray-700" 
                : "bg-red-600 text-white hover:bg-red-700"
              }
            >
              {isActive ? 'End Session' : 'Start Session'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Live Conversation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">Live Conversation</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleListening}
                disabled={!isActive}
                className="flex items-center space-x-1"
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
                <span>{isListening ? 'Stop' : 'Listen'}</span>
              </Button>
            </div>
            <div className="bg-muted rounded-lg p-4 h-48 overflow-y-auto">
              {isActive && conversation.length > 0 ? (
                <div className="space-y-3 text-sm">
                  {conversation.map((message, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className={`font-medium ${
                        message.speaker === 'interviewer' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {message.speaker === 'interviewer' ? 'Interviewer:' : 'You:'}
                      </span>
                      <span className="text-muted-foreground">{message.text}</span>
                    </div>
                  ))}
                  {isListening && (
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Circle className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs">Listening...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  {isActive ? 'Waiting for conversation to begin...' : 'Start a session to begin live assistance'}
                </div>
              )}
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">AI Suggestions</h4>
            <div className="space-y-3">
              {suggestions?.keyPoints && suggestions.keyPoints.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-1">Key Points to Mention</p>
                      <ul className="text-xs text-blue-800 space-y-1">
                        {suggestions.keyPoints.map((point, index) => (
                          <li key={index}>• {point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {suggestions?.followUpSuggestions && suggestions.followUpSuggestions.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900 mb-1">Follow-up Suggestions</p>
                      <ul className="text-xs text-green-800 space-y-1">
                        {suggestions.followUpSuggestions.map((suggestion, index) => (
                          <li key={index}>• {suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {suggestions?.communicationTips && suggestions.communicationTips.length > 0 && (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900 mb-1">Communication Tips</p>
                      <ul className="text-xs text-yellow-800 space-y-1">
                        {suggestions.communicationTips.map((tip, index) => (
                          <li key={index}>• {tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {!suggestions && !getSuggestionsMutation.isPending && isActive && (
                <div className="text-center text-muted-foreground text-sm py-4">
                  Start speaking to get AI-powered suggestions and assistance.
                </div>
              )}

              {getSuggestionsMutation.isPending && (
                <div className="text-center text-muted-foreground text-sm py-4">
                  Generating AI suggestions...
                </div>
              )}

              {!isActive && (
                <div className="text-center text-muted-foreground text-sm py-4">
                  Start a session to receive real-time interview assistance.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center pt-6 border-t border-border">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <Minimize2 className="w-4 h-4" />
              <span>Minimize Panel</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Button>
          </div>
          {isActive && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Session Active
              </Badge>
              <span className="text-xs text-muted-foreground">
                {isListening ? 'Microphone On' : 'Microphone Off'}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
