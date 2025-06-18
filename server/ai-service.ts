import { HfInference } from '@huggingface/inference';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIProvider {
  analyzeResume(content: string): Promise<{
    skills: string[];
    experience: string;
    achievements: string[];
  }>;
  
  researchCompany(companyName: string, position: string): Promise<{
    culture: string;
    mission: string;
    recentNews: string;
    requiredSkills: string[];
  }>;
  
  generateInterviewQuestions(companyName: string, position: string, userSkills: string[], experience: string): Promise<{
    questions: Array<{
      id: string;
      text: string;
      type: string;
      difficulty: string;
    }>;
  }>;
  
  evaluateResponse(question: string, response: string): Promise<{
    score: number;
    strengths: string[];
    improvements: string[];
    suggestion: string;
  }>;
  
  generateSuggestions(context: string, conversation: string, userProfile: any): Promise<{
    keyPoints: string[];
    followUpSuggestions: string[];
    communicationTips: string[];
    relevantAchievements: string[];
  }>;
}

export class HuggingFaceProvider implements AIProvider {
  private hf: HfInference;
  
  constructor(apiKey?: string) {
    
    this.hf = new HfInference(apiKey);
  }
  
  async analyzeResume(content: string) {
    try {
      const prompt = `Analyze this resume and extract information in JSON format:
      
Resume: ${content}

Please provide a JSON response with:
- skills: array of technical and soft skills mentioned
- experience: brief summary of work experience
- achievements: array of key accomplishments

Format: {"skills": ["skill1", "skill2"], "experience": "summary", "achievements": ["achievement1"]}`;

      const response = await this.hf.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.3,
          return_full_text: false
        }
      });
      
      
      try {
        const parsed = JSON.parse(response.generated_text.trim());
        return {
          skills: parsed.skills || [],
          experience: parsed.experience || 'Experience analysis in progress',
          achievements: parsed.achievements || []
        };
      } catch {
        
        const text = response.generated_text;
        return {
          skills: this.extractSkillsFromText(content),
          experience: 'Professional with relevant industry experience',
          achievements: this.extractAchievementsFromText(content)
        };
      }
    } catch (error) {
      console.error('HuggingFace resume analysis error:', error);
      return {
        skills: this.extractSkillsFromText(content),
        experience: 'Professional with relevant industry experience',
        achievements: this.extractAchievementsFromText(content)
      };
    }
  }
  
  async researchCompany(companyName: string, position: string) {
    try {
      const prompt = `Provide company research for ${companyName} for the position of ${position}. 

Please provide information about:
- Company culture and work environment
- Mission and values
- Recent company news or developments
- Key skills required for this position

Format as JSON: {"culture": "...", "mission": "...", "recentNews": "...", "requiredSkills": ["skill1", "skill2"]}`;

      const response = await this.hf.textGeneration({
        model: 'microsoft/DialoGPT-medium',
        inputs: prompt,
        parameters: {
          max_new_tokens: 600,
          temperature: 0.4,
          return_full_text: false
        }
      });
      
      try {
        const parsed = JSON.parse(response.generated_text.trim());
        return {
          culture: parsed.culture || `${companyName} focuses on innovation and collaboration`,
          mission: parsed.mission || `${companyName} is committed to excellence in their industry`,
          recentNews: parsed.recentNews || `${companyName} continues to grow and expand their operations`,
          requiredSkills: parsed.requiredSkills || this.getDefaultSkillsForPosition(position)
        };
      } catch {
        return {
          culture: `${companyName} fosters a collaborative and innovative work environment`,
          mission: `${companyName} is dedicated to delivering exceptional value to customers`,
          recentNews: `${companyName} is actively expanding and seeking talented professionals`,
          requiredSkills: this.getDefaultSkillsForPosition(position)
        };
      }
    } catch (error) {
      console.error('HuggingFace company research error:', error);
      return {
        culture: `${companyName} values teamwork, innovation, and professional growth`,
        mission: `${companyName} strives to be a leader in their industry`,
        recentNews: `${companyName} is focused on growth and new opportunities`,
        requiredSkills: this.getDefaultSkillsForPosition(position)
      };
    }
  }
  
  async generateInterviewQuestions(companyName: string, position: string, userSkills: string[], experience: string) {
    const questions = [
      {
        id: 'q1',
        text: `Tell me about your experience with ${userSkills[0] || 'relevant technologies'} and how you've applied it in previous roles.`,
        type: 'technical',
        difficulty: 'medium'
      },
      {
        id: 'q2',
        text: `Describe a challenging project you worked on and how you overcame obstacles.`,
        type: 'behavioral',
        difficulty: 'medium'
      },
      {
        id: 'q3',
        text: `Why are you interested in working at ${companyName} specifically?`,
        type: 'motivational',
        difficulty: 'easy'
      },
      {
        id: 'q4',
        text: `Walk me through how you would approach a ${position.toLowerCase()} project from start to finish.`,
        type: 'situational',
        difficulty: 'hard'
      },
      {
        id: 'q5',
        text: `Tell me about a time when you had to learn a new technology quickly. How did you approach it?`,
        type: 'behavioral',
        difficulty: 'medium'
      },
      {
        id: 'q6',
        text: `What do you consider your greatest professional achievement?`,
        type: 'behavioral',
        difficulty: 'easy'
      },
      {
        id: 'q7',
        text: `How do you handle working under pressure and tight deadlines?`,
        type: 'behavioral',
        difficulty: 'medium'
      },
      {
        id: 'q8',
        text: `Describe your experience working in a team environment.`,
        type: 'behavioral',
        difficulty: 'easy'
      },
      {
        id: 'q9',
        text: `What trends do you see in the industry that could impact this role?`,
        type: 'technical',
        difficulty: 'hard'
      },
      {
        id: 'q10',
        text: `Do you have any questions about our company culture or this position?`,
        type: 'closing',
        difficulty: 'easy'
      }
    ];
    
    return { questions };
  }
  
  async evaluateResponse(question: string, response: string) {
    const wordCount = response.split(' ').length;
    const hasSpecificExamples = /\b(example|instance|time when|situation|project)\b/i.test(response);
    const hasMetrics = /\d+%|\d+\s*(months?|years?|weeks?)|\$\d+|increased|decreased|improved/i.test(response);
    
    let score = 5; // Base score
    
    // Scoring logic
    if (wordCount > 50) score += 1;
    if (wordCount > 100) score += 1;
    if (hasSpecificExamples) score += 2;
    if (hasMetrics) score += 1;
    if (response.length > 200) score += 1;
    
    score = Math.min(10, Math.max(1, score));
    
    const strengths = [];
    const improvements = [];
    
    if (hasSpecificExamples) {
      strengths.push('Provided specific examples');
    } else {
      improvements.push('Include more specific examples from your experience');
    }
    
    if (hasMetrics) {
      strengths.push('Mentioned quantifiable results');
    } else {
      improvements.push('Add metrics or measurable outcomes when possible');
    }
    
    if (wordCount > 100) {
      strengths.push('Comprehensive and detailed response');
    } else if (wordCount < 50) {
      improvements.push('Provide more detailed explanations');
    }
    
    return {
      score,
      strengths,
      improvements,
      suggestion: score >= 7 
        ? 'Great response! Consider adding even more specific details to make it exceptional.'
        : 'Good start! Focus on adding specific examples and quantifiable results to strengthen your answer.'
    };
  }
  
  async generateSuggestions(context: string, conversation: string, userProfile: any) {
    const skills = userProfile.skills || [];
    const achievements = userProfile.achievements || [];
    
    return {
      keyPoints: [
        `Highlight your ${skills[0] || 'technical'} expertise`,
        'Mention specific project outcomes',
        'Connect your experience to their needs'
      ],
      followUpSuggestions: [
        'Ask about team structure and collaboration',
        'Inquire about growth opportunities',
        'Discuss upcoming projects or challenges'
      ],
      communicationTips: [
        'Maintain steady eye contact',
        'Use confident, clear language',
        'Ask clarifying questions when needed'
      ],
      relevantAchievements: achievements.slice(0, 3)
    };
  }
  
  private extractSkillsFromText(text: string): string[] {
    const commonSkills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL',
      'HTML', 'CSS', 'Angular', 'Vue', 'Express', 'MongoDB', 'PostgreSQL', 'AWS',
      'Docker', 'Kubernetes', 'Git', 'Agile', 'Scrum', 'Leadership', 'Communication',
      'Problem Solving', 'Project Management', 'Team Collaboration'
    ];
    
    return commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    ).slice(0, 8);
  }
  
  private extractAchievementsFromText(text: string): string[] {
    const lines = text.split('\n');
    const achievementLines = lines.filter(line => 
      /\b(achieved|improved|increased|reduced|led|managed|delivered|built|created)\b/i.test(line)
    );
    
    return achievementLines.slice(0, 5).map(line => line.trim());
  }
  
  private getDefaultSkillsForPosition(position: string): string[] {
    const positionSkills: { [key: string]: string[] } = {
      'developer': ['Programming', 'Problem Solving', 'Version Control', 'Testing'],
      'manager': ['Leadership', 'Communication', 'Project Management', 'Strategic Planning'],
      'designer': ['Creative Thinking', 'User Experience', 'Visual Design', 'Prototyping'],
      'analyst': ['Data Analysis', 'Critical Thinking', 'Research', 'Reporting'],
      'engineer': ['Technical Skills', 'Problem Solving', 'Systems Thinking', 'Innovation']
    };
    
    const positionLower = position.toLowerCase();
    for (const [key, skills] of Object.entries(positionSkills)) {
      if (positionLower.includes(key)) {
        return skills;
      }
    }
    
    return ['Communication', 'Problem Solving', 'Team Collaboration', 'Adaptability'];
  }
}

export class GeminiProvider implements AIProvider {
  private genai: GoogleGenerativeAI;
  private model: any;
  
  constructor(apiKey: string) {
    this.genai = new GoogleGenerativeAI(apiKey);
    this.model = this.genai.getGenerativeModel({ model: "gemini-pro" });
  }
  
  async analyzeResume(content: string) {
    try {
      const prompt = `Analyze this resume and extract information in JSON format:
      
Resume: ${content}

Please provide a JSON response with:
- skills: array of technical and soft skills mentioned
- experience: brief summary of work experience  
- achievements: array of key accomplishments

Format: {"skills": ["skill1", "skill2"], "experience": "summary", "achievements": ["achievement1"]}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const analysis = JSON.parse(text);
        return {
          skills: analysis.skills || [],
          experience: analysis.experience || '',
          achievements: analysis.achievements || []
        };
      } catch {
        return {
          skills: this.extractSkillsFromText(content),
          experience: 'Professional with relevant industry experience',
          achievements: this.extractAchievementsFromText(content)
        };
      }
    } catch (error) {
      console.error('Gemini resume analysis error:', error);
      return {
        skills: this.extractSkillsFromText(content),
        experience: 'Professional with relevant industry experience',
        achievements: this.extractAchievementsFromText(content)
      };
    }
  }
  
  async researchCompany(companyName: string, position: string) {
    try {
      const prompt = `Research ${companyName} for the position of ${position}. Provide insights about company culture, mission, recent developments, and key skills required for this role.

Return JSON format: {"culture": "...", "mission": "...", "recentNews": "...", "requiredSkills": ["skill1", "skill2"]}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const research = JSON.parse(text);
        return {
          culture: research.culture || `${companyName} fosters innovation and collaboration`,
          mission: research.mission || `${companyName} is committed to excellence`,
          recentNews: research.recentNews || `${companyName} continues to grow`,
          requiredSkills: research.requiredSkills || this.getDefaultSkillsForPosition(position)
        };
      } catch {
        return {
          culture: `${companyName} values teamwork and innovation`,
          mission: `${companyName} strives for industry leadership`,
          recentNews: `${companyName} is focused on growth opportunities`,
          requiredSkills: this.getDefaultSkillsForPosition(position)
        };
      }
    } catch (error) {
      console.error('Gemini company research error:', error);
      return {
        culture: `${companyName} values teamwork and innovation`,
        mission: `${companyName} strives for industry leadership`,
        recentNews: `${companyName} is focused on growth opportunities`,
        requiredSkills: this.getDefaultSkillsForPosition(position)
      };
    }
  }
  
  async generateInterviewQuestions(companyName: string, position: string, userSkills: string[], experience: string) {
    try {
      const prompt = `Generate 10 interview questions for:
Company: ${companyName}
Position: ${position}
Candidate Skills: ${userSkills.join(', ')}
Experience: ${experience}

Return JSON: {"questions": [{"id": "q1", "text": "...", "type": "behavioral|technical|situational", "difficulty": "easy|medium|hard"}]}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const questionData = JSON.parse(text);
        return { questions: questionData.questions || [] };
      } catch {
        return this.getDefaultQuestions(companyName, position, userSkills);
      }
    } catch {
      return this.getDefaultQuestions(companyName, position, userSkills);
    }
  }
  
  async evaluateResponse(question: string, response: string) {
    try {
      const prompt = `Evaluate this interview response:
Question: ${question}
Response: ${response}

Return JSON: {"score": 1-10, "strengths": ["strength1"], "improvements": ["improvement1"], "suggestion": "overall suggestion"}`;

      const result = await this.model.generateContent(prompt);
      const geminiResponse = await result.response;
      const text = geminiResponse.text();

      try {
        return JSON.parse(text);
      } catch {
        return this.getBasicFeedback(response);
      }
    } catch {
      return this.getBasicFeedback(response);
    }
  }
  
  async generateSuggestions(context: string, conversation: string, userProfile: any) {
    try {
      const prompt = `Provide real-time interview assistance:
Context: ${context}
Conversation: ${conversation}
User Profile: ${JSON.stringify(userProfile)}

Return JSON: {"keyPoints": ["point1"], "followUpSuggestions": ["suggestion1"], "communicationTips": ["tip1"], "relevantAchievements": ["achievement1"]}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch {
        return this.getBasicSuggestions(userProfile);
      }
    } catch {
      return this.getBasicSuggestions(userProfile);
    }
  }

  private extractSkillsFromText(text: string): string[] {
    const commonSkills = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL',
      'HTML', 'CSS', 'Angular', 'Vue', 'Express', 'MongoDB', 'PostgreSQL', 'AWS',
      'Docker', 'Kubernetes', 'Git', 'Agile', 'Scrum', 'Leadership', 'Communication'
    ];
    
    return commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    ).slice(0, 8);
  }
  
  private extractAchievementsFromText(text: string): string[] {
    const lines = text.split('\n');
    return lines.filter(line => 
      /\b(achieved|improved|increased|reduced|led|managed|delivered)\b/i.test(line)
    ).slice(0, 5);
  }
  
  private getDefaultSkillsForPosition(position: string): string[] {
    const positionSkills: { [key: string]: string[] } = {
      'developer': ['Programming', 'Problem Solving', 'Version Control', 'Testing'],
      'manager': ['Leadership', 'Communication', 'Project Management', 'Strategic Planning'],
      'designer': ['Creative Thinking', 'User Experience', 'Visual Design', 'Prototyping'],
      'analyst': ['Data Analysis', 'Critical Thinking', 'Research', 'Reporting']
    };
    
    const positionLower = position.toLowerCase();
    for (const [key, skills] of Object.entries(positionSkills)) {
      if (positionLower.includes(key)) return skills;
    }
    
    return ['Communication', 'Problem Solving', 'Team Collaboration', 'Adaptability'];
  }

  private getDefaultQuestions(companyName: string, position: string, userSkills: string[]) {
    return {
      questions: [
        { id: 'q1', text: `Tell me about your experience with ${userSkills[0] || 'relevant technologies'}.`, type: 'technical', difficulty: 'medium' },
        { id: 'q2', text: 'Describe a challenging project you worked on.', type: 'behavioral', difficulty: 'medium' },
        { id: 'q3', text: `Why are you interested in ${companyName}?`, type: 'motivational', difficulty: 'easy' }
      ]
    };
  }

  private getBasicFeedback(response: string) {
    const wordCount = response.split(' ').length;
    const score = Math.min(10, Math.max(3, Math.floor(wordCount / 20) + 5));
    
    return {
      score,
      strengths: wordCount > 50 ? ['Detailed response'] : [],
      improvements: wordCount < 50 ? ['Provide more detail'] : [],
      suggestion: 'Good response! Consider adding specific examples.'
    };
  }

  private getBasicSuggestions(userProfile: any) {
    return {
      keyPoints: ['Highlight your key skills', 'Mention relevant experience'],
      followUpSuggestions: ['Ask about team structure', 'Inquire about growth opportunities'],
      communicationTips: ['Maintain eye contact', 'Speak clearly'],
      relevantAchievements: userProfile.achievements?.slice(0, 3) || []
    };
  }
}

export class UniversalAIProvider implements AIProvider {
  private providers: Map<string, AIProvider> = new Map();
  private fallbackProvider: AIProvider;
  
  constructor(apiKeys: { [provider: string]: string } = {}) {
    
    if (apiKeys.gemini) {
      this.providers.set('gemini', new GeminiProvider(apiKeys.gemini));
    }
    if (apiKeys.huggingface) {
      this.providers.set('huggingface', new HuggingFaceProvider(apiKeys.huggingface));
    }
    
    
    this.fallbackProvider = new HuggingFaceProvider();
    this.providers.set('fallback', this.fallbackProvider);
  }
  
  private async tryProviders<T>(operation: (provider: AIProvider) => Promise<T>): Promise<T> {
    // 
    const providerOrder = ['gemini', 'huggingface', 'fallback'];
    
    for (const providerName of providerOrder) {
      const provider = this.providers.get(providerName);
      if (provider) {
        try {
          return await operation(provider);
        } catch (error) {
          console.warn(`Provider ${providerName} failed:`, error);
          continue;
        }
      }
    }
    
    throw new Error('All AI providers failed');
  }
  
  async analyzeResume(content: string) {
    return this.tryProviders(provider => provider.analyzeResume(content));
  }
  
  async researchCompany(companyName: string, position: string) {
    return this.tryProviders(provider => provider.researchCompany(companyName, position));
  }
  
  async generateInterviewQuestions(companyName: string, position: string, userSkills: string[], experience: string) {
    return this.tryProviders(provider => provider.generateInterviewQuestions(companyName, position, userSkills, experience));
  }
  
  async evaluateResponse(question: string, response: string) {
    return this.tryProviders(provider => provider.evaluateResponse(question, response));
  }
  
  async generateSuggestions(context: string, conversation: string, userProfile: any) {
    return this.tryProviders(provider => provider.generateSuggestions(context, conversation, userProfile));
  }
  
  addProvider(name: string, apiKey: string) {
    switch (name.toLowerCase()) {
      case 'gemini':
        this.providers.set('gemini', new GeminiProvider(apiKey));
        break;
      case 'huggingface':
        this.providers.set('huggingface', new HuggingFaceProvider(apiKey));
        break;
      default:
        throw new Error(`Unsupported provider: ${name}`);
    }
  }
  
  removeProvider(name: string) {
    if (name !== 'fallback') {
      this.providers.delete(name);
    }
  }
  
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys()).filter(name => name !== 'fallback');
  }
}

export function createAIProvider(userApiKeys?: { [provider: string]: string }, preferredProvider: string = 'huggingface'): AIProvider {
  // If specific provider requested and available, use it
  if (preferredProvider && userApiKeys?.[preferredProvider]) {
    switch (preferredProvider) {
      case 'gemini':
        return new GeminiProvider(userApiKeys.gemini);
      case 'huggingface':
        return new HuggingFaceProvider(userApiKeys.huggingface);
    }
  }
  
  // Use Universal provider for automatic fallback
  return new UniversalAIProvider(userApiKeys || {});
}