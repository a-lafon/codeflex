import { Module } from '@nestjs/common';
import { TicketAnalyzerAgent } from './agents/ticket-analyzer/ticket-analyzer.agent';
import { OpenAiProvider } from './openai.provider';
import { ILlmProvider } from './ai.interface';
import { GitReviewAgent } from './agents/git-review/git-review.agent';

const LlmProvider = { provide: ILlmProvider, useClass: OpenAiProvider };

@Module({
  providers: [LlmProvider, TicketAnalyzerAgent, GitReviewAgent],
  exports: [LlmProvider, TicketAnalyzerAgent, GitReviewAgent],
})
export class AiModule {}
