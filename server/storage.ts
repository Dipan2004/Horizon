import { 
  users, 
  resumes, 
  companyInsights, 
  interviewSessions,
  type User, 
  type Resume, 
  type CompanyInsights, 
  type InterviewSession,
  type InsertUser, 
  type InsertResume, 
  type InsertCompanyInsights, 
  type InsertInterviewSession 
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Resume operations
  createResume(resume: InsertResume): Promise<Resume>;
  getResumeByUserId(userId: number): Promise<Resume | undefined>;
  updateResume(id: number, resume: Partial<InsertResume>): Promise<Resume | undefined>;
  
  // Company insights operations
  createCompanyInsights(insights: InsertCompanyInsights): Promise<CompanyInsights>;
  getCompanyInsights(companyName: string, position: string): Promise<CompanyInsights | undefined>;
  
  // Interview session operations
  createInterviewSession(session: InsertInterviewSession): Promise<InterviewSession>;
  getInterviewSession(id: number): Promise<InterviewSession | undefined>;
  updateInterviewSession(id: number, session: Partial<InsertInterviewSession>): Promise<InterviewSession | undefined>;
  getInterviewSessionsByUser(userId: number): Promise<InterviewSession[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private resumes: Map<number, Resume>;
  private companyInsightsList: Map<string, CompanyInsights>;
  private interviewSessionsList: Map<number, InterviewSession>;
  private currentUserId: number;
  private currentResumeId: number;
  private currentCompanyInsightsId: number;
  private currentSessionId: number;

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.companyInsightsList = new Map();
    this.interviewSessionsList = new Map();
    this.currentUserId = 1;
    this.currentResumeId = 1;
    this.currentCompanyInsightsId = 1;
    this.currentSessionId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      openaiApiKey: insertUser.openaiApiKey || null,
      huggingfaceApiKey: insertUser.huggingfaceApiKey || null,
      preferredAiProvider: insertUser.preferredAiProvider || 'huggingface'
    };
    this.users.set(id, user);
    return user;
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const id = this.currentResumeId++;
    const resume: Resume = { 
      ...insertResume, 
      id,
      skills: insertResume.skills || null,
      experience: insertResume.experience || null,
      achievements: insertResume.achievements || null
    };
    this.resumes.set(id, resume);
    return resume;
  }

  async getResumeByUserId(userId: number): Promise<Resume | undefined> {
    return Array.from(this.resumes.values()).find(
      (resume) => resume.userId === userId,
    );
  }

  async updateResume(id: number, resumeUpdate: Partial<InsertResume>): Promise<Resume | undefined> {
    const existing = this.resumes.get(id);
    if (!existing) return undefined;
    
    const updated: Resume = { ...existing, ...resumeUpdate };
    this.resumes.set(id, updated);
    return updated;
  }

  async createCompanyInsights(insertInsights: InsertCompanyInsights): Promise<CompanyInsights> {
    const id = this.currentCompanyInsightsId++;
    const insights: CompanyInsights = { 
      ...insertInsights, 
      id,
      culture: insertInsights.culture || null,
      mission: insertInsights.mission || null,
      recentNews: insertInsights.recentNews || null,
      requiredSkills: insertInsights.requiredSkills || null,
      insights: insertInsights.insights || null
    };
    const key = `${insertInsights.companyName}-${insertInsights.position}`;
    this.companyInsightsList.set(key, insights);
    return insights;
  }

  async getCompanyInsights(companyName: string, position: string): Promise<CompanyInsights | undefined> {
    const key = `${companyName}-${position}`;
    return this.companyInsightsList.get(key);
  }

  async createInterviewSession(insertSession: InsertInterviewSession): Promise<InterviewSession> {
    const id = this.currentSessionId++;
    const session: InterviewSession = { 
      ...insertSession, 
      id,
      companyName: insertSession.companyName || null,
      position: insertSession.position || null,
      questions: insertSession.questions || null,
      responses: insertSession.responses || null,
      feedback: insertSession.feedback || null,
      completed: insertSession.completed || false
    };
    this.interviewSessionsList.set(id, session);
    return session;
  }

  async getInterviewSession(id: number): Promise<InterviewSession | undefined> {
    return this.interviewSessionsList.get(id);
  }

  async updateInterviewSession(id: number, sessionUpdate: Partial<InsertInterviewSession>): Promise<InterviewSession | undefined> {
    const existing = this.interviewSessionsList.get(id);
    if (!existing) return undefined;
    
    const updated: InterviewSession = { ...existing, ...sessionUpdate };
    this.interviewSessionsList.set(id, updated);
    return updated;
  }

  async getInterviewSessionsByUser(userId: number): Promise<InterviewSession[]> {
    return Array.from(this.interviewSessionsList.values()).filter(
      (session) => session.userId === userId,
    );
  }
}

export const storage = new MemStorage();
