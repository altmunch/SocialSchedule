import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { AnalysisResult, SentimentAnalysisResult, SentimentLabelSchema, SentimentScoreSchema, AnalyzedTextSegmentSchema } from '../../data_analysis/types/analysis_types';
// Placeholder for potential external sentiment analysis library types
// import { SomeSentimentLibClient, SomeSentimentLibOptions } from 'some-sentiment-lib';

@Injectable()
export class SentimentAnalysisEngine {
  private openai: OpenAI;
  // private sentimentClient: SomeSentimentLibClient;

  constructor(private apiKey: string) {
    if (!apiKey) {
      throw new Error('API key is required for SentimentAnalysisEngine');
    }
    this.openai = new OpenAI({ apiKey: this.apiKey });
    console.log('SentimentAnalysisEngine initialized with API key.');
  }

  /**
   * Analyzes the sentiment of a given text.
   * @param text The input text to analyze.
   * @param correlationId Optional ID for tracing.
   * @returns A promise that resolves to an AnalysisResult containing the sentiment analysis.
   */
  async analyzeTextSentiment(
    text: string,
    correlationId?: string
  ): Promise<AnalysisResult<SentimentAnalysisResult>> {
    console.log(`SentimentAnalysisEngine: Analyzing text (length: ${text.length}), correlationId: ${correlationId}`);
    try {
      if (!text || text.trim() === '') {
        return {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Input text cannot be empty.',
          },
          metadata: {
            generatedAt: new Date(),
            source: 'SentimentAnalysisEngine.analyzeTextSentiment',
            correlationId,
          },
        };
      }

      const prompt = `
Analyze the sentiment of the following text. Provide the output in JSON format with the following structure:
{
  "overallSentiment": "<positive|negative|neutral>",
  "overallScores": {
    "positive": <number_between_0_and_1>,
    "negative": <number_between_0_and_1>,
    "neutral": <number_between_0_and_1>
  },
  "segments": [
    {
      "text": "<original_text_segment>",
      "offset": <number>,
      "length": <number>,
      "sentiment": "<positive|negative|neutral>",
      "scores": {
        "positive": <number_between_0_and_1>,
        "negative": <number_between_0_and_1>,
        "neutral": <number_between_0_and_1>
      },
      "keyPhrases": ["<phrase1>", "<phrase2>"]
    }
  ],
  "dominantEmotion": "<joy|sadness|anger|fear|surprise|disgust|etc.>"
}

Text to analyze:
"${text}"

Return ONLY the JSON object.
`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview', // Or your preferred model
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }, // Ensure JSON output
        temperature: 0.2, // Lower temperature for more deterministic output
      });

      if (!completion.choices[0]?.message?.content) {
        return {
          success: false,
          error: {
            code: 'OPENAI_API_ERROR',
            message: 'No content received from OpenAI API.',
          },
          metadata: {
            generatedAt: new Date(),
            source: 'SentimentAnalysisEngine.analyzeTextSentiment',
            correlationId,
          },
        };
      }

      let sentimentData: SentimentAnalysisResult;
      try {
        sentimentData = JSON.parse(completion.choices[0].message.content);
        // Basic validation, ideally use Zod here if schemas are set up for it
        if (!sentimentData.overallSentiment || !sentimentData.overallScores) {
            throw new Error('Invalid JSON structure received from OpenAI.');
        }
      } catch (parseError) {
        console.error('SentimentAnalysisEngine: Error parsing OpenAI response', parseError);
        const pError = parseError as Error;
        return {
          success: false,
          error: {
            code: 'OPENAI_RESPONSE_PARSE_ERROR',
            message: 'Failed to parse sentiment analysis data from OpenAI: ' + pError.message,
            details: completion.choices[0].message.content, // Include raw response for debugging
          },
          metadata: {
            generatedAt: new Date(),
            source: 'SentimentAnalysisEngine.analyzeTextSentiment',
            correlationId,
          },
        };
      }

      return {
        success: true,
        data: sentimentData,
        metadata: {
          generatedAt: new Date(),
          source: 'SentimentAnalysisEngine.analyzeTextSentiment',
          correlationId,
          // Potentially add model used, tokens, etc.
        },
      };
    } catch (error) {
      console.error('SentimentAnalysisEngine: Error analyzing sentiment', error);
      const err = error as Error;
      return {
        success: false,
        error: {
          code: 'SENTIMENT_ANALYSIS_FAILED',
          message: err.message || 'An unknown error occurred during sentiment analysis.',
          details: err.stack,
        },
        metadata: {
          generatedAt: new Date(),
          source: 'SentimentAnalysisEngine.analyzeTextSentiment',
          correlationId,
        },
      };
    }
  }
}
