import { Injectable } from '@nestjs/common';
import { CloudinaryConfig } from 'uploads/cloudinary.config';
import * as sharp from 'sharp';

@Injectable()
export class FileUploader {
  constructor(private readonly cloudinaryConfig: CloudinaryConfig) {}

  async uploadFiles(
    files: Express.Multer.File[] | string[],
  ): Promise<string[]> {
    let uploadedFiles: string[] = [];

    if (Array.isArray(files) && files.every((file) => file instanceof Object)) {
      uploadedFiles = await Promise.all(
        files.map((file) =>
          this.processAndUploadFile(file.buffer, file.mimetype),
        ),
      );
    } else if (
      Array.isArray(files) &&
      files.every((file) => typeof file === 'string')
    ) {
      uploadedFiles = await Promise.all(
        files.map(async (base64Data) => {
          const data = base64Data.split(',')[1];
          const format = base64Data.split(';')[0].split('/')[1];
          const buffer = Buffer.from(data, 'base64');

          return this.processAndUploadFile(buffer, format);
        }),
      );
    }

    return uploadedFiles;
  }

  private async processAndUploadFile(
    buffer: Buffer,
    format: string,
  ): Promise<string> {
    let processedBuffer;

    const isImage = [
      'image/jpeg',
      'jpeg',
      'image/webp',
      'webp',
      'image/png',
      'png',
    ].includes(format.toLowerCase());

    switch (format) {
      case 'image/jpeg':
      case 'jpeg':
      case 'jpg':
        processedBuffer = await sharp(buffer).jpeg({ quality: 80 }).toBuffer();

        break;

      case 'image/webp':
      case 'webp':
        processedBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();

        break;

      case 'image/png':
      case 'png':
        processedBuffer = await sharp(buffer)
          .png({ compressionLevel: 8 })
          .toBuffer();

        break;

      default:
        processedBuffer = buffer;

        break;
    }

    return this.cloudinaryConfig.uploadFile(processedBuffer, isImage);
  }
}
