import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { fetchEvents, getEvents,
       setCurrentEvent, resetEvents} from '../controllers/eventController.js';
import { cronAuth } from '../middleware/cronMiddleware.js'

router.get('/fetch-events', fetchEvents);
router.get('/', getEvents);
router.patch('/set-current-event', setCurrentEvent);
router.patch('/reset', resetEvents);

 router.patch('/set-current-event-cron', cronAuth, setCurrentEvent);

export default router;