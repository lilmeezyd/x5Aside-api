import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  fileId: { type: String, required: true }, // from ImageKit
  name: { type: String },
  eventId: { type: Number }
}, { timestamps: true });

export default mongoose.model("Image", imageSchema);
