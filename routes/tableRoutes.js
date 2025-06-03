import express from 'express';
const router = express.Router();
import { getClassicTable, getH2HTable, getPlayerTable } from '../controllers/tableController.js';

router.get('/classic', getClassicTable);
router.get('/h2h', getH2HTable);
router.get('/players', getPlayerTable);

export default router;

