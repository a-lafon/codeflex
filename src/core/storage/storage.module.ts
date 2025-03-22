import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { FileReviewStorageService } from '@/infra/services/file-review-storage.service';
import { IReviewStorageProvider } from './storage.interface';

const ReviewStorageProvider = {
  provide: IReviewStorageProvider,
  useClass: FileReviewStorageService,
};

@Module({
  providers: [ReviewStorageProvider, StorageService],
  exports: [ReviewStorageProvider, StorageService],
})
export class StorageModule {}
