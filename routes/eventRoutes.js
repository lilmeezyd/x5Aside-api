import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { fetchEvents, getEvents } from '../controllers/eventController.js';

router.get('/fetch-events', fetchEvents);
router.get('/', getEvents)


export default router;