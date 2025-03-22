import OpenAI from 'openai';
import { ILlmProvider, ModelEnum } from '../../core/ai/ai.interface';
const models = new Map<ModelEnum, string>([
  [ModelEnum.SMALL, 'gpt-4o-mini'],
  [ModelEnum.MEDIUM, 'gpt-4o'],
  [ModelEnum.LARGE, 'gpt-4o'],
]);

export class OpenAiService implements ILlmProvider {
  private readonly openaiClient: OpenAI;

  constructor() {
    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getCompletion(opts: {
    systemPrompt: string;
    prompt: string;
    model: ModelEnum;
    schemaName: string;
    schema: Record<string, unknown>;
  }): Promise<string> {
    const model = models.get(opts.model) ?? 'gpt-4o-mini';
    const completion = await this.openaiClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: opts.systemPrompt,
        },
        { role: 'user', content: opts.prompt },
      ],
      model,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: opts.schemaName,
          schema: opts.schema,
        },
      },
    });
    const content = completion.choices[0].message.content;

    console.log('schemaName', opts.schemaName);
    console.log('model', model);
    console.log('prompt_tokens', completion.usage?.prompt_tokens);
    console.log('completion_tokens', completion.usage?.completion_tokens);
    console.log('total_tokens', completion.usage?.total_tokens);

    if (!content) {
      throw Error('No content');
    }

    return content;
  }
}
