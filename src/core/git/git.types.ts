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
    oldLine?: number;
  };
  createdAt: Date;
};

export type GitMergeRequest = {
  id: string;
  diffs: GitDiff[];
  discussions: GitDiscussions[];
};
