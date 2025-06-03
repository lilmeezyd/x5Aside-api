import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { createEvent } from '../controllers/eventController.js';

router.post('/', protect, createEvent);

export default router;