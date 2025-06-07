import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertResumeSchema, insertCompanyInsightsSchema, insertInterviewSessionSchema } from "@shared/schema";
import OpenAI from "openai";
import multer from "multer";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || ""
});

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Resume upload and analysis
  app.post('/api/resume/upload', upload.single('resume'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fs = await import('fs');
      const fileContent = fs.readFileSync(req.file.path, 'utf-8');
      
      // Extract skills and experience using OpenAI
      const analysisResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a resume analysis expert. Extract skills, experience summary, and key achievements from the resume text. Return a JSON object with 'skills' (array of strings), 'experience' (string summary), and 'achievements' (array of strings)."
          },
          {
            role: "user",
            content: `Analyze this resume content and extract key information:\n\n${fileContent}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(analysisResponse.choices[0].message.content || '{}');
      
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

      // Generate insights using OpenAI
      const researchResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a career research expert. Provide company insights including culture, mission, recent news, and required skills for a specific position. Return a JSON object with 'culture', 'mission', 'recentNews', 'requiredSkills' (array), and 'additionalInsights' fields."
          },
          {
            role: "user",
            content: `Research ${companyName} for the position of ${position}. Provide insights about company culture, mission, recent developments, and key skills required for this role.`
          }
        ],
        response_format: { type: "json_object" }
      });

      const research = JSON.parse(researchResponse.choices[0].message.content || '{}');
      
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
      
      // Generate interview questions using OpenAI
      const questionsResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert interviewer. Generate a set of 10 relevant interview questions based on the candidate's resume, company, and position. Return a JSON object with 'questions' array, where each question has 'id', 'text', 'type' (behavioral, technical, situational), and 'difficulty' (easy, medium, hard)."
          },
          {
            role: "user",
            content: `Generate interview questions for:
            Company: ${companyName}
            Position: ${position}
            Candidate Skills: ${resume?.skills?.join(', ') || 'General skills'}
            Experience: ${resume?.experience || 'Entry level'}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const questionData = JSON.parse(questionsResponse.choices[0].message.content || '{}');
      
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

      // Get feedback from OpenAI
      const feedbackResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an interview coach. Analyze the candidate's response and provide constructive feedback. Return a JSON object with 'score' (1-10), 'strengths' (array), 'improvements' (array), and 'suggestion' (string)."
          },
          {
            role: "user",
            content: `Evaluate this interview response:
            Question: ${session.questions?.find((q: any) => q.id === questionId)?.text || 'Unknown question'}
            Response: ${response}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const feedback = JSON.parse(feedbackResponse.choices[0].message.content || '{}');
      
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
      
      const suggestionResponse = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a real-time interview assistant. Provide helpful suggestions, talking points, and follow-up questions based on the conversation context. Return a JSON object with 'keyPoints' (array), 'followUpSuggestions' (array), 'communicationTips' (array), and 'relevantAchievements' (array)."
          },
          {
            role: "user",
            content: `Provide real-time assistance for this interview conversation:
            Context: ${context}
            Recent conversation: ${conversation}
            User background: ${JSON.stringify(userProfile)}`
          }
        ],
        response_format: { type: "json_object" }
      });

      const suggestions = JSON.parse(suggestionResponse.choices[0].message.content || '{}');
      
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
