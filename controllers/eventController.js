import axios from 'axios';
import asyncHandler from 'express-async-handler';
import { getModel } from '../config/db.js';
import eventSchema from '../models/eventModel.js';

export const fetchEvents = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;

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
  const dbName = req.query.dbName || req.body?.dbName;
  const Event = await getModel(dbName, 'Event', eventSchema);

  const events = await Event.find({}).sort({ eventId: 1 });

  res.status(200).json(events);
});


export const setCurrentEvent = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
  const Event = await getModel(dbName, 'Event', eventSchema);

  // Step 1: Atomically find and finish the current event
  const currentEvent = await Event.findOneAndUpdate(
    { current: true },
    { $set: { current: false, finished: true } },
    { new: true }
  );

  if (!currentEvent) {
    // No current event found — set eventId 1 as fallback (first-time init)
    const result = await Event.updateOne(
      { eventId: 1 },
      { $set: { current: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "No event found to initialize at eventId 1." });
    }

    return res.json({ message: "No current event found. Defaulted to GW 1." });
  }

  // Step 2: Advance to the next event
  const nextEventId = currentEvent.eventId + 1;
  const nextEvent = await Event.findOneAndUpdate(
    { eventId: nextEventId },
    { $set: { current: true } },
    { new: true }
  );

  if (!nextEvent) {
    return res.status(404).json({ message: `GW ${nextEventId} not found.` });
  }

  res.json({ message: `Advanced to GW ${nextEventId}` });
});
