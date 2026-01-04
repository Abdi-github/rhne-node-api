import { Router } from "express";
import { uploadImage } from "@middleware/upload.middleware";
import { uploadSingleImage, deleteSingleImage } from "./upload.controller";

const router = Router();

// Upload a single image
router.post("/images", uploadImage.single("image"), uploadSingleImage("general"));

// Resource-specific uploads
router.post("/images/sites", uploadImage.single("image"), uploadSingleImage("sites"));
router.post("/images/services", uploadImage.single("image"), uploadSingleImage("services"));
router.post("/images/doctors", uploadImage.single("image"), uploadSingleImage("doctors"));
router.post("/images/events", uploadImage.single("image"), uploadSingleImage("events"));
router.post("/images/newborns", uploadImage.single("image"), uploadSingleImage("newborns"));

// Delete an image
router.delete("/images", deleteSingleImage);

export default router;
