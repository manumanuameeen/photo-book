import type { IFileService } from "./IFileService";
import AWS from "aws-sdk";

import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/httpStatus";
import { Messages } from "../../constants/messages"

export class S3FileService implements IFileService {
    private _s3: AWS.S3;
    private _bucketName: string;

    constructor() {
        this._s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION,
        });
        this._bucketName = process.env.BUCKET_NAME || ""
    }

    private _buildKey(userType: string, userId: string, fileName: string): string {
        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const timeStamp = Date.now();

        return `${userType}/${userId}/${yyyy}/${mm}/${dd}/${timeStamp}-${fileName}`;
    }


    async uploadFile(file: Express.Multer.File, userType: string, userId: string): Promise<string> {
        const key = this._buildKey(userType, userId, file.originalname);
        const params = {
            Bucket: this._bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: "public-read",
        };

        try {
            const data = await this._s3.upload(params).promise()
            return data.Location;
        } catch (error) {
            console.error("s3 upload Error", error)
            throw new AppError(Messages.IMAGE_UPLOAD_FAILED, HttpStatus.BAD_REQUEST)
        }
    }


    async uploadMultipleFiles(files: Express.Multer.File[], userType: string, userId: string): Promise<string[]> {
        const uploadPromise = files.map((file) => this.uploadFile(file, userType, userId));
        return Promise.all(uploadPromise);
    }

    async deleteFile(fileKey: string): Promise<void> {

        const params = {
            Bucket: this._bucketName,
            Key: fileKey,
        };

        try {
            await this._s3.deleteObject(params).promise()
        } catch (error) {
            console.error(Messages.S3_DELETE_ERROR, error)
            throw new AppError(Messages.S3_DELETE_ERROR, HttpStatus.BAD_REQUEST)
        }

    }
}