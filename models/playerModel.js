import mongoose from "mongoose";

const oneDecimal = v => {
  if (v === null || v === undefined) return v;
  return Number(v.toFixed(1));
};

const playerSchema = new mongoose.Schema(
  {
    xHandle: String,
    fplId: { type: Number, unique: true }, 
    position: { 
      type: String, 
      enum: ["Captain", "Ace", "Forward", "Midfielder", "Defender"] 
    },
    teamName: String,
    manager: String,
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    startGW: { type: Number, default: 1},
    endGW: { type: Number, default: 38},
    isActive: { type: Boolean, default: true},
    startPrice: { 
      type: Number, 
      default: 0,
      set: oneDecimal,
      get: oneDecimal
    },
    delta: {
      type: Number,
      default: 0,
      set: oneDecimal,
      get: oneDecimal
    },
    currentPrice: { 
      type: Number, 
      default: 0,
      set: oneDecimal,
      get: oneDecimal
    }
  },
  { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
  },
);

export default playerSchema;
