import { ILlmProvider, ModelEnum } from '../../ai.interface';
import { Agent } from '../agent-base';
import { Inject, Injectable } from '@nestjs/common';
import { GitReviewDto } from './git-review.dto';
import { GitDiff, GitMergeRequest, LanguageCode } from '@/core/git/git.type';

@Injectable()
export class GitReviewAgent extends Agent<GitReviewDto> {
  protected model = ModelEnum.SMALL;
  protected systemPrompt = `You are a highly capable Code Reviewer. 
  Your task is to analyze the given Git merge request and provide a detailed review of the code changes.
  Focus on the following aspects:
  1. Code quality (readability, maintainability, and adherence to best practices).
  2. Potential bugs or security issues.
  3. Consistency with the project's coding standards.
  4. Suggestions for improvement, if applicable.

  Provide a detailed review that includes:
  - A summary of the changes.
  - A list of issues found in the code.
  - Suggestions for improvement.
  - A detailed analysis of the changes, highlighting key modifications and their impact.
  - An optional rating of the code quality (out of 10).
  `;
  protected dto = GitReviewDto;

  constructor(
    @Inject(ILlmProvider) protected readonly llmProvider: ILlmProvider,
  ) {
    super(llmProvider);
  }

  async review(mergeRequest: GitMergeRequest) {
    const prompt = this.buildPrompt(mergeRequest);
    return this.execute(prompt);
  }

  private buildPrompt(mergeRequest: GitMergeRequest): string {
    return `
      Analyze the following Git merge request and provide a detailed code review.

      # Title:
      ${mergeRequest.title}

      # Changes:
      ${this.formatDiff(mergeRequest)}

      Focus on:
      1. Code quality (readability, maintainability, and best practices).
      2. Potential bugs or security issues.
      3. Consistency with the project's coding standards.
      4. Suggestions for improvement, if applicable.
    `;
  }

  private formatDiff(
    mergeRequest: GitMergeRequest,
    options?: { removeTests?: boolean },
  ): string {
    const filesToExclude = this.getFilesToExclude(
      mergeRequest.languageCode,
      options,
    );
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
    switch (languageCode) {
      case 'ts': {
        const files = ['pnpm-lock', 'yarn.lock'];
        if (options?.removeTests) {
          files.push('.spec.ts');
        }
        return files;
      }
      default: {
        return [];
      }
    }
  }

  private filterUnexpectedFiles(diffs: GitDiff[], filesToExclude: string[]) {
    return diffs.filter((diff) => {
      return !filesToExclude.some((s) => diff.newPath.includes(s));
    });
  }
}
