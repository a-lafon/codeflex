import { GitReview } from '../ai/agents/git-review/git-review.schema';

export type LanguageCode = 'ts' | 'js' | 'go' | 'py';

export type GitDiff = {
  diff: string;
  newPath: string;
  oldPath: string;
  newFile: boolean;
  deletedFile: boolean;
};

export type GitDiscussions = {
  id: string;
  notes: GitNote[];
};

export type GitNote = {
  id: string;
  newPath: string;
  oldPath: string;
  body: string;
  position: {
    newLine: number;
    oldLine?: number | null;
  };
  createdAt: Date;
};

export type GitMergeRequest = {
  projectId: string;
  id: string;
  title: string;
  diffs: GitDiff[];
  discussions: GitDiscussions[];
  jiraId?: string;
  languageCode: LanguageCode;
  review?: GitReview;
};
