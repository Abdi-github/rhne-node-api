import { v2 as cloudinary } from "cloudinary";
import { env } from "@config/env";
import { logger } from "@shared/utils/logger";

// ── Configure Cloudinary ──
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const isCloudinaryConfigured = (): boolean => {
  return !!(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
};

/**
 * Upload a file buffer to Cloudinary.
 */
export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  options: {
    folder: string;
    publicId?: string;
    resourceType?: "image" | "raw" | "auto";
    transformation?: Record<string, unknown>[];
  }
): Promise<{ url: string; publicId: string; width?: number; height?: number }> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: Record<string, unknown> = {
      folder: `rhne/${options.folder}`,
      resource_type: options.resourceType || "image",
      overwrite: true,
    };

    if (options.publicId) {
      uploadOptions.public_id = options.publicId;
    }

    if (options.transformation) {
      uploadOptions.transformation = options.transformation;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          logger.error("Cloudinary upload error:", error);
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error("No result from Cloudinary"));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete a file from Cloudinary by public ID.
 */
export const deleteFromCloudinary = async (
  publicId: string,
  resourceType: "image" | "raw" = "image"
): Promise<boolean> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result.result === "ok";
  } catch (error) {
    logger.error(`Cloudinary delete error for ${publicId}:`, error);
    return false;
  }
};

export { cloudinary };
