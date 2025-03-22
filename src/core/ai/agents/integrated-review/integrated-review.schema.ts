import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { TicketAnalyzerSchema } from '../ticket-analyzer/ticket-analyzer.schema';
import { GitReviewSchema } from '../git-review/git-review.schema';

export const IntegratedReviewSchema = z.object({
  ticketAnalysis: TicketAnalyzerSchema,
  codeReview: GitReviewSchema,
  recommendations: z.array(z.string()),
  conclusion: z.string(),
});

export type IntegratedReview = z.infer<typeof IntegratedReviewSchema>;

export const IntegratedReviewJsonSchema = zodToJsonSchema(
  IntegratedReviewSchema,
);
