import { Command } from 'commander';
import * as fs from 'fs';
import {
  CodeReviewUseCase,
  ReviewOptions,
} from '@/app/usecases/code-review-usecase';
import { GitService } from '@/core/git/git.service';
import { GitReviewAgent } from '@/core/ai/agents/git-review/git-review.agent';
import { INestApplicationContext } from '@nestjs/common';
import { StorageService } from '@/core/storage/storage.service';

export function registerReviewCommand(
  program: Command,
  appContext: INestApplicationContext,
): void {
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
    .option('--verbose', 'Show detailed process information')
    .option('--project-guidelines <path>', 'Path to project guidelines file')
    .action(
      async (options: {
        mergeRequest: string;
        project: string;
        detailLevel?: string;
        focus?: string;
        ignore?: string;
        verbose?: boolean;
        projectGuidelines?: string;
      }) => {
        const reviewAgent = appContext.get(GitReviewAgent);
        const gitService = appContext.get(GitService);
        const storageService = appContext.get(StorageService);

        const codeReviewUseCase = new CodeReviewUseCase(reviewAgent);

        if (options?.verbose) {
          console.log(
            `Fetching merge request ${options.mergeRequest} from project ${options.project}`,
          );
        }

        const mergeRequest = await gitService.fetchMergeRequest(
          options.project,
          options.mergeRequest,
        );

        if (options?.verbose) {
          console.log(`Retrieved merge request: "${mergeRequest.title}"`);
          console.log(
            `Starting code review with options:`,
            JSON.stringify(options, null, 2),
          );
        }

        try {
          const filePath = await storageService.saveMergeRequest(mergeRequest);

          if (options.verbose) {
            console.log(
              `Merge request has been successfully saved in the storage system at ${filePath}`,
            );
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(`Error saving the review: ${error.message}`);
          } else {
            console.error('Error saving the review: Unknown error occurred');
          }
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

        const review = await codeReviewUseCase.exec(mergeRequest, {
          options: reviewOptions,
          similarMergeRequests: [],
        });

        if (options.verbose) {
          console.log('Review completed successfully');
        }

        try {
          const filePath = await storageService.saveReview(review, {
            projectId: options.project,
            mergeRequestId: options.mergeRequest,
          });

          if (options.verbose) {
            console.log(
              `Review has been successfully saved in the storage system at ${filePath}`,
            );
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(`Error saving the review: ${error.message}`);
          } else {
            console.error('Error saving the review: Unknown error occurred');
          }
        }
      },
    );
}
