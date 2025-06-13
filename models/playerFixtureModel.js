import mongoose from "mongoose";

const playerFixtureSchema = new mongoose.Schema(
                   {
                                      eventId: Number,
                                      homeTeam: {
                                                         type: mongoose.Schema
                                                                            .Types
                                                                            .Number,
                                                         ref: "Team",
                                      },
                                      awayTeam: {
                                                         type: mongoose.Schema
                                                                            .Types
                                                                            .Number,
                                                         ref: "Team",
                                      },
                                      homePlayer: {
                                                         type: mongoose.Schema
                                                                            .Types
                                                                            .ObjectId,
                                                         ref: "Player",
                                      },
                                      awayPlayer: {
                                                         type: mongoose.Schema
                                                                            .Types
                                                                            .ObjectId,
                                                         ref: "Player",
                                      },
                                      homeScore: {
                                                         type: Number,
                                                         default: null,
                                      },
                                      awayScore: {
                                                         type: Number,
                                                         default: null,
                                      },
                                      position: { type: String, enum: ["Captain", "Ace", "Fwd", "Mid", "Def"] },
                                      homeResult: { },
                                      awayResult: { },
                                      isPlayed: {
                                                         type: Boolean,
                                                         default: false,
                                      },
                   },
                   { timestamps: true },
);

const playerFixture = mongoose.model("PlayerFixture", playerFixtureSchema);

export default playerFixture;
