import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { createHeading, getHelp,
       createBody, editHeading, editBody, deleteBody, deleteHeading } from '../controllers/helpController.js';

router.get('/', getHelp)
router.post('/heading', protect, createHeading);
router.post('/body', protect, createBody);
router.patch('/heading/:id', protect, editHeading);
router.patch('/body/:id', protect, editBody)
router.delete('/heading/:id', protect, deleteHeading);
router.delete('/body/:id', protect, deleteBody)

export default router;