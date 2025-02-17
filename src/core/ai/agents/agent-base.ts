import { ILlmProvider, ModelEnum } from '../ai.interface';

export abstract class Agent<T extends object> {
  protected abstract systemPrompt: string;
  protected abstract dto: new () => T;
  protected abstract model: ModelEnum;

  constructor(protected readonly llmProvider: ILlmProvider) {}

  protected async execute(prompt: string) {
    return this.llmProvider.getCompletion<T>({
      systemPrompt: this.systemPrompt,
      prompt,
      dto: this.dto,
      model: this.model,
    });
  }
}
