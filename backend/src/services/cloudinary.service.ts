import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

interface HttpError extends Error {
  status?: number;
}

export interface UploadedImage {
  url: string;
  publicId: string;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function ensureCloudinaryConfig(): void {
  const missing = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']
    .filter((key) => !process.env[key]);

  if (missing.length > 0) {
    const error: HttpError = new Error(`Missing Cloudinary config: ${missing.join(', ')}`);
    error.status = 500;
    throw error;
  }
}

export function uploadImage(fileBuffer: Buffer, originalName: string): Promise<UploadedImage> {
  ensureCloudinaryConfig();

  const folder = process.env.CLOUDINARY_FOLDER || 'pag-hgw';
  const fileStem = originalName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').toLowerCase();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: `${Date.now()}-${fileStem}`,
        resource_type: 'image',
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result) {
          reject(new Error('Cloudinary did not return an upload result.'));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    Readable.from(fileBuffer).pipe(stream);
  });
}

export async function deleteImage(publicId: string | null | undefined): Promise<void> {
  if (!publicId) {
    return;
  }

  ensureCloudinaryConfig();
  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
}
