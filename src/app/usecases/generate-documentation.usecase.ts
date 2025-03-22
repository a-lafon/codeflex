import { GitService } from '@/core/git/git.service';
import {
  GitDocumentationAgent,
  DocumentationOptions,
} from '@/core/ai/agents/git-documentation/git-documentation.agent';
import { GitDocumentation } from '@/core/ai/agents/git-documentation/git-documentation.schema';

export class GenerateDocumentationUseCase {
  constructor(
    private readonly gitDocumentationAgent: GitDocumentationAgent,
    private readonly gitService: GitService,
  ) {}

  async exec(
    mergeRequestId: string,
    projectId: string,
    options?: DocumentationOptions,
  ): Promise<{ markdown: string; structuredData: GitDocumentation }> {
    const mergeRequest = await this.gitService.fetchMergeRequest(
      projectId,
      mergeRequestId,
    );

    if (!mergeRequest) {
      throw new Error(
        `Failed to fetch merge request ${mergeRequestId} for project ${projectId}`,
      );
    }

    const documentation =
      await this.gitDocumentationAgent.generateDocumentation(
        mergeRequest,
        options,
      );

    const markdown = this.gitDocumentationAgent.toMarkdown(documentation);

    return {
      markdown,
      structuredData: documentation,
    };
  }
}
