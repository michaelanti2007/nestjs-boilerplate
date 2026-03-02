import { StorageUploadInput, StorageUploadResult } from './storage.types';

export interface IStorageDriver {
  upload(input: StorageUploadInput): Promise<StorageUploadResult>;
  delete(key: string): Promise<void>;
  getSignedUrl(key: string, expiresInSeconds?: number): Promise<string>;
  getFileBuffer(key: string): Promise<Buffer>;
}


