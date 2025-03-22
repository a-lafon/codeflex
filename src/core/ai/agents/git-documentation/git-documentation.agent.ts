import { Inject, Injectable } from '@nestjs/common';
import { Agent } from '../agent-base';
import { ILlmProvider, ModelEnum } from '../../ai.interface';
import { GitMergeRequest } from '@/core/git/git.type';
import {
  GitDocumentationSchema,
  GitDocumentation,
  GitDocumentationJsonSchema,
} from './git-documentation.schema';

export type DocumentationOptions = {
  includeApis?: boolean;
  includeCodeExamples?: boolean;
  includeDesignPatterns?: boolean;
  focusAreas?: string[];
  detailLevel?: 'basic' | 'standard' | 'thorough';
};

@Injectable()
export class GitDocumentationAgent extends Agent<
  typeof GitDocumentationSchema
> {
  protected schemaName = 'git_documentation';
  protected schemaObject = GitDocumentationJsonSchema;
  protected systemPrompt: string;
  protected model: ModelEnum = ModelEnum.LARGE;

  constructor(
    @Inject(ILlmProvider) protected readonly llmProvider: ILlmProvider,
  ) {
    super(llmProvider);
    this.systemPrompt = `You are an expert software documentation generator.
    Your task is to generate comprehensive Markdown documentation from git merge requests.
    Focus on creating clear, well-structured documentation that explains:
    
    1. What the changes are
    2. Why they were made
    3. How they work
    4. Technical details (languages, frameworks, etc.)
    5. API endpoints if applicable
    6. Example usage where relevant
    
    Organize the documentation into logical sections with clear headings.
    Be precise, technically accurate, and ensure the documentation is useful for developers.`;
  }

  async generateDocumentation(
    mergeRequest: GitMergeRequest,
    options?: DocumentationOptions,
  ): Promise<GitDocumentation> {
    const prompt = this.buildPrompt(mergeRequest, options);
    return this.execute(prompt, GitDocumentationSchema);
  }

  private buildPrompt(
    mergeRequest: GitMergeRequest,
    options?: DocumentationOptions,
  ): string {
    return `
      Generate comprehensive documentation for the following merge request with ${options?.detailLevel || 'standard'} detail level.
      
      # Title:
      ${mergeRequest.title}
      
      # Description:
      No description provided
      
      # Changes:
      ${this.formatDiff(mergeRequest)}
      
      ${this.getFocusInstructions(options)}
      
      Make sure to include:
      ${options?.includeApis ? '- Detailed API documentation for any endpoints affected or created' : ''}
      ${options?.includeCodeExamples ? '- Code examples showing how to use the new features or changes' : ''}
      ${options?.includeDesignPatterns ? '- Design patterns used or implemented in the code' : ''}
    `;
  }

  private formatDiff(mergeRequest: GitMergeRequest): string {
    // Logic to format the diff data in a readable way
    let formattedDiff = '';

    if (mergeRequest.diffs && mergeRequest.diffs.length > 0) {
      mergeRequest.diffs.forEach((diff) => {
        formattedDiff += `## File: ${diff.newPath || diff.oldPath}\n`;
        formattedDiff += `${diff.diff}\n\n`;
      });
    }

    return formattedDiff;
  }

  private getFocusInstructions(options?: DocumentationOptions): string {
    if (!options?.focusAreas || options.focusAreas.length === 0) {
      return '';
    }

    return `
      Focus especially on the following areas in your documentation:
      ${options.focusAreas.map((area) => `- ${area}`).join('\n')}
    `;
  }

  public toMarkdown(documentation: GitDocumentation): string {
    let markdown = `# ${documentation.title}\n\n`;
    markdown += `${documentation.description}\n\n`;
    markdown += `## Summary\n\n${documentation.summary}\n\n`;

    const sortedSections = [...documentation.sections].sort(
      (a, b) => a.order - b.order,
    );
    sortedSections.forEach((section) => {
      markdown += `## ${section.title}\n\n${section.content}\n\n`;
    });

    markdown += `## Technical Details\n\n`;
    markdown += `### Languages\n\n`;
    documentation.technicalDetails.languages.forEach((lang) => {
      markdown += `- ${lang}\n`;
    });

    markdown += `\n### Frameworks\n\n`;
    documentation.technicalDetails.frameworks.forEach((framework) => {
      markdown += `- ${framework}\n`;
    });

    markdown += `\n### Libraries\n\n`;
    documentation.technicalDetails.libraries.forEach((library) => {
      markdown += `- ${library}\n`;
    });

    if (
      documentation.technicalDetails.designPatterns &&
      documentation.technicalDetails.designPatterns.length > 0
    ) {
      markdown += `\n### Design Patterns\n\n`;
      documentation.technicalDetails.designPatterns.forEach((pattern) => {
        markdown += `- ${pattern}\n`;
      });
    }

    if (documentation.apis && documentation.apis.length > 0) {
      markdown += `\n## API Reference\n\n`;
      documentation.apis.forEach((api) => {
        markdown += `### ${api.name}\n\n`;
        markdown += `${api.description}\n\n`;

        if (api.endpoint) {
          markdown += `**Endpoint:** \`${api.endpoint}\`\n\n`;
        }

        if (api.method) {
          markdown += `**Method:** \`${api.method}\`\n\n`;
        }

        if (api.parameters && api.parameters.length > 0) {
          markdown += `**Parameters:**\n\n`;
          markdown += `| Name | Type | Required | Description |\n`;
          markdown += `| ---- | ---- | -------- | ----------- |\n`;

          api.parameters.forEach((param) => {
            markdown += `| ${param.name} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description} |\n`;
          });

          markdown += `\n`;
        }
      });
    }

    if (documentation.codeExamples && documentation.codeExamples.length > 0) {
      markdown += `\n## Code Examples\n\n`;
      documentation.codeExamples.forEach((example) => {
        markdown += `### ${example.title}\n\n`;
        markdown += `\`\`\`${example.language}\n${example.code}\n\`\`\`\n\n`;
      });
    }

    return markdown;
  }
}
