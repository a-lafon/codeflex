import { Module } from '@nestjs/common';
import { TicketAnalyzerAgent } from './agents/ticket-analyzer/ticket-analyzer.agent';
import { OpenAiService } from '../../infra/services/openai.service';
import { GitReviewAgent } from './agents/git-review/git-review.agent';
import { ILlmProvider } from './ai.interface';
import { IntegratedReviewAgent } from './agents/integrated-review/integrated-review.agent';

const LlmProvider = { provide: ILlmProvider, useClass: OpenAiService };

@Module({
  providers: [
    LlmProvider,
    TicketAnalyzerAgent,
    GitReviewAgent,
    IntegratedReviewAgent,
  ],
  exports: [
    LlmProvider,
    TicketAnalyzerAgent,
    GitReviewAgent,
    IntegratedReviewAgent,
  ],
})
export class AiModule {}
