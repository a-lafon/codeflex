import { Command } from 'commander';
import * as fs from 'fs';
import { INestApplicationContext } from '@nestjs/common';
import { GenerateDocumentationUseCase } from '@/app/usecases/generate-documentation.usecase';
import { GitDocumentationAgent } from '@/core/ai/agents/git-documentation/git-documentation.agent';
import { GitService } from '@/core/git/git.service';
import { DocumentationOptions } from '@/core/ai/agents/git-documentation/git-documentation.agent';
import * as path from 'path';

export function registerGenerateDocsCommand(
  program: Command,
  appContext: INestApplicationContext,
): void {
  program
    .command('generate-docs')
    .description('Generate documentation from a merge request')
    .requiredOption('-m, --merge-request <id>', 'Specify the merge request ID')
    .requiredOption('-p, --project <id>', 'Specify the project ID')
    .option(
      '-d, --detail-level <level>',
      'Set documentation detail level (basic, standard, thorough)',
      'standard',
    )
    .option(
      '--focus <areas>',
      'Focus on specific documentation areas (comma-separated)',
    )
    .option(
      '-o, --output <path>',
      'Output path for the generated documentation',
    )
    .option('--file', 'Save documentation to a file with default name')
    .option('--include-apis', 'Include API documentation')
    .option('--include-code-examples', 'Include code examples')
    .option('--include-design-patterns', 'Include design patterns analysis')
    .option('--json', 'Also save the structured JSON data')
    .option('--verbose', 'Show detailed process information')
    .action(
      async (options: {
        mergeRequest: string;
        project: string;
        detailLevel?: string;
        focus?: string;
        output?: string;
        file?: boolean;
        includeApis?: boolean;
        includeCodeExamples?: boolean;
        includeDesignPatterns?: boolean;
        json?: boolean;
        verbose?: boolean;
      }) => {
        if (options?.verbose) {
          console.log(
            `Generating documentation for merge request ${options.mergeRequest} from project ${options.project}`,
          );
        }

        const generateDocumentation = new GenerateDocumentationUseCase(
          appContext.get(GitDocumentationAgent),
          appContext.get(GitService),
        );

        const docOptions: DocumentationOptions = {
          detailLevel: options.detailLevel as 'basic' | 'standard' | 'thorough',
          focusAreas: options.focus?.split(',').map((area) => area.trim()),
          includeApis: options.includeApis,
          includeCodeExamples: options.includeCodeExamples,
          includeDesignPatterns: options.includeDesignPatterns,
        };

        const result = await generateDocumentation.exec(
          options.mergeRequest,
          options.project,
          docOptions,
        );

        if (options.verbose) {
          console.log('Documentation generated successfully.');
        }

        const shouldSaveToFile = options.file || options.output;

        if (shouldSaveToFile) {
          const outputMarkdownPath = options.output
            ? options.output
            : `docs_mr_${options.mergeRequest}.md`;

          const dir = path.dirname(outputMarkdownPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFileSync(outputMarkdownPath, result.markdown);

          if (options.verbose) {
            console.log(`Documentation saved to ${outputMarkdownPath}`);
          }

          if (options.json) {
            const jsonPath = outputMarkdownPath.replace(/\.md$/, '.json');
            fs.writeFileSync(
              jsonPath,
              JSON.stringify(result.structuredData, null, 2),
            );

            if (options.verbose) {
              console.log(`Structured data saved to ${jsonPath}`);
            }
          }
        }

        if (!options.output) {
          console.log('\n=== Generated Documentation ===\n');
          console.log(result.markdown);
        }
      },
    );
}
