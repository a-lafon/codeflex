/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { DiscussionSchema, Gitlab } from '@gitbeaker/rest';
import { IGitClient } from './git.interface';
import { GitMergeRequest } from './git.types';
import { Injectable } from '@nestjs/common';

const client = new Gitlab({
  host: process.env.GITLAB_HOST,
  token: process.env.GITLAB_TOKEN,
});

@Injectable()
export class GitlabClient implements IGitClient {
  getMergeRequests(
    projectId: string,
    options?: { lastDate?: Date },
  ): Promise<GitMergeRequest[]> {
    throw new Error('Method not implemented.');
  }

  async getMergeRequest(
    projectId: string,
    mergeRequestId: string,
  ): Promise<GitMergeRequest> {
    const mergeRequestIdNumber = parseInt(mergeRequestId, 10);
    const [diffs, discussions] = await Promise.all([
      client.MergeRequests.allDiffs(projectId, mergeRequestIdNumber),
      client.MergeRequestDiscussions.all(projectId, mergeRequestIdNumber),
    ]);

    const userDiscussions = this.filterUserDiscussions(discussions);
    return {
      id: mergeRequestId,
      discussions: userDiscussions.map((discussion) => ({
        id: discussion.id,
        notes:
          discussion.notes?.map((note: any) => ({
            id: note.id.toString(),
            body: note.body,
            newPath: note.position?.new_path,
            oldPath: note.position?.old_path,
            position: {
              newLine: note.position?.new_line ?? 0,
              oldLine: note.position?.old_line,
            },
            createdAt: new Date(note.created_at),
          })) ?? [],
      })),
      diffs: diffs.map((d) => ({
        diff: d.diff,
        deletedFile: d.deleted_file,
        newFile: d.new_file,
        newPath: d.new_path,
        oldPath: d.old_path,
      })),
    };
  }

  private filterUserDiscussions(
    discussions: DiscussionSchema[],
  ): DiscussionSchema[] {
    return discussions.reduce((acc: DiscussionSchema[], discussion) => {
      const userNotes = discussion.notes?.filter((note) => !note.system);

      if (userNotes?.length && userNotes.length > 0) {
        acc.push({
          ...discussion,
          notes: userNotes,
        });
      }

      return acc;
    }, []);
  }
}
