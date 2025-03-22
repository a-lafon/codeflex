import {
  CodeReviewUseCase,
  ReviewOptions,
} from '@/app/usecases/code-review-usecase';
import { NestFactory } from '@nestjs/core';
import { Command } from 'commander';
import { CliModule } from './cli.module';
import { GitService } from '@/core/git/git.service';
import { GitReviewAgent } from '@/core/ai/agents/git-review/git-review.agent';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(CliModule, {
    // logger: false,
  });

  const program = new Command();
  program
    .command('review')
    .description('Review a merge request and provide feedback')
    .requiredOption('-m, --merge-request <id>', 'Specify the merge request ID')
    .requiredOption('-p, --project <id>', 'Specify the project ID')
    .option(
      '-d, --detail-level <level>',
      'Set review detail level (basic, standard, thorough)',
      'standard',
    )
    .option(
      '--focus <areas>',
      'Focus on specific areas (comma-separated: style,security,performance,tests)',
    )
    .option(
      '--ignore <patterns>',
      'Ignore files matching patterns (comma-separated glob patterns)',
    )
    .option('--file', 'Save review results to file')
    .option('--verbose', 'Show detailed process information')
    .option('--project-guidelines <path>', 'Path to project guidelines file')
    .action(
      async (options: {
        mergeRequest: string;
        project: string;
        detailLevel?: string;
        format?: string;
        file?: boolean;
        focus?: string;
        ignore?: string;
        verbose?: boolean;
        projectGuidelines?: string;
      }) => {
        const reviewMergeRequest = new CodeReviewUseCase(
          app.get(GitReviewAgent),
        );

        if (options?.verbose) {
          console.log(
            `Fetching merge request ${options.mergeRequest} from project ${options.project}`,
          );
        }

        const mergeRequest = await app
          .get(GitService)
          .fetchMergeRequest(options.project, options.mergeRequest);

        if (options?.verbose) {
          console.log(`Retrieved merge request: "${mergeRequest.title}"`);
          console.log(
            `Starting code review with options:`,
            JSON.stringify(options, null, 2),
          );
        }

        const projectGuidelines = options.projectGuidelines
          ? await fs.promises.readFile(options.projectGuidelines, 'utf-8')
          : undefined;

        const reviewOptions: ReviewOptions = {
          detailLevel: options.detailLevel as 'basic' | 'standard' | 'thorough',
          focusAreas: options.focus?.split(',').map((area) => area.trim()),
          ignorePatterns: options.ignore
            ?.split(',')
            .map((pattern) => pattern.trim()),
          verbose: options.verbose,
          projectGuidelines,
        };

        const review = await reviewMergeRequest.exec(
          mergeRequest,
          reviewOptions,
        );

        if (options.verbose) {
          console.log('Review completed successfully.');
        }

        if (options.file) {
          const path = `review_${options.mergeRequest}.json`;
          fs.writeFileSync(path, JSON.stringify(review, null, 2));
          if (options.verbose) {
            console.log(`Review store successfully at ${path}.`);
          }
        }
      },
    );

  program.parse(process.argv);
  await app.close();
}
bootstrap();
