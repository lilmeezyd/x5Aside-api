import mongoose from 'mongoose';

const formulaOneSchema = new mongoose.Schema(
  {
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true, index: true },
    teamName: { type: String, required: true },
    eventId: { type: Number, required: true, index: true },
    totalPoints: { type: Number, required: true },
    score: { type: Number, required: true },
  },
  { timestamps: true }
);

export default formulaOneSchema;
