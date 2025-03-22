import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const DocumentationSectionSchema = z.object({
  title: z.string(),
  content: z.string(),
  order: z.number(),
});

export const GitDocumentationSchema = z.object({
  title: z.string(),
  description: z.string(),
  summary: z.string(),
  sections: z.array(DocumentationSectionSchema),
  technicalDetails: z.object({
    languages: z.array(z.string()),
    frameworks: z.array(z.string()),
    libraries: z.array(z.string()),
    designPatterns: z.array(z.string()).optional(),
  }),
  apis: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
        endpoint: z.string().optional(),
        method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional(),
        parameters: z
          .array(
            z.object({
              name: z.string(),
              type: z.string(),
              description: z.string(),
              required: z.boolean().optional(),
            }),
          )
          .optional(),
      }),
    )
    .optional(),
  codeExamples: z
    .array(
      z.object({
        title: z.string(),
        code: z.string(),
        language: z.string(),
      }),
    )
    .optional(),
});

export type GitDocumentation = z.infer<typeof GitDocumentationSchema>;
export const GitDocumentationJsonSchema = zodToJsonSchema(
  GitDocumentationSchema,
);
