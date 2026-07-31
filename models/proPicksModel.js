import mongoose from "mongoose";

const pickSchema = new mongoose.Schema(
  {
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
    multiplier: {
      type: Number,
      default: 1,
    },
    isCaptain: {
      type: Boolean,
      default: false,
    },
    isViceCaptain: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const proPicksSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    picks: {
      type: [pickSchema],
      required: true,
    },
    eventId: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

proPicksSchema.index(
  { user: 1, eventId: 1 },
  { unique: true }
);

export default proPicksSchema;