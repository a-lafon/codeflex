import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export const TicketAnalyzerSchema = z.object({
  requirements: z.array(z.string()),
  summary: z.string(),
});

export type TicketAnalyzer = z.infer<typeof TicketAnalyzerSchema>;

export const TicketAnalyzerJsonSchema = zodToJsonSchema(TicketAnalyzerSchema);
