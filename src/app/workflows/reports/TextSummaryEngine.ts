// TextSummaryEngine.ts
let HuggingFaceCtor: any;
try {
  // Try default import
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  HuggingFaceCtor = require('huggingface').default;
} catch {
  // Fallback to namespace import
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  HuggingFaceCtor = require('huggingface');
}

/**
 * Summarizes text using an open-source model (BART or T5) via Hugging Face Inference API.
 */
export class TextSummaryEngine {
  private hf: any;
  private model: string;

  constructor(apiKey: string, model: 'facebook/bart-large-cnn' | 't5-base' = 'facebook/bart-large-cnn') {
    this.hf = new HuggingFaceCtor(apiKey);
    this.model = model;
  }

  /**
   * Summarizes the input text using the selected model.
   * @param text - The text to summarize.
   * @param minLength - Minimum summary length.
   * @param maxLength - Maximum summary length.
   */
  async summarizeText(text: string, minLength = 30, maxLength = 120): Promise<string> {
    const result = await this.hf.summarization({
      model: this.model,
      inputs: text,
      parameters: { min_length: minLength, max_length: maxLength },
    });
    return result[0]?.summary_text || '';
  }
} 