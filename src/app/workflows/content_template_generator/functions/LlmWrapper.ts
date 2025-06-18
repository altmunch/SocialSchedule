import OpenAI from 'openai';

export interface ContentTemplate {
  hook: string;
  script: string;
  visuals: string;
  audio: string;
}

interface PlatformConstraints {
  maxScriptLength: number;
  preferredHookLength: number;
  visualRequirements: string[];
  audioRequirements: string[];
  contentStyle: string;
}

export class LlmWrapper {
  private openai: OpenAI;
  private platformConstraints: Record<string, PlatformConstraints>;

  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    
    this.openai = new OpenAI({ apiKey });
    
    // Define platform-specific constraints
    this.platformConstraints = {
      'tiktok': {
        maxScriptLength: 500,
        preferredHookLength: 50,
        visualRequirements: ['fast-paced', 'vertical', 'engaging'],
        audioRequirements: ['trending', 'upbeat', 'clear'],
        contentStyle: 'casual, energetic, trend-focused'
      },
      'instagram': {
        maxScriptLength: 2200,
        preferredHookLength: 80,
        visualRequirements: ['aesthetic', 'high-quality', 'branded'],
        audioRequirements: ['mood-appropriate', 'clear', 'branded'],
        contentStyle: 'polished, aspirational, brand-focused'
      },
      'youtube': {
        maxScriptLength: 5000,
        preferredHookLength: 100,
        visualRequirements: ['professional', 'engaging', 'informative'],
        audioRequirements: ['clear', 'professional', 'consistent'],
        contentStyle: 'informative, engaging, value-driven'
      }
    };
  }

  async *generateTemplates(
    description: string,
    platform: string,
    count: number = 5
  ): AsyncGenerator<ContentTemplate, void, unknown> {
    if (!description.trim()) {
      throw new Error('Product description is required');
    }

    const constraints = this.platformConstraints[platform.toLowerCase()] || this.platformConstraints['tiktok'];
    
    const systemPrompt = this.buildSystemPrompt(platform, constraints);
    const userPrompt = this.buildUserPrompt(description, platform, constraints, count);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8, // Higher creativity for content generation
        max_tokens: 4000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI API');
      }

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch (error) {
        throw new Error('Failed to parse OpenAI response as JSON');
      }

      if (!parsedResponse.templates || !Array.isArray(parsedResponse.templates)) {
        throw new Error('Invalid response format: templates array not found');
      }

      // Validate and yield each template
      for (const template of parsedResponse.templates) {
        const validatedTemplate = this.validateTemplate(template, constraints);
        if (validatedTemplate) {
          yield validatedTemplate;
          // Add small delay to simulate streaming
          await new Promise((r) => setTimeout(r, 100));
        }
      }

    } catch (error) {
      console.error('Error generating templates:', error);
      
      // Fallback to high-quality structured templates if API fails
      for (let i = 0; i < count; i++) {
        yield this.generateFallbackTemplate(description, platform, i + 1, constraints);
        await new Promise((r) => setTimeout(r, 200));
      }
    }
  }

  private buildSystemPrompt(platform: string, constraints: PlatformConstraints): string {
    return `You are an expert social media content strategist specializing in ${platform} content creation. 

Your task is to generate highly engaging, platform-optimized content templates that drive conversions and engagement.

Platform: ${platform}
Content Style: ${constraints.contentStyle}
Max Script Length: ${constraints.maxScriptLength} characters
Preferred Hook Length: ~${constraints.preferredHookLength} characters
Visual Requirements: ${constraints.visualRequirements.join(', ')}
Audio Requirements: ${constraints.audioRequirements.join(', ')}

Key Guidelines:
1. Hooks must be attention-grabbing and create immediate curiosity or emotional response
2. Scripts should follow proven storytelling frameworks (Problem-Solution, Before-After, etc.)
3. Visual descriptions should be specific and actionable for video creators
4. Audio suggestions should enhance the content's emotional impact
5. All content must be authentic and provide genuine value
6. Include platform-specific best practices and trends

Response Format: Return a JSON object with a "templates" array containing exactly the requested number of templates. Each template must have: hook, script, visuals, audio fields.`;
  }

  private buildUserPrompt(description: string, platform: string, constraints: PlatformConstraints, count: number): string {
    return `Generate ${count} unique, high-converting content templates for this product/service:

Product/Service Description: "${description}"

Target Platform: ${platform}

Requirements:
- Each template should target a different angle or audience segment
- Hooks should be ${constraints.preferredHookLength} characters or less
- Scripts should be ${constraints.maxScriptLength} characters or less
- Include specific visual and audio recommendations
- Focus on conversion and engagement optimization
- Ensure diversity in approaches (educational, emotional, testimonial, etc.)

Generate templates that would realistically drive sales and engagement for this specific product/service on ${platform}.`;
  }

  private validateTemplate(template: any, constraints: PlatformConstraints): ContentTemplate | null {
    try {
      // Check required fields
      if (!template.hook || !template.script || !template.visuals || !template.audio) {
        console.warn('Template missing required fields');
        return null;
      }

      // Validate field types
      if (typeof template.hook !== 'string' || 
          typeof template.script !== 'string' || 
          typeof template.visuals !== 'string' || 
          typeof template.audio !== 'string') {
        console.warn('Template fields must be strings');
        return null;
      }

      // Validate length constraints
      if (template.script.length > constraints.maxScriptLength) {
        template.script = template.script.substring(0, constraints.maxScriptLength - 3) + '...';
      }

      if (template.hook.length > constraints.preferredHookLength * 1.5) {
        template.hook = template.hook.substring(0, constraints.preferredHookLength * 1.5 - 3) + '...';
      }

      return {
        hook: template.hook.trim(),
        script: template.script.trim(),
        visuals: template.visuals.trim(),
        audio: template.audio.trim()
      };

    } catch (error) {
      console.warn('Error validating template:', error);
      return null;
    }
  }

  private generateFallbackTemplate(description: string, platform: string, index: number, constraints: PlatformConstraints): ContentTemplate {
    const hooks = [
      `Stop scrolling if you've been struggling with ${this.extractKeyword(description)}`,
      `This ${this.extractKeyword(description)} hack will blow your mind`,
      `POV: You finally found the perfect ${this.extractKeyword(description)}`,
      `Why everyone's talking about this ${this.extractKeyword(description)}`,
      `The ${this.extractKeyword(description)} secret nobody tells you`
    ];

    const scriptTemplates = [
      `I used to struggle with ${this.extractKeyword(description)} until I discovered this game-changer. ${description} Here's why it works: [explain key benefits]. The results speak for themselves. Ready to transform your experience?`,
      `Let me show you the ${this.extractKeyword(description)} that's changing everything. ${description} What makes this special: [highlight unique features]. Thousands are already seeing results. Your turn next?`,
      `Here's the truth about ${this.extractKeyword(description)} that companies don't want you to know. ${description} This approach is different because: [explain differentiation]. See the proof for yourself.`,
      `Before vs After using this ${this.extractKeyword(description)} method. ${description} The transformation: [describe results]. This could be your story too.`,
      `Everyone asks me about my ${this.extractKeyword(description)} secret. ${description} The key ingredients: [list benefits]. Ready to join the success stories?`
    ];

    const visualTemplates = [
      `Start with close-up of problem, transition to solution reveal, show before/after comparison, end with satisfied user testimonial`,
      `Dynamic text overlays with key benefits, split-screen comparisons, product in action shots, emotional reaction captures`,
      `Trending transition effects, aesthetic flat lay setup, step-by-step process shots, final result showcase with celebration`,
      `Behind-the-scenes authentic footage, real user testimonials, product demonstration, lifestyle integration shots`,
      `Eye-catching graphics with statistics, time-lapse transformation, multiple angle product shots, community success stories`
    ];

    const audioTemplates = [
      `Upbeat trending audio that builds excitement, clear voiceover for key points, satisfying sound effects for reveals`,
      `Emotional background music that matches the transformation story, authentic testimonial audio, celebratory finale music`,
      `Popular trending sound with custom voiceover, rhythmic beats for transitions, clear call-to-action delivery`,
      `Inspiring instrumental background, conversational tone voiceover, authentic ambient sounds during demonstrations`,
      `Energetic music that maintains engagement, professional narration for credibility, sound effects that enhance visual impact`
    ];

    const selectedIndex = (index - 1) % hooks.length;

    return {
      hook: hooks[selectedIndex],
      script: scriptTemplates[selectedIndex].substring(0, constraints.maxScriptLength),
      visuals: visualTemplates[selectedIndex],
      audio: audioTemplates[selectedIndex]
    };
  }

  private extractKeyword(description: string): string {
    // Simple keyword extraction - in production, could use NLP
    const words = description.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those']);
    
    const keywords = words.filter(word => 
      word.length > 3 && 
      !stopWords.has(word) && 
      /^[a-zA-Z]+$/.test(word)
    );

    return keywords[0] || 'product';
  }
} 