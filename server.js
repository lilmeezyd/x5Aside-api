// ----------- [Setup] -----------
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorMiddleware.js";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import asyncHandler from "express-async-handler";
import axios from "axios";
import cron from "node-cron";
import scheduleFPLUpdates from "./jobs/fetchPlayerPoints.js";
scheduleFPLUpdates();



dotenv.config();
connectDB()

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "*",
  })
);

import userRoutes from './routes/userRoutes.js';
import fixtureRoutes from './routes/fixtureRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import tableRoutes from './routes/tableRoutes.js';

app.use("/api/users", userRoutes);
app.use("/api/fixtures", fixtureRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/tables", tableRoutes);


app.use(errorHandler)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`x5Aside API running on port ${PORT}`));
