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
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Key className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">AI Providers</h3>
        </div>

        {/* Connected Providers */}
        {availableProviders.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">Connected</p>
            <div className="grid grid-cols-2 gap-2">
              {availableProviders.map((providerId: string) => {
                const provider = AI_PROVIDERS.find(p => p.id === providerId);
                if (!provider) return null;
                
                return (
                  <div key={providerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{provider.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{provider.name}</span>
                      <Badge className={provider.color}>Active</Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeKeyMutation.mutate(providerId)}
                      disabled={removeKeyMutation.isPending}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add New Provider */}
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Add New Provider</p>
          
          {/* Provider Selection */}
          <div className="grid grid-cols-2 gap-2">
            {AI_PROVIDERS.filter(p => !availableProviders.includes(p.id)).map((provider) => (
              <button
                key={provider.id}
                onClick={() => setSelectedProvider(provider.id)}
                className={`flex items-center space-x-2 p-3 border rounded-lg transition-colors ${
                  selectedProvider === provider.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{provider.icon}</span>
                <span className="text-sm font-medium text-gray-900">{provider.name}</span>
              </button>
            ))}
          </div>

          {/* API Key Input */}
          {selectedProvider && (
            <div className="space-y-3">
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              <Button
                onClick={handleAddKey}
                disabled={addKeyMutation.isPending || !apiKey.trim()}
                className="w-full bg-gray-900 text-white hover:bg-gray-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                {addKeyMutation.isPending ? 'Adding...' : 'Add Provider'}
              </Button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            Your API keys are stored securely and only used for your requests. 
            Free tier: Hugging Face (no key required). Premium: OpenAI, Claude, Gemini.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}