import { IFileService } from "../../interfaces/services/IFileService.ts";
import cloudinary from "../../config/cloudinary.ts";
import { AppError } from "../../utils/AppError.ts";
import { HttpStatus } from "../../constants/httpStatus.ts";
import { Messages } from "../../constants/messages.ts";

export class CloudinaryService implements IFileService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((res, rej) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "photobook_portfolio",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.log("Cloudinary upload Error", error);
            return rej(new AppError(Messages.IMAGE_UPLOAD_FAILED, HttpStatus.BAD_REQUEST));
          }

          if (!result) {
            return rej(
              new AppError(
                Messages.IMAGE_UPLOAD_RETURNED_NO_RESULT,
                HttpStatus.INTERNAL_SERVER_ERROR,
              ),
            );
          }
          res(result.secure_url);
        },
      );
      uploadStream.end(file.buffer);
    });
  }

  async uploadMultipleFiles(files: Express.Multer.File[]): Promise<string[]> {
    try {
      const uploadPromise = files.map((file) => this.uploadFile(file));
      return await Promise.all(uploadPromise);
    } catch (error) {
      throw new AppError(Messages.IMAGE_UPLOAD_FAILED + error, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteFile(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error(Messages.CLOUDINARY_DELETE_ERROR, error);
    }
  }
}
