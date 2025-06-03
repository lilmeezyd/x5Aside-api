import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  eventId: { type: Number, unique: true }
});
const Event = mongoose.model("Event", eventSchema);

export default Event;