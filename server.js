// ----------- [Setup] -----------
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { validateDbName } from "./middleware/validateDb.js"
import { errorHandler } from "./middleware/errorMiddleware.js";
import {connectDb} from "./config/db.js";
import cookieParser from "cookie-parser";



dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
const allowedOrigins = [
  "https://x5-aside.vercel.app",
"https://661a859e-215d-4ee7-ad03-221007b9ef75-00-yr7tnm5anqkz.picard.replit.dev"
]

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);
//app.use(validateDbName);


// Root route for testing
app.get('/', (req, res) => {
  res.send('x5Aside API is running...');
});
/*if (process.env.NODE_ENV !== 'test')
{connectDb()}*/

import userRoutes from './routes/userRoutes.js';
import fixtureRoutes from './routes/fixtureRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import formulaOneRoutes from './routes/formulaOneRoutes.js';
import copyRoutes from './routes/copyRoutes.js';

app.use("/api/users", userRoutes);
app.use("/api/fixtures", validateDbName, fixtureRoutes);
app.use("/api/teams", validateDbName, teamRoutes);
app.use("/api/players", validateDbName, playerRoutes);
app.use("/api/tables", validateDbName, tableRoutes);
app.use("/api/events", validateDbName,eventRoutes);
app.use("/api/f1", validateDbName, formulaOneRoutes);
//app.use("/api/copy", copyRoutes);

app.use(errorHandler)
const PORT = parseInt(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`x5Aside API running on port ${PORT}`));

export default app
