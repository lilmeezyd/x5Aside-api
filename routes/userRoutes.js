import express from "express";
const router = express.Router();
import {login, register, logout, getProfile} from '../controllers/userController.js';

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", getProfile);

export default router;