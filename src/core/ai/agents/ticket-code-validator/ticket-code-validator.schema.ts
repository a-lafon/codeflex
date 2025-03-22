import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { TicketAnalyzerSchema } from '../ticket-analyzer/ticket-analyzer.schema';
import { GitReviewSchema } from '../git-review/git-review.schema';

export const TicketCodeValidatorSchema = z.object({
  ticketAnalysis: TicketAnalyzerSchema,
  codeReview: GitReviewSchema,
  recommendations: z.array(z.string()),
  conclusion: z.string(),
});

export type TicketCodeValidator = z.infer<typeof TicketCodeValidatorSchema>;

export const TicketCodeValidatorJsonSchema = zodToJsonSchema(
  TicketCodeValidatorSchema,
);
