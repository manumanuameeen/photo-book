import type { IFileService } from "./IFileService";
import AWS from "aws-sdk";
import { AppError } from "../../utils/AppError";
import { HttpStatus } from "../../constants/httpStatus";
import { Messages } from "../../constants/messages";

export class S3FileService implements IFileService {
    private _s3: AWS.S3;
    private _bucketName: string;

    constructor() {
     
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            console.error("❌ AWS credentials not found in environment variables");
            throw new Error("AWS credentials are not configured");
        }

        if (!process.env.BUCKET_NAME) {
            console.error("❌ S3 bucket name not found in environment variables");
            throw new Error("S3 bucket name is not configured");
        }

        this._s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION ||"ap-south-1"
        });
        this._bucketName = process.env.BUCKET_NAME;

        console.log("✅ S3 Service initialized with bucket:", this._bucketName);
    }

    private _buildKey(userType: string, userId: string, fileName: string): string {
        const date = new Date();
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const timeStamp = Date.now();

      
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        
        return `${userType}/${userId}/${yyyy}/${mm}/${dd}/${timeStamp}-${sanitizedFileName}`;
    }

    async uploadFile(file: Express.Multer.File, userType: string, userId: string): Promise<string> {
        const key = this._buildKey(userType, userId, file.originalname);
        
        console.log("Uploading file to S3:", {
            bucket: this._bucketName,
            key: key,
            size: file.size,
            mimetype: file.mimetype
        });

        const params: AWS.S3.PutObjectRequest = {
            Bucket: this._bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        try {
            const data = await this._s3.upload(params).promise();
            console.log("✅ File uploaded successfully:", data.Location);
            return data.Location;
        } catch (error: any) {

            console.error("❌ S3 upload error:", {
                message: error.message,
                code: error.code,
                statusCode: error.statusCode,
                bucket: this._bucketName,
                key: key
            });
            
            if (error.code === 'NoSuchBucket') {
                throw new AppError(`S3 bucket '${this._bucketName}' does not exist`, HttpStatus.BAD_REQUEST);
            } else if (error.code === 'InvalidAccessKeyId') {
                throw new AppError("Invalid AWS credentials", HttpStatus.BAD_REQUEST);
            } else if (error.code === 'SignatureDoesNotMatch') {
                throw new AppError("AWS credential signature mismatch", HttpStatus.BAD_REQUEST);
            } else if (error.code === 'AccessDenied') {
                throw new AppError("Access denied to S3 bucket", HttpStatus.BAD_REQUEST);
            }
            
            throw new AppError(`Image upload failed: ${error.message}`, HttpStatus.BAD_REQUEST);
        }
    }

    async uploadMultipleFiles(files: Express.Multer.File[], userType: string, userId: string): Promise<string[]> {
        console.log(`📤 Uploading ${files.length} files to S3...`);
        
        try {
            const uploadPromises = files.map((file) => this.uploadFile(file, userType, userId));
            const results = await Promise.all(uploadPromises);
            console.log(`✅ Successfully uploaded ${results.length} files`);
            return results;
        } catch (error: any) {
            console.error("❌ Multiple file upload failed:", error);
            throw error;
        }
    }

    async deleteFile(fileKey: string): Promise<void> {
        const params = {
            Bucket: this._bucketName,
            Key: fileKey,
        };

        try {
            await this._s3.deleteObject(params).promise();
            console.log("✅ File deleted successfully:", fileKey);
        } catch (error: any) {
            console.error("❌ S3 delete error:", error);
            throw new AppError(Messages.S3_DELETE_ERROR, HttpStatus.BAD_REQUEST);
        }
    }
}