import OpenAI from 'openai';
import { BaseSummarizer } from './base';

export class OpenAISummarizer extends BaseSummarizer {
  private openai: OpenAI;

  constructor(documentContext: string = '') {
    super(documentContext);
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  protected async getSummaryText(prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'o4-mini',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      return response.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  }
}
