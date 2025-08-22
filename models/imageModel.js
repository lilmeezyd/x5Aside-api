import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: { type: String, default:"" },
  fileId: { type: String, default: "" },
  name: { type: String, default: "" },
  eventId: { type: Number, unique: true }
}, { timestamps: true });

export default imageSchema;
