import mongoose from "mongoose";

const helpBodySchema = new mongoose.Schema({
  heading: { type: mongoose.Schema.ObjectId, ref: "HelpHeading", required: true },
  subheading: { type: String, required: true },
details: { type: String, required:true},
}, {
timestamps: true
});

export default helpBodySchema;