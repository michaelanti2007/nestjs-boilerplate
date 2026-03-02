export type StorageUploadInput = {
  key: string;
  buffer: Buffer;
  contentType: string;
  metadata?: Record<string, string>;
};

export type StorageUploadResult = {
  key: string;
  checksum: string;
  size: number;
};
