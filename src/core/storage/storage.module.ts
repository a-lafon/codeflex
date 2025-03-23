import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileReviewStorageService } from '@/infra/services/file-review-storage.service';
import {
  IReviewStorageProvider,
  IMergeRequestStorageProvider,
} from './storage.interface';
import { FileMergeRequestStorageService } from '@/infra/services/file-merge-request-storage.service';

const ReviewStorageProvider = {
  provide: IReviewStorageProvider,
  useClass: FileReviewStorageService,
};

const MergeRequestStorageProvider = {
  provide: IMergeRequestStorageProvider,
  useClass: FileMergeRequestStorageService,
};

@Module({
  providers: [
    ReviewStorageProvider,
    MergeRequestStorageProvider,
    StorageService,
  ],
  exports: [ReviewStorageProvider, MergeRequestStorageProvider, StorageService],
})
export class StorageModule {}
