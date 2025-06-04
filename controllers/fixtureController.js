import asyncHandler from "express-async-handler";
import Fixture from "../models/fixtureModel.js";
import Team from "../models/Team.js";
import PlayerEventPoints from "../models/PlayerEventPoints.js";
import { scoreFixture } from "../services/scoreFixture.js";

const createFixture = asyncHandler(async (req, res) => {
  const { homeTeam, awayTeam, eventId } = req.body;
  const fixture = await Fixture.create({ homeTeam, awayTeam, eventId });
  res.json(fixture);
});

const scoreFixtureById = async (req, res) => {
  const { fixtureId } = req.params;

  const fixture = await Fixture.findById(fixtureId)
    .populate("homeTeam")
    .populate("awayTeam");

  if (!fixture) return res.status(404).json({ error: "Fixture not found" });

  if (!fixture.eventId)
    return res.status(400).json({ error: "Fixture has no eventId assigned" });

  // Get player points for each team
  const [homePlayers, awayPlayers] = await Promise.all([
    Team.findById(fixture.homeTeam._id).populate("players"),
    Team.findById(fixture.awayTeam._id).populate("players"),
  ]);

  const getPlayerPoints = async (players) => {
    const points = {};
    const all = await PlayerEventPoints.find({
      player: { $in: players.map((p) => p._id) },
      eventId: fixture.eventId,
    });

    for (const rec of all) {
      points[rec.player.toString()] = rec.eventPoints;
    }
    return points;
  };

  const [homePlayerPoints, awayPlayerPoints] = await Promise.all([
    getPlayerPoints(homePlayers.players),
    getPlayerPoints(awayPlayers.players),
  ]);

  await scoreFixture({
    fixture,
    homeTeam: homePlayers,
    awayTeam: awayPlayers,
    homePlayerPoints,
    awayPlayerPoints,
  });

  res.json({ message: "Fixture scored successfully." });
};

export { createFixture };
