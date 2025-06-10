import mongoose from 'mongoose';

const playerFixtureSchema = new mongoose.Schema({
  eventId: Number,
  homeTeam: { type: mongoose.Schema.Types.Number, ref: "Team" },
  awayTeam: { type: mongoose.Schema.Types.Number, ref: "Team" },
  homeScore: { type: Number,
                     default: null},
  awayScore: { type: Number,
     default: null},
  result: { type: String,
           default: null},
  isPlayed: { type: Boolean, default: false }
}, { timestamps: true });

const playerFixture = mongoose.model("playerFixture", playerFixtureSchema);

export default playerFixture;