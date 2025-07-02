import axios from 'axios';
import asyncHandler from 'express-async-handler';
import { getModel } from '../config/db.js';
import eventSchema from '../models/eventModel.js';

export const fetchEvents = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName || "";

  const response = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/');
  const events = response.data.events;

  const Event = await  getModel(dbName, 'Event', eventSchema);

  const bulkOps = events.map(e => ({
    updateOne: {
      filter: { eventId: e.id },
      update: {
        $set: {
          current: e.is_current,
          finished: e.finished,
          deadline: e.deadline_time,
        },
      },
      upsert: true,
    },
  }));

  await Event.bulkWrite(bulkOps);

  res.status(200).json({ message: `Events synced for DB: ${dbName}` });
});

export const getEvents = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName || "";
  const Event = await getModel(dbName, 'Event', eventSchema);

  const events = await Event.find({}).sort({ eventId: 1 });

  res.status(200).json(events);
});

