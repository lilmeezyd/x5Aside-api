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

// ----------- [FPL Fetch + Scheduler] -----------
/*
const fetchAndSaveFPLPoints = async () => {
  const players = await Player.find();
  for (const player of players) {
    const res = await axios.get(`https://fantasy.premierleague.com/api/entry/${player.fplId}/history/`);
    const { current } = res.data;
    for (const e of current) {
      await PlayerEventPoints.updateOne(
        { player: player._id, eventId: e.event },
        { $set: { eventPoints: e.points, eventTransfersCost: e.event_transfers_cost } },
        { upsert: true }
      );
    }
  }
};*/

//cron.schedule("0 */6 * * *", fetchAndSaveFPLPoints);
  // every 6 hours

// ----------- [Scoring & Tables] -----------
// You’ve already implemented `scoreFixture()` and table updates, so you’d add it here:
//app.post("/api/score", protect, asyncHandler(require("./scoreFixture"))); // Or paste score logic directly here

// ----------- [Table Endpoints] -----------



// Repeat for H2H and Player tables...

// ----------- [Start Server] -----------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`x5Aside API running on port ${PORT}`));
