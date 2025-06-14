import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ContentTemplate {
  hook: string;
  script: string;
  visuals: string;
  audio: string;
}

export class LlmWrapper {
  private genAI: GoogleGenerativeAI;

  constructor(private apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey || process.env.GEMINI_API_KEY || '');
  }

  async *generateTemplates(
    description: string,
    platform: string,
    count: number = 5
  ): AsyncGenerator<ContentTemplate, void, unknown> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Create ${count} short-form content templates for ${platform} based on: "${description}"

      For each template, provide exactly:
      1. Hook: An attention-grabbing opening line (max 20 words)
      2. Script: A compelling 30-60 second script with clear storytelling 
      3. Visuals: Specific visual suggestions including scenes, angles, and framing
      4. Audio: Music style, tone, and sound effect recommendations

      Format each template as:
      TEMPLATE X:
      Hook: [hook text]
      Script: [script text]
      Visuals: [visual suggestions]
      Audio: [audio suggestions]

      Make each template unique and optimized for ${platform} engagement and sales conversion.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the response to extract individual templates
      const templates = this.parseGeminiResponse(text, count);
      
      for (const template of templates) {
        yield template;
        await new Promise((r) => setTimeout(r, 100)); // Small delay for streaming effect
      }
    } catch (error) {
      console.error('Error generating templates with Gemini:', error);
      // Fallback to placeholder data if API fails
      for (let i = 0; i < count; i++) {
        yield {
          hook: `Hook for ${description} [${i + 1}]`,
          script: `Script for ${description} on ${platform} [${i + 1}]`,
          visuals: `Visuals for ${description} [${i + 1}]`,
          audio: `Audio for ${description} [${i + 1}]`,
        };
        await new Promise((r) => setTimeout(r, 200));
      }
    }
  }

  private parseGeminiResponse(text: string, expectedCount: number): ContentTemplate[] {
    const templates: ContentTemplate[] = [];
    const templateBlocks = text.split(/TEMPLATE \d+:/i).slice(1);
    
    for (let i = 0; i < Math.min(templateBlocks.length, expectedCount); i++) {
      const block = templateBlocks[i];
      const hookMatch = block.match(/Hook:\s*(.+?)(?=\n|Script:|$)/);
      const scriptMatch = block.match(/Script:\s*(.+?)(?=\n|Visuals:|$)/);
      const visualsMatch = block.match(/Visuals:\s*(.+?)(?=\n|Audio:|$)/);
      const audioMatch = block.match(/Audio:\s*(.+?)(?=\n|TEMPLATE|$)/);
      
      templates.push({
        hook: hookMatch?.[1]?.trim() || `Creative hook for template ${i + 1}`,
        script: scriptMatch?.[1]?.trim() || `Engaging script for template ${i + 1}`,
        visuals: visualsMatch?.[1]?.trim() || `Visual suggestions for template ${i + 1}`,
        audio: audioMatch?.[1]?.trim() || `Audio recommendations for template ${i + 1}`,
      });
    }
    
    // Ensure we always return exactly the expected count
    while (templates.length < expectedCount) {
      const i = templates.length + 1;
      templates.push({
        hook: `Creative hook for template ${i}`,
        script: `Engaging script for template ${i}`,
        visuals: `Visual suggestions for template ${i}`,
        audio: `Audio recommendations for template ${i}`,
      });
    }
    
    return templates.slice(0, expectedCount);
  }
} 