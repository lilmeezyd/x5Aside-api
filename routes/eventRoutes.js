import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { createEvent, scoreEventFixtures } from '../controllers/eventController.js';

router.post('/', protect, createEvent);
router.post("/score-event/:eventId", scoreEventFixtures);


export default router;