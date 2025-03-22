import { Module } from '@nestjs/common';
import { GitModule } from '@/core/git/git.module';
import { AIModule } from '@/core/ai/ai.module';
import { FileReviewStorageService } from '@/core/storage/file-review-storage.service';

@Module({
  imports: [GitModule, AIModule],
  providers: [
    FileReviewStorageService,
    // autres services...
  ],
  exports: [FileReviewStorageService],
})
export class AppModule {} 