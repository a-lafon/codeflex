import OpenAI from 'openai';
import { ILlmProvider, ModelEnum } from './ai.interface';
// import { encodingForModel, TiktokenModel } from 'js-tiktoken';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { targetConstructorToSchema } from 'class-validator-jsonschema';

const models = new Map<ModelEnum, string>([
  [ModelEnum.SMALL, 'gpt-4o-mini'],
  [ModelEnum.MEDIUM, 'gpt-4o'],
  [ModelEnum.LARGE, 'gpt-4o'],
]);

export class OpenAiProvider implements ILlmProvider {
  private readonly openaiClient: OpenAI;

  constructor() {
    this.openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getCompletion<T extends object>(opts: {
    systemPrompt: string;
    prompt: string;
    dto: new () => T;
    model: ModelEnum;
  }): Promise<T> {
    const schemaName = this.camelToSnake(opts.dto.name);
    const schema = targetConstructorToSchema(opts.dto) as Record<
      string,
      unknown
    >;

    const completion = await this.openaiClient.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: opts.systemPrompt,
        },
        { role: 'user', content: opts.prompt },
      ],
      model: models.get(opts.model) ?? 'gpt-4o-mini',
      response_format: {
        type: 'json_schema',
        json_schema: { schema, name: schemaName },
      },
    });
    const content = completion.choices[0].message.content;

    console.log('prompt_tokens', completion.usage?.prompt_tokens);
    console.log('completion_tokens', completion.usage?.completion_tokens);
    console.log('total_tokens', completion.usage?.total_tokens);

    if (!content) {
      throw Error('No content');
    }

    return this.validateOutput(opts.dto, content);
  }

  private camelToSnake(str: string) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toLowerCase()
      .replace('_dto', '');
  }

  private async validateOutput<T extends object>(
    dto: new () => T,
    content: string,
  ): Promise<T> {
    try {
      const rawResponse = JSON.parse(content) as Record<string, unknown>;
      const instance = plainToInstance(dto, rawResponse);
      await validateOrReject(instance);
      return instance;
    } catch (error) {
      console.error('Invalid output format', error);
      throw error;
    }
  }

  // private countTokens(text: string, model: TiktokenModel): number {
  //   const encoder = encodingForModel(model);
  //   const tokens = encoder.encode(text);
  //   return tokens.length;
  // }
}
