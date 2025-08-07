import mongoose from "mongoose";

const helpHeadingSchema = new mongoose.Schema({
  title: { type: String, required: true },
}, {
  timestamps: true
});

export default helpHeadingSchema;