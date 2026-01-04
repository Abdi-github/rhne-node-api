import type { Request, Response } from "express";
import { asyncHandler } from "@shared/utils/async-handler";
import { sendSuccess } from "@shared/utils/api-response";
import { ApiError } from "@shared/utils/api-error";
import { uploadToCloudinary, deleteFromCloudinary, isCloudinaryConfigured } from "@config/cloudinary";
import { sanitizeFilename } from "@middleware/upload.middleware";

/**
 * Upload a single image to Cloudinary.
 * Expects multer middleware to have already parsed the file.
 */
export const uploadSingleImage = (folder: string) =>
  asyncHandler(async (req: Request, res: Response) => {
    if (!isCloudinaryConfigured()) {
      throw ApiError.internal("Image upload service is not configured");
    }

    if (!req.file) {
      throw ApiError.badRequest("No file uploaded");
    }

    const publicId = sanitizeFilename(req.file.originalname);

    const result = await uploadToCloudinary(req.file.buffer, {
      folder,
      publicId,
      transformation: [
        { quality: "auto", fetch_format: "auto" },
        { width: 1200, crop: "limit" },
      ],
    });

    sendSuccess(res, "Image uploaded successfully", {
      url: result.url,
      public_id: result.publicId,
      width: result.width,
      height: result.height,
    });
  });

/**
 * Delete an image from Cloudinary.
 */
export const deleteSingleImage = asyncHandler(async (req: Request, res: Response) => {
  if (!isCloudinaryConfigured()) {
    throw ApiError.internal("Image upload service is not configured");
  }

  const { public_id } = req.body;
  if (!public_id) {
    throw ApiError.badRequest("public_id is required");
  }

  const deleted = await deleteFromCloudinary(public_id);
  if (!deleted) {
    throw ApiError.notFound("Image");
  }

  sendSuccess(res, "Image deleted successfully", null);
});
