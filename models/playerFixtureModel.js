import mongoose from "mongoose";

const playerFixtureSchema = new mongoose.Schema(
                   {                   eventId: Number,                   homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team",},
awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team",},
homePlayer: { type: mongoose.Schema.Types.ObjectId, ref: "Player",
},
awayPlayer: { type: mongoose.Schema.Types.ObjectId,
ref: "Player",
},
homeScore: { type: Number,default: null,},
awayScore: { type: Number,default: null,
},
position: { type: String, enum: [
"Captain", "Ace", "Forward", "Midfielder", "Defender", ],                           },
homeResult: {},
awayResult: {},
isPlayed: {
 type: Boolean,
 default: false,                      },
 },
{ timestamps: true },
);
playerFixtureSchema.index(
  { eventId: 1, homePlayer: 1, awayPlayer: 1, position: 1 },
  { unique: true }
);
/*
const playerFixture = mongoose.model("PlayerFixture", playerFixtureSchema);*/


export default playerFixtureSchema;
