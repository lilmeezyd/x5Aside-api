import asyncHandler from 'express-async-handler'
import Event from '../models/eventModel.js'

const createEvent =  asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  const event = await Event.create({ eventId });
  res.json(event);
});

export default { createEvent }