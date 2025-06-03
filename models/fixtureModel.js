import mongoose from 'mongoose';

const fixtureSchema = new mongoose.Schema({
  eventId: Number,
  homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  homeScoreClassic: Number,
  awayScoreClassic: Number,
  homeScoreH2H: Number,
  awayScoreH2H: Number,
  resultClassic: String,
  resultH2H: String
});

const Fixture = mongoose.model("Fixture", fixtureSchema);

export default Fixture;