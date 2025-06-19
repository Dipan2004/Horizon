import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertResumeSchema, insertCompanyInsightsSchema, insertInterviewSessionSchema, insertUserSchema } from "@shared/schema";
import { createAIProvider, UniversalAIProvider } from "./ai-service";
import multer from "multer";
import { db } from "./db";
import { resumes, interviews, type NewResume, type NewInterview } from "./db/schema";
import { eq } from "drizzle-orm";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

let globalAIProvider = createAIProvider();

export async function registerRoutes(app: Express): Promise<Server> {
  
  // New Neon DB routes
  app.post('/api/save-resume', async (req, res) => {
    try {
      const { userEmail, rawText, skills, experience, achievements } = req.body;
      
      if (!userEmail || !rawText) {
        return res.status(400).json({ error: 'userEmail and rawText are required' });
      }

      const newResume: NewResume = {
        userEmail,
        rawText,
        skills: skills || [],
        experience: experience || '',
        achievements: achievements || [],
      };

      const result = await db.insert(resumes).values(newResume).returning();
      
      res.json({ 
        message: 'Resume saved successfully', 
        resume: result[0] 
      });
    } catch (error) {
      console.error('Save resume error:', error);
      res.status(500).json({ error: 'Failed to save resume' });
    }
  });

  app.post('/api/save-interview', async (req, res) => {
    try {
      const { userEmail, question, answer, score, feedback } = req.body;
      
      if (!userEmail || !question || !answer) {
        return res.status(400).json({ error: 'userEmail, question, and answer are required' });
      }

      const newInterview: NewInterview = {
        userEmail,
        question,
        answer,
        score: score || null,
        feedback: feedback || null,
      };

      const result = await db.insert(interviews).values(newInterview).returning();
      
      res.json({ 
        message: 'Interview data saved successfully', 
        interview: result[0] 
      });
    } catch (error) {
      console.error('Save interview error:', error);
      res.status(500).json({ error: 'Failed to save interview data' });
    }
  });

  // Get user's resumes
  app.get('/api/resumes/:userEmail', async (req, res) => {
    try {
      const { userEmail } = req.params;
      const userResumes = await db.select().from(resumes).where(eq(resumes.userEmail, userEmail));
      
      res.json(userResumes);
    } catch (error) {
      console.error('Get resumes error:', error);
      res.status(500).json({ error: 'Failed to fetch resumes' });
    }
  });

  // Get user's interviews
  app.get('/api/interviews/:userEmail', async (req, res) => {
    try {
      const { userEmail } = req.params;
      const userInterviews = await db.select().from(interviews).where(eq(interviews.userEmail, userEmail));
      
      res.json(userInterviews);
    } catch (error) {
      console.error('Get interviews error:', error);
      res.status(500).json({ error: 'Failed to fetch interviews' });
    }
  });

  // Existing routes from your original code
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

      const updateData: any = {};
      switch (provider.toLowerCase()) {
        case 'huggingface':
          updateData.huggingfaceApiKey = apiKey;
          break;
        case 'gemini':
          updateData.geminiApiKey = apiKey;
          break;
        default:
          return res.status(400).json({ 
            error: 'Unsupported provider. Only HuggingFace and Gemini are supported.' 
          });
      }

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

      if (!['huggingface', 'gemini'].includes(provider.toLowerCase())) {
        return res.status(400).json({ 
          error: 'Unsupported provider. Only HuggingFace and Gemini are supported.' 
        });
      }

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
        res.json({ 
          providers, 
          fallback: 'huggingface',
          supported: ['huggingface', 'gemini']
        });
      } else {
        res.json({ 
          providers: [], 
          fallback: 'huggingface',
          supported: ['huggingface', 'gemini']
        });
      }
    } catch (error) {
      console.error('Get providers error:', error);
      res.status(500).json({ error: 'Failed to get available providers' });
    }
  });

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

  app.post('/api/resume/upload', upload.single('resume'), async (req: MulterRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fs = await import('fs');
      const fileContent = fs.readFileSync(req.file.path, 'utf-8');
      
      const analysis = await globalAIProvider.analyzeResume(fileContent);
      
      const resumeData = {
        userId: 1,
        filename: req.file.originalname,
        content: fileContent,
        skills: analysis.skills || [],
        experience: analysis.experience || '',
        achievements: analysis.achievements || []
      };

      const validatedData = insertResumeSchema.parse(resumeData);
      const resume = await storage.createResume(validatedData);
      
      fs.unlinkSync(req.file.path);
      
      res.json(resume);
    } catch (error) {
      console.error('Resume upload error:', error);
      res.status(500).json({ error: 'Failed to process resume' });
    }
  });

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

  app.post('/api/company/research', async (req, res) => {
    try {
      const { companyName, position } = req.body;
      
      if (!companyName || !position) {
        return res.status(400).json({ error: 'Company name and position are required' });
      }

      const existing = await storage.getCompanyInsights(companyName, position);
      if (existing) {
        return res.json(existing);
      }

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

  app.post('/api/interview/start', async (req, res) => {
    try {
      const { userId, companyName, position, resumeId } = req.body;
      
      const resume = await storage.getResumeByUserId(userId);
      
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

  app.post('/api/interview/:sessionId/response', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const { questionId, response } = req.body;
      
      const session = await storage.getInterviewSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Interview session not found' });
      }

      const questionText = Array.isArray(session.questions) 
        ? session.questions.find((q: any) => q.id === questionId)?.text || 'Unknown question'
        : 'Unknown question';
      
      const feedback = await globalAIProvider.evaluateResponse(questionText, response);
      
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

  app.get('/api/interview/session/:sessionId', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const session = await storage.getInterviewSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: 'Interview session not found' });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({ error: 'Failed to fetch interview session' });
    }
  });

  app.post('/api/interview/:sessionId/complete', async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      
      const session = await storage.getInterviewSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Interview session not found' });
      }

      const updatedSession = await storage.updateInterviewSession(sessionId, {
        completed: true
      });
      
      res.json(updatedSession);
    } catch (error) {
      console.error('Complete session error:', error);
      res.status(500).json({ error: 'Failed to complete interview session' });
    }
  });

  app.get('/api/health', async (req, res) => {
    try {
      const providers = globalAIProvider instanceof UniversalAIProvider 
        ? globalAIProvider.getAvailableProviders()
        : [];
      
      res.json({ 
        status: 'healthy', 
        providers,
        supportedProviders: ['huggingface', 'gemini'],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({ error: 'Health check failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}