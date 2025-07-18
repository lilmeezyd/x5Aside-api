import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { fetchEvents, getEvents,
       setCurrentEvent} from '../controllers/eventController.js';

router.get('/fetch-events', fetchEvents);
router.get('/', getEvents);
router.post('/set-current-event', setCurrentEvent)


export default router;