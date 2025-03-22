import { Module } from '@nestjs/common';
import { TicketAnalyzerAgent } from './agents/ticket-analyzer/ticket-analyzer.agent';
import { OpenAiService } from '../../infra/services/openai.service';
import { GitReviewAgent } from './agents/git-review/git-review.agent';
import { ILlmProvider } from './ai.interface';
import { TicketCodeValidatorAgent } from './agents/ticket-code-validator/ticket-code-validator.agent';

const LlmProvider = { provide: ILlmProvider, useClass: OpenAiService };

@Module({
  providers: [
    LlmProvider,
    TicketAnalyzerAgent,
    GitReviewAgent,
    TicketCodeValidatorAgent,
  ],
  exports: [
    LlmProvider,
    TicketAnalyzerAgent,
    GitReviewAgent,
    TicketCodeValidatorAgent,
  ],
})
export class AiModule {}
