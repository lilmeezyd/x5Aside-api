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
app.use(
  cors({
    origin: "*",
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

app.use("/api/users", userRoutes);
app.use("/api/fixtures", fixtureRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/f1", formulaOneRoutes);

app.use(errorHandler)
const PORT = parseInt(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`x5Aside API running on port ${PORT}`));

export default app
