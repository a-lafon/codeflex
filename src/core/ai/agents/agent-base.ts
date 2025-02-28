/* eslint-disable @typescript-eslint/no-unsafe-return */
import { JsonSchema7Type } from 'zod-to-json-schema';
import { ILlmProvider, ModelEnum } from '../ai.interface';
import { z, ZodError, ZodType } from 'zod';

export abstract class Agent<T extends ZodType<any, any, any>> {
  protected abstract systemPrompt: string;
  protected abstract schemaName: string;
  protected abstract schemaObject: JsonSchema7Type;
  protected abstract model: ModelEnum;

  constructor(protected readonly llmProvider: ILlmProvider) {}

  protected async execute(prompt: string, schema: T): Promise<z.TypeOf<T>> {
    try {
      const response = await this.llmProvider.getCompletion({
        systemPrompt: this.systemPrompt,
        prompt,
        model: this.model,
        schema: this.schemaObject,
        schemaName: this.schemaName,
      });
      const data: unknown = JSON.parse(response);
      return schema.parse(data);
    } catch (error: unknown) {
      console.log('type of error', typeof error);
      if (error instanceof Error) {
        console.error('error', error.message);
      }
      if (error instanceof ZodError) {
        console.error('zod error', error.message);
      }
      throw error;
    }
  }
}
