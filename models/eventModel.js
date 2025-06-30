import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  eventId: { type: Number, unique: true },
current: { type: Boolean, default: false},
finished: { type: Boolean, default: false},
});
/*const Event = mongoose.model("Event", eventSchema);*/

export default eventSchema;