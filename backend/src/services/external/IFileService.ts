
export interface IFileService {
  uploadFile(file: Express.Multer.File, userType: string, userId: string): Promise<string>;
  uploadMultipleFiles(files: Express.Multer.File[], userType: string, userId: string): Promise<string[]>;
  deleteFile(fileKey: string): Promise<void>;
}
