export enum ModelEnum {
  SMALL,
  MEDIUM,
  LARGE,
}

export interface ILlmProvider {
  getCompletion<T extends object>(opts: {
    systemPrompt: string;
    prompt: string;
    dto: new () => T;
    model: ModelEnum;
  }): Promise<T>;
}

export const ILlmProvider = Symbol('ILlmProvider');
