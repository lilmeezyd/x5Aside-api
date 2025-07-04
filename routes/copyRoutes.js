// routes/copyRoutes.js
import express from 'express';
import { copyCoreData } from '../controllers/copyDBController.js';

const router = express.Router();

router.get('/', copyCoreData);

export default router;
