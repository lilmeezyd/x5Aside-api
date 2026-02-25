import axios from "axios";
import asyncHandler from "express-async-handler";
import { getModel } from "../config/db.js";
import eventSchema from "../models/eventModel.js";
import teamClassicSchema from "../models/teamClassicModel.js";
import teamH2HSchema from "../models/teamH2HModel.js";
import playerTableSchema from "../models/playerTableModel.js";
import formulaOneTotalSchema from "../models/formulaOneTotalModel.js";
import pointsTotalSchema from "../models/pointsTotalModel.js";

export const fetchEvents = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;

  const response = await axios.get(
    "https://fantasy.premierleague.com/api/bootstrap-static/",
  );
  const events = response.data.events;

  const Event = await getModel(dbName, "Event", eventSchema);

  const bulkOps = events.map((e) => ({
    updateOne: {
      filter: { eventId: e.id },
      update: {
        $set: {
          next: e.is_next,
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
  const Event = await getModel(dbName, "Event", eventSchema);

  const events = await Event.find({}).sort({ eventId: 1 });

  res.status(200).json(events);
});

export const setCurrentEvent = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
  const Event = await getModel(dbName, "Event", eventSchema);
  const TeamH2H = await getModel(dbName, "TeamH2H", teamH2HSchema);
  const TeamClassic = await getModel(dbName, "TeamClassic", teamClassicSchema);
  const PlayerTable = await getModel(dbName, "PlayerTable", playerTableSchema);
  const PointsTotal = await getModel(dbName, "PointsTotal", pointsTotalSchema);
  const FormulaOneTotal = await getModel(
    dbName,
    "FormulaOneTotal",
    formulaOneTotalSchema,
  );

  // Step 1: Get the current event (if any)
  const currentEvent = await Event.findOne({ current: true });

  // Stop if the current event is event 38
  if (currentEvent && currentEvent.eventId === 38) {
    return res
      .status(400)
      .json({
        message: "Event 38 is the final event. No further updates allowed.",
      });
  }

  // Step 2: End the current event if exists
  if (currentEvent) {
    await Event.updateOne(
      { eventId: currentEvent.eventId },
      { $set: { current: false, finished: true } },
    );
  }

  // Step 3: Promote the next event
  const nextEvent = await Event.findOneAndUpdate(
    { next: true },
    { $set: { current: true, next: false } },
    { new: true },
  );

  if (!nextEvent) {
    return res.status(404).json({ message: "No event with next: true found." });
  }

  // Step 4: Prepare the following event as next, unless current is event 38
  const nextEventId = nextEvent.eventId + 1;
  if (nextEventId <= 38) {
    await Event.updateOne({ eventId: nextEventId }, { $set: { next: true } });
  }

  await TeamH2H.updateMany({}, [{$set: { oldRank: "$rank"}}])
  await TeamClassic.updateMany({}, [{$set: { oldRank: "$rank"}}])
  await PlayerTable.updateMany({}, [{$set: { oldRank: "$rank"}}])
  await FormulaOneTotal.updateMany({}, [{$set: { oldRank: "$rank"}}])
  await PointsTotal.updateMany({}, [{$set: { oldRank: "$rank"}}])

  res.status(200).json({
    message: `Event ${nextEvent.eventId} is now current.`,
    currentEventId: nextEvent.eventId,
  });
});

export const resetEvents = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
  const Event = await getModel(dbName, "Event", eventSchema);

  // Step 1: Reset all events
  await Event.updateMany(
    {},
    {
      $set: {
        finished: false,
        current: false,
        next: false,
      },
    },
  );

  // Step 2: Set eventId 1 as the next event
  const updated = await Event.updateOne(
    { eventId: 1 },
    { $set: { next: true } },
  );

  if (updated.matchedCount === 0) {
    return res
      .status(404)
      .json({ message: "Event with eventId: 1 not found." });
  }

  res
    .status(200)
    .json({ message: "All events reset. Event 1 is marked as next." });
});

export const getCurrentEvent = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
  const Event = await getModel(dbName, "Event", eventSchema);

  const event = await Event.findOne({current: true});
  const { eventId } = event;

  res.status(200).json(eventId);
})
