import { ILlmProvider, ModelEnum } from '../../ai.interface';
import { Agent } from '../agent-base';
import { Inject, Injectable } from '@nestjs/common';
import {
  GitDiff,
  GitDiscussions,
  GitMergeRequest,
  LanguageCode,
} from '@/core/git/git.type';
import { ReviewOptions } from '@/app/usecases/review-merge-request';
import {
  GitReviewSchema,
  GitReviewJsonSchema,
  GitReview,
} from './git-review.schema';

@Injectable()
export class GitReviewAgent extends Agent<typeof GitReviewSchema> {
  protected schemaName = 'git_review';
  protected schemaObject = GitReviewJsonSchema;
  protected systemPrompt: string;
  protected model: ModelEnum;
  protected baseSystemPrompt = `You are a highly capable Code Reviewer.
  Your task is to analyze the given Git merge request and provide a detailed review of the code changes.
  Focus on the following aspects:
  1. Code quality (readability, maintainability, and adherence to best practices).
  2. Potential bugs or security issues.
  3. Consistency with the project's coding standards.
  4. Suggestions for improvement, if applicable.
  5. Impact on performance and scalability.
  6. Technical debt introduced or eliminated.
  7. Adherence to SOLID principles and design patterns.

  Provide a detailed review that includes:
  - A summary of the changes.
  - A list of issues found in the code.
  - Suggestions for improvement with concrete examples.
  - A detailed analysis of the changes, highlighting key modifications and their impact.
  - An optional rating of the code quality (out of 10).
  - Relevant learning resources for the developer.
  `;

  constructor(
    @Inject(ILlmProvider) protected readonly llmProvider: ILlmProvider,
  ) {
    super(llmProvider);
  }

  async review(
    mergeRequest: GitMergeRequest,
    {
      options,
      similarMergeRequests,
    }: {
      similarMergeRequests?: GitMergeRequest[];
      options?: ReviewOptions;
    } = {},
  ): Promise<GitReview> {
    if (options?.detailLevel === 'thorough') {
      this.model = ModelEnum.LARGE;
    } else if (options?.detailLevel === 'standard') {
      this.model = ModelEnum.MEDIUM;
    } else {
      this.model = ModelEnum.SMALL;
    }

    this.systemPrompt = this.getSystemPrompt(options);

    const prompt = this.buildPrompt(
      mergeRequest,
      similarMergeRequests,
      options,
    );
    return this.execute(prompt, GitReviewSchema);
  }

  private getSystemPrompt(options?: ReviewOptions): string {
    let systemPrompt = this.baseSystemPrompt;

    if (options?.projectGuidelines && options.projectGuidelines.length > 0) {
      systemPrompt += `\n\nTake into account the following project-specific code guidelines: ${options.projectGuidelines}`;
    }
    if (options?.detailLevel) {
      systemPrompt += `\n\nProvide a ${options.detailLevel} level of detail in your review.`;
    }
    if (options?.focusAreas && options.focusAreas.length > 0) {
      systemPrompt += `\n\nPay special attention to the following areas: ${options.focusAreas.join(', ')}.`;
    }

    return systemPrompt;
  }

  private buildPrompt(
    mergeRequest: GitMergeRequest,
    similarMergeRequests?: GitMergeRequest[],
    options?: ReviewOptions,
  ): string {
    const discussionsText = this.getDiscussionsPrompt(mergeRequest.discussions);
    const examplesText = this.getExemplePrompt(similarMergeRequests);

    return `
      Analyze the following Git merge request and provide a ${options?.detailLevel || 'standard'} code review.

      # Title:
      ${mergeRequest.title}

      # Changes:
      ${this.formatDiff(mergeRequest, {
        removeTests: false,
        ignorePatterns: options?.ignorePatterns,
      })}

      ${discussionsText}
      ${examplesText}

      ${this.getFocusInstructions(options)}
    `;
  }

  private getExemplePrompt(similarMergeRequests?: GitMergeRequest[]): string {
    let examplesText = '';
    if (similarMergeRequests && similarMergeRequests.length > 0) {
      examplesText = '\n# Examples of previous high-quality reviews:\n';
      similarMergeRequests.forEach((currentMergeRequest, index) => {
        examplesText += `\nExample ${index + 1}:\n`;
        examplesText += `Title: ${currentMergeRequest.title}\n`;
        examplesText += `Review: ${JSON.stringify(currentMergeRequest.review, null, 2)}\n`;
        examplesText += this.getDiscussionsPrompt(
          currentMergeRequest.discussions,
        );
      });
    }
    return examplesText;
  }

  private getDiscussionsPrompt(discussions: GitDiscussions[]): string {
    let discussionsText = '';
    if (discussions && discussions.length > 0) {
      discussionsText = '\n# Related discussions:\n';
      discussions.forEach((discussion) => {
        // discussion.notes.slice(0, 3).forEach((note) => {
        discussion.notes.forEach((note) => {
          discussionsText += `Comment on ${note.newPath}:${note.position.newLine}: ${note.body}\n`;
        });
      });
    }
    return discussionsText;
  }

  private getFocusInstructions(options?: ReviewOptions): string {
    if (options?.focusAreas && options.focusAreas.length > 0) {
      return `Focus especially on: ${options.focusAreas.join(', ')}.`;
    }
    return `Focus on:
      1. Code quality (readability, maintainability, and best practices).
      2. Potential bugs or security issues.
      3. Consistency with the project's coding standards.
      4. Suggestions for improvement, if applicable.`;
  }

  private formatDiff(
    mergeRequest: GitMergeRequest,
    options?: { removeTests?: boolean; ignorePatterns?: string[] },
  ): string {
    const filesToExclude = this.getFilesToExclude(
      mergeRequest.languageCode,
      options,
    );

    if (options?.ignorePatterns) {
      filesToExclude.push(...options.ignorePatterns);
    }

    const filteredDiffs = this.filterUnexpectedFiles(
      mergeRequest.diffs,
      filesToExclude,
    );
    let diffs = '';
    filteredDiffs.forEach((diff) => {
      diffs += `\n=== ${diff.newPath} ===\n`;
      diffs += `${diff.diff}\n`;
    });
    return diffs;
  }

  private getFilesToExclude(
    languageCode: LanguageCode,
    options?: { removeTests?: boolean },
  ): string[] {
    const files: string[] = [];

    switch (languageCode) {
      case 'ts':
        files.push('pnpm-lock', 'yarn.lock', 'package-lock.json');
        break;
      case 'js':
        files.push('package-lock.json', 'yarn.lock');
        break;
      case 'py':
        files.push('poetry.lock', 'Pipfile.lock');
        break;
    }

    if (options?.removeTests) {
      switch (languageCode) {
        case 'ts':
          files.push('.spec.ts', '.test.ts');
          break;
        case 'js':
          files.push('.spec.js', '.test.js');
          break;
        case 'py':
          files.push('test_', '_test.py');
          break;
      }
    }

    return files;
  }

  private filterUnexpectedFiles(diffs: GitDiff[], filesToExclude: string[]) {
    return diffs.filter((diff) => {
      return !filesToExclude.some((s) => diff.newPath.includes(s));
    });
  }
}
