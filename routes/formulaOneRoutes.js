import express from 'express';
import {
  calculateF1perGW,
  getF1Standings,
  getF1ByEvent,
} from '../controllers/fOneController.js';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();

router.post('/calculate', protect, calculateF1perGW);
router.get('/standings', getF1Standings);
router.get('/event/:eventId', getF1ByEvent);

export default router;
