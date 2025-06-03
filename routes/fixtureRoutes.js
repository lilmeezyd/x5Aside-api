import express from 'express';
const router = express.Router();
import { createFixture } from '../controllers/fixtureController.js';
import { protect } from '../middleware/authMiddleware.js';

router.post('/', protect, createFixture);

export default router;