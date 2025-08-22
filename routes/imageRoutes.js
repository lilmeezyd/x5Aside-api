import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadImage, createTOW, getTOW, deleteImage  } from "../controllers/uploadController.js";

const router = express.Router();


router.post("/", protect, createTOW);
router.get("/", getTOW);
router.patch("/event/:eventId", upload.single("file"), protect, uploadImage);
router.delete("/file/:fileId/event/:eventId", protect, deleteImage);

export default router;
