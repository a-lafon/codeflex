import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const CodeIssueSchema = z.object({
  description: z.string(),
  file: z.string().optional(),
  line: z.number().optional(),
  severity: z.enum(['critical', 'major', 'minor', 'info']).optional(),
  category: z.string().optional(),
  impact: z.string().optional(),
  fixComplexity: z.enum(['simple', 'moderate', 'complex']).optional(),
});

const CodeSuggestionSchema = z.object({
  description: z.string(),
  file: z.string().optional(),
  line: z.number().optional(),
  codeExample: z.string().optional(),
  rationale: z.string().optional(),
  alternatives: z.array(z.string()).optional(),
});

export const GitReviewSchema = z.object({
  summary: z.string(),
  issues: z.array(CodeIssueSchema),
  suggestions: z.array(CodeSuggestionSchema),
  rating: z.number().min(1).max(10).optional(),
  changesReview: z.array(z.string()),
  overallAssessment: z.string().optional(),
  focusAreaAnalysis: z.array(z.string()).optional(),
  reviewDetailLevel: z.enum(['basic', 'standard', 'thorough']).optional(),
  title: z.string(),
  codeMetrics: z
    .object({
      complexity: z.number().optional(),
      techDebt: z.string().optional(),
      testability: z.number().min(1).max(10).optional(),
    })
    .optional(),
  securityAssessment: z.string().optional(),
  performanceImpact: z.string().optional(),
  learningResources: z.array(z.string()).optional(),
});

export type GitReview = z.infer<typeof GitReviewSchema>;

export const GitReviewJsonSchema = zodToJsonSchema(GitReviewSchema);
