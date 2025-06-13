import mongoose from 'mongoose';

const fixtureSchema = new mongoose.Schema({
  eventId: Number,
  homeTeam: { type: mongoose.Schema.Types.Number, ref: "Team" },
  awayTeam: { type: mongoose.Schema.Types.Number, ref: "Team" },
  homeScoreClassic: { type: Number,
                     default: null},
   homeStats: [],
   awayStats: [],
   homeStatsH2H: [],
   awayStatsH2H: [],
   homeTotal: { type: Number, default: null},
   awayTotal: { type: Number, default: null},
  awayScoreClassic: { type: Number,
     default: null},
  homeScoreH2H: { type: Number,
     default: null},
  awayScoreH2H: { type: Number,
     default: null},
  homeResultClassic: { },
   awayResultClassic: { },
  homeResultH2H: { },
   awayResultH2H: { },
  isPlayed: { type: Boolean, default: false }
}, { timestamps: true });

const Fixture = mongoose.model("Fixture", fixtureSchema);

export default Fixture;