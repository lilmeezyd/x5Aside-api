import express from 'express';
import {
  calculateF1perGW,
  getF1Standings,
  getF1ByEvent,
} from '../controllers/fOneController.js';

const router = express.Router();

router.post('/calculate', calculateF1perGW);
router.get('/standings', getF1Standings);
router.get('/event/:eventId', getF1ByEvent);

export default router;
