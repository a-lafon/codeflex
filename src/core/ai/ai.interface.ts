export enum ModelEnum {
  SMALL,
  MEDIUM,
  LARGE,
}

export interface ILlmProvider {
  getCompletion(opts: {
    systemPrompt: string;
    prompt: string;
    model: ModelEnum;
    schemaName: string;
    schema: Record<string, unknown>;
  }): Promise<string>;
}

export const ILlmProvider = Symbol('ILlmProvider');
