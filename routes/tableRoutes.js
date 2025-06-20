import express from 'express';
const router = express.Router();
import { getClassicTable, getH2HTable, getPlayerTable, updateClassicTable, updateH2HTable, updatePlayerTable } from '../controllers/tableController.js';

router.get('/classic', getClassicTable);
router.get('/h2h', getH2HTable);
router.get('/players', getPlayerTable);
router.patch('/update-classic', updateClassicTable);
router.patch('/update-h2h', updateH2HTable);
router.patch('/update-players', updatePlayerTable);

export default router;

