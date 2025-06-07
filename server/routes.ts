import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertResumeSchema, insertCompanyInsightsSchema, insertInterviewSessionSchema, insertUserSchema } from "@shared/schema";
import { createAIProvider, UniversalAIProvider } from "./ai-service";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Global AI provider instance
let globalAIProvider = createAIProvider();

export async function registerRoutes(app: Express): Promise<Server> {
  
  // API Key Management
  app.post('/api/user/api-keys', async (req, res) => {
    try {
      const { userId, provider, apiKey } = req.body;
      
      if (!userId || !provider || !apiKey) {
        return res.status(400).json({ error: 'userId, provider, and apiKey are required' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update user's API keys
      const updateData: any = {};
      switch (provider.toLowerCase()) {
        case 'openai':
          updateData.openaiApiKey = apiKey;
          break;
        case 'anthropic':
          updateData.anthropicApiKey = apiKey;
          break;
        case 'huggingface':
          updateData.huggingfaceApiKey = apiKey;
          break;
        default:
          return res.status(400).json({ error: 'Unsupported provider' });
      }

      // Update the global AI provider with new keys
      if (globalAIProvider instanceof UniversalAIProvider) {
        globalAIProvider.addProvider(provider, apiKey);
      }

      res.json({ message: 'API key updated successfully', provider });
    } catch (error) {
      console.error('API key update error:', error);
      res.status(500).json({ error: 'Failed to update API key' });
    }
  });

  app.delete('/api/user/api-keys/:provider', async (req, res) => {
    try {
      const { provider } = req.params;
      const { userId } = req.body;

      if (globalAIProvider instanceof UniversalAIProvider) {
        globalAIProvider.removeProvider(provider);
      }

      res.json({ message: 'API key removed successfully', provider });
    } catch (error) {
      console.error('API key removal error:', error);
      res.status(500).json({ error: 'Failed to remove API key' });
    }
  });

  app.get('/api/user/available-providers', async (req, res) => {
    try {
      if (globalAIProvider instanceof UniversalAIProvider) {
        const providers = globalAIProvider.getAvailableProviders();
        res.json({ providers, fallback: 'huggingface' });
      } else {
        res.json({ providers: [], fallback: 'huggingface' });
      }
    } catch (error) {
      console.error('Get providers error:', error);
      res.status(500).json({ error: 'Failed to get available providers' });
    }
  });

  // Real-time assistant suggestions
  app.post('/api/assistant/suggest', async (req, res) => {
    try {
      const { context, conversation, userProfile } = req.body;
      
      const suggestions = await globalAIProvider.generateSuggestions(context, conversation, userProfile);
      res.json(suggestions);
    } catch (error) {
      console.error('Assistant suggestions error:', error);
      res.status(500).json({ error: 'Failed to generate suggestions' });
    }
  });
  
  // Resume upload and analysis
  app.post('/api/resume/upload', upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fs = await import('fs');
      const fileContent = fs.readFileSync(req.file.path, 'utf-8');
      
      // Extract skills and experience using Universal AI Provider
      const analysis = await globalAIProvider.analyzeResume(fileContent);
      
      const resumeData = {
        userId: 1, // For demo purposes, using user ID 1
        filename: req.file.originalname,
        content: fileContent,
        skills: analysis.skills || [],
        experience: analysis.experience || '',
        achievements: analysis.achievements || []
      };

      const validatedData = insertResumeSchema.parse(resumeData);
      const resume = await storage.createResume(validatedData);
      
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      
      res.json(resume);
    } catch (error) {
      console.error('Resume upload error:', error);
      res.status(500).json({ error: 'Failed to process resume' });
    }
  });

  // Get user's resume
  app.get('/api/resume/user/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const resume = await storage.getResumeByUserId(userId);
      
      if (!resume) {
        return res.status(404).json({ error: 'Resume not found' });
      }
      
      res.json(resume);
    } catch (error) {
      console.error('Get resume error:', error);
      res.status(500).json({ error: 'Failed to fetch resume' });
    }
  });

  // Company research
  app.post('/api/company/research', async (req, res) => {
    try {
      const { companyName, position } = req.body;
      
      if (!companyName || !position) {
        return res.status(400).json({ error: 'Company name and position are required' });
      }

      // Check if insights already exist
      const existing = await storage.getCompanyInsights(companyName, position);
      if (existing) {
        return res.json(existing);
      }

      // Generate insights using Universal AI Provider
      const research = await globalAIProvider.researchCompany(companyName, position);
      
      const insightsData = {
        companyName,
        position,
        culture: research.culture || '',
        mission: research.mission || '',
        recentNews: research.recentNews || '',
        requiredSkills: research.requiredSkills || [],
        insights: research
      };

      const validatedData = insertCompanyInsightsSchema.parse(insightsData);
      const insights = await storage.createCompanyInsights(validatedData);
      
      res.json(insights);
    } catch (error) {
      console.error('Company research error:', error);
      res.status(500).json({ error: 'Failed to research company' });
    }
  });

  // Start mock interview session
  app.post('/api/interview/start', async (req, res) => {
    try {
      const { userId, companyName, position, resumeId } = req.body;
      
      // Get user's resume for context
      const resume = await storage.getResumeByUserId(userId);
      
      // Generate interview questions using Universal AI Provider
      const questionData = await globalAIProvider.generateInterviewQuestions(
        companyName,
        position,
        resume?.skills || [],
        resume?.experience || 'Entry level'
      );
      
      const sessionData = {
        userId,
        companyName,
        position,
        questions: questionData.questions || [],
        responses: [],
        feedback: {},
        completed: false
      };

      const validatedData = insertInterviewSessionSchema.parse(sessionData);
      const session = await storage.createInterviewSession(validatedData);
      
      res.json(session);
    } catch (error) {
      console.error('Start interview error:', error);
      res.status(500).json({ error: 'Failed to start interview session' });
    }
  });

  // Submit interview response
  app.post('/api/interview/:sessionId/response', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const { questionId, response } = req.body;
      
      const session = await storage.getInterviewSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Interview session not found' });
      }

      // Get feedback from Universal AI Provider
      const questionText = Array.isArray(session.questions) 
        ? session.questions.find((q: any) => q.id === questionId)?.text || 'Unknown question'
        : 'Unknown question';
      
      const feedback = await globalAIProvider.evaluateResponse(questionText, response);
      
      // Update session with response and feedback
      const updatedResponses = [...(session.responses as any[] || []), {
        questionId,
        response,
        feedback,
        timestamp: new Date().toISOString()
      }];

      const updatedSession = await storage.updateInterviewSession(sessionId, {
        responses: updatedResponses
      });
      
      res.json({ feedback, session: updatedSession });
    } catch (error) {
      console.error('Submit response error:', error);
      res.status(500).json({ error: 'Failed to submit response' });
    }
  });

  // Real-time assistance
  app.post('/api/assistant/suggest', async (req, res) => {
    try {
      const { context, conversation, userProfile } = req.body;
      
      const suggestions = await globalAIProvider.generateSuggestions(context, conversation, userProfile);
      
      res.json(suggestions);
    } catch (error) {
      console.error('Real-time assistance error:', error);
      res.status(500).json({ error: 'Failed to generate suggestions' });
    }
  });

  // Get interview sessions for user
  app.get('/api/interview/sessions/:userId', async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessions = await storage.getInterviewSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({ error: 'Failed to fetch interview sessions' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
