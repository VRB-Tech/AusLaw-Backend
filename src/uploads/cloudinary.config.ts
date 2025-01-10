import { v2 as cloudinary } from 'cloudinary';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CloudinaryConfig {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    file: Express.Multer.File | Buffer,
    isImage?: boolean,
    filename?: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const resourceType = isImage ? 'image' : 'raw';
      const folder = isImage ? 'images' : 'raw';

      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: resourceType, public_id: filename, folder },
        (err, result) => {
          if (err) {
            return reject(err);
          }

          resolve(result.secure_url);
        },
      );

      file instanceof Buffer
        ? uploadStream.end(file)
        : uploadStream.end(file.buffer);
    });
  }
}
