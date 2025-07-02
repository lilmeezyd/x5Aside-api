import asyncHandler from 'express-async-handler'
import eventSchema from '../models/eventModel.js'


const createEvent =  asyncHandler(async (req, res) => {
  const { eventId } = req.body;
const dbName = req.query.dbName || req.body?.dbName || "";
  const Event = await getModel (dbName, "Event", eventSchema);
  const event = await Event.create({ eventId });
  res.json(event);
});



export default { createEvent }