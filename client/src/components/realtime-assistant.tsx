import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX, Zap, Settings } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((this: SpeechRecognition, ev: any) => any) | null;
  onerror: ((this: SpeechRecognition, ev: any) => any) | null;
  onend: ((this: SpeechRecognition, ev: any) => any) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface QuickResponse {
  type: 'strength' | 'example' | 'question' | 'clarification';
  text: string;
  confidence: number;
}

export default function RealtimeAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [quickResponses, setQuickResponses] = useState<QuickResponse[]>([]);
  const [responseTime, setResponseTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Get AI suggestions
  const suggestionsMutation = useMutation({
    mutationFn: async (question: string) => {
      const startTime = Date.now();
      const response = await apiRequest('POST', '/api/assistant/suggest', {
        context: "Real-time interview assistance",
        conversation: `Interviewer: ${question}`,
        userProfile: {
          skills: ["JavaScript", "React", "Node.js", "Problem Solving"],
          experience: "3+ years in software development",
          achievements: ["Led team projects", "Improved system performance", "Mentored junior developers"]
        }
      });
      const result = await response.json();
      setResponseTime(Date.now() - startTime);
      return result;
    },
    onSuccess: (data) => {
      const responses: QuickResponse[] = [
        ...data.keyPoints?.map((point: string) => ({
          type: 'strength' as const,
          text: point,
          confidence: 0.9
        })) || [],
        ...data.followUpSuggestions?.map((suggestion: string) => ({
          type: 'question' as const,
          text: suggestion,
          confidence: 0.8
        })) || [],
        ...data.communicationTips?.map((tip: string) => ({
          type: 'clarification' as const,
          text: tip,
          confidence: 0.7
        })) || []
      ];
      setQuickResponses(responses.slice(0, 4));
    },
    onError: () => {
      toast({
        title: "Assistant unavailable",
        description: "Unable to get AI suggestions at the moment.",
        variant: "destructive"
      });
    }
  });

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech recognition unavailable",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive"
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = Array.from(event.results);
      const transcript = results
        .map(result => result[0].transcript)
        .join('');

      if (event.results[event.resultIndex].isFinal) {
        const question = transcript.trim();
        if (question.length > 10 && question.includes('?')) {
          setCurrentQuestion(question);
          suggestionsMutation.mutate(question);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (isActive && isListening) {
        setTimeout(() => recognition.start(), 100);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [isActive, isListening]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      clearTimeout(timeoutRef.current);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      
      // Auto-stop after 30 seconds of continuous listening
      timeoutRef.current = setTimeout(() => {
        setIsListening(false);
      }, 30000);
    }
  };

  const toggleSession = () => {
    if (isActive) {
      setIsActive(false);
      setIsListening(false);
      setCurrentQuestion('');
      setQuickResponses([]);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } else {
      setIsActive(true);
    }
  };

  const getResponseTypeColor = (type: string) => {
    switch (type) {
      case 'strength': return 'bg-green-50 text-green-700 border-green-200';
      case 'example': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'question': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'clarification': return 'bg-orange-50 text-orange-700 border-orange-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getResponseTypeIcon = (type: string) => {
    switch (type) {
      case 'strength': return '💪';
      case 'example': return '📝';
      case 'question': return '❓';
      case 'clarification': return '💡';
      default: return '💬';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <h1 className="text-xl font-light">Interview Assistant</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
            {isActive ? 'Active' : 'Standby'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="text-white hover:bg-gray-800"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Controls */}
      <div className="max-w-md mx-auto space-y-6">
        {/* Power Button */}
        <div className="flex justify-center">
          <button
            onClick={toggleSession}
            className={`w-20 h-20 rounded-full border-2 transition-all duration-300 ${
              isActive 
                ? 'bg-white text-black border-white shadow-lg shadow-white/20' 
                : 'bg-black text-white border-gray-600 hover:border-gray-400'
            }`}
          >
            <Zap className="w-8 h-8 mx-auto" />
          </button>
        </div>

        {/* Status */}
        {isActive && (
          <div className="text-center space-y-4">
            {/* Listening Controls */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={toggleListening}
                disabled={!isActive}
                className={`w-12 h-12 rounded-full border transition-all ${
                  isListening
                    ? 'bg-red-600 border-red-600 animate-pulse'
                    : 'bg-gray-800 border-gray-600 hover:border-gray-400'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5 mx-auto" /> : <Mic className="w-5 h-5 mx-auto" />}
              </button>
              
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full border transition-all ${
                  isMuted
                    ? 'bg-gray-600 border-gray-600'
                    : 'bg-gray-800 border-gray-600 hover:border-gray-400'
                }`}
              >
                {isMuted ? <VolumeX className="w-5 h-5 mx-auto" /> : <Volume2 className="w-5 h-5 mx-auto" />}
              </button>
            </div>

            {/* Current Question */}
            {currentQuestion && (
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 mb-1">Detected Question</p>
                <p className="text-white text-sm">{currentQuestion}</p>
                {responseTime > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Response in {responseTime}ms</p>
                )}
              </div>
            )}

            {/* Quick Responses */}
            {quickResponses.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Suggested Responses</p>
                {quickResponses.map((response, index) => (
                  <div
                    key={index}
                    className="bg-gray-900 rounded-lg p-3 border border-gray-700 text-left hover:border-gray-500 transition-colors cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(response.text);
                      toast({ title: "Copied to clipboard" });
                    }}
                  >
                    <div className="flex items-start space-x-2">
                      <span className="text-sm">{getResponseTypeIcon(response.type)}</span>
                      <div className="flex-1">
                        <p className="text-white text-sm">{response.text}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                            {response.type}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-1 h-1 rounded-full ${
                                  i < response.confidence * 5 ? 'bg-green-500' : 'bg-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Loading State */}
            {suggestionsMutation.isPending && (
              <div className="flex items-center justify-center space-x-2 py-4">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-200"></div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!isActive && (
          <div className="text-center text-gray-400 text-sm space-y-2">
            <p>Tap the power button to start</p>
            <p>Assistant will listen for interview questions and provide instant suggestions</p>
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="bg-gray-900 border-gray-700 w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Auto-listen timeout</span>
                  <span className="text-white">30s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Response speed</span>
                  <span className="text-white">Fast (≤5s)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Language</span>
                  <span className="text-white">English (US)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Confidence threshold</span>
                  <span className="text-white">Medium</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}