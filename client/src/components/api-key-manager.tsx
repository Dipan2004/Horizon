import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Key, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Provider {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const AI_PROVIDERS: Provider[] = [
  { id: 'openai', name: 'OpenAI', icon: '🤖', color: 'bg-green-100 text-green-800' },
  { id: 'anthropic', name: 'Claude', icon: '🧠', color: 'bg-purple-100 text-purple-800' },
  { id: 'gemini', name: 'Gemini', icon: '✨', color: 'bg-blue-100 text-blue-800' },
  { id: 'huggingface', name: 'Hugging Face', icon: '🤗', color: 'bg-orange-100 text-orange-800' }
];

export default function APIKeyManager() {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get available providers
  const { data: providersData } = useQuery({
    queryKey: ['/api/user/available-providers'],
    enabled: true
  });

  // Add API key mutation
  const addKeyMutation = useMutation({
    mutationFn: async ({ provider, key }: { provider: string; key: string }) => {
      const response = await apiRequest('POST', '/api/user/api-keys', {
        userId: 1,
        provider,
        apiKey: key
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/available-providers'] });
      setApiKey('');
      setSelectedProvider('');
      toast({
        title: "API key added",
        description: "Your AI provider is now available for use."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add API key",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Remove API key mutation
  const removeKeyMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await apiRequest('DELETE', `/api/user/api-keys/${provider}`, {
        userId: 1
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user/available-providers'] });
      toast({
        title: "API key removed",
        description: "Provider has been disconnected."
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to remove API key",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleAddKey = () => {
    if (!selectedProvider || !apiKey.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a provider and enter an API key.",
        variant: "destructive"
      });
      return;
    }

    addKeyMutation.mutate({ provider: selectedProvider, key: apiKey.trim() });
  };

  const availableProviders = (providersData as any)?.providers || [];

  return (
    <div className="border border-white/10 bg-black/40 backdrop-blur-sm">
      <div className="p-8">
        <div className="flex items-center space-x-3 mb-8">
          <Key className="w-4 h-4 text-white/60" />
          <h3 className="text-sm font-light tracking-wide text-white">ai.providers</h3>
        </div>

        {/* Connected Providers */}
        {availableProviders.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-light text-white/50 mb-4 tracking-wide">connected</p>
            <div className="grid grid-cols-2 gap-3">
              {availableProviders.map((providerId: string) => {
                const provider = AI_PROVIDERS.find(p => p.id === providerId);
                if (!provider) return null;
                
                return (
                  <div key={providerId} className="flex items-center justify-between p-4 border border-white/10 bg-black/20">
                    <div className="flex items-center space-x-3">
                      <span className="text-sm">{provider.icon}</span>
                      <span className="text-xs font-light text-white tracking-wide">{provider.name.toLowerCase()}</span>
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                    <button
                      onClick={() => removeKeyMutation.mutate(providerId)}
                      disabled={removeKeyMutation.isPending}
                      className="text-white/40 hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add New Provider */}
        <div className="space-y-6">
          <p className="text-xs font-light text-white/50 tracking-wide">add.provider</p>
          
          {/* Provider Selection */}
          <div className="grid grid-cols-2 gap-3">
            {AI_PROVIDERS.filter(p => !availableProviders.includes(p.id)).map((provider) => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={`flex items-center space-x-3 p-4 border transition-all ${
                  selectedProvider === provider.id
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <span className="text-sm">{provider.icon}</span>
                <span className="text-xs font-light text-white tracking-wide">{provider.name.toLowerCase()}</span>
              </button>
            ))}
          </div>

          {/* API Key Input */}
          {selectedProvider && (
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder="enter.api.key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-black/40 border-white/10 text-white placeholder:text-white/30 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-white/40 hover:text-white/60"
                >
                  {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
              
              <button
                onClick={handleAddKey}
                disabled={addKeyMutation.isPending || !apiKey.trim()}
                className="w-full bg-red-500 text-black px-4 py-3 text-xs font-medium tracking-wide hover:bg-red-400 transition-all disabled:opacity-50"
              >
                <Plus className="w-3 h-3 mr-2 inline" />
                {addKeyMutation.isPending ? 'adding...' : 'add.provider'}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-8 p-4 border border-white/10 bg-black/20">
          <p className="text-xs font-light text-white/40 leading-relaxed">
            keys.stored.securely / free.tier.huggingface / premium.openai.claude.gemini
          </p>
        </div>
      </div>
    </div>
  );
}
















































