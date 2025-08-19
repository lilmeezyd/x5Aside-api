import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadImage } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/", upload.single("image"), uploadImage);

export default router;
