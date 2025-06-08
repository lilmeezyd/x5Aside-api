import asyncHandler from "express-async-handler";
import Fixture from "../models/fixtureModel.js";
import Team from "../models/teamModel.js";
import PlayerEventPoints from "../models/playerPointsModel.js";
import scoreFixtures from "../services/scoreFixtures.js";
import { fetchFixtures } from "../services/fetchFixtures.js";

const createFixtures = asyncHandler(async (req, res) => {
  const fixtures = await fetchFixtures();
  res.json({ fixtures: fixtures.length });
});

const getFixtures = asyncHandler(async (req, res) => {
  const fixtures = await Fixture.find({}).lean();
  // Get all teams once and map by FPL team ID
  const teams = await Team.find({}).lean();
  const teamMap = {};
  for (const team of teams) {
    teamMap[team.id] = team.name; // Map FPL ID -> Team Name
  }

  // Replace homeTeam and awayTeam with names
  const enrichedFixtures = fixtures.map((fixture) => ({
    ...fixture,
    homeTeam: teamMap[fixture.homeTeam] || fixture.homeTeam,
    awayTeam: teamMap[fixture.awayTeam] || fixture.awayTeam,
  }));

  res.json(enrichedFixtures);
});

const getFixtureById = asyncHandler(async (req, res) => {
  const fixture = await Fixture.findById(req.params.id);

  if (fixture) {
    // Get all teams once and map by FPL team ID
    const teams = await Team.find({}).lean();
    const teamMap = {};
    for (const team of teams) {
      teamMap[team.id] = team.name; // Map FPL ID -> Team Name
    }

    // Replace homeTeam and awayTeam with names
    const enrichedFixtures = fixtures.map((fixture) => ({
      ...fixture,
      homeTeam: teamMap[fixture.homeTeam] || fixture.homeTeam,
      awayTeam: teamMap[fixture.awayTeam] || fixture.awayTeam,
    }));

    res.json(enrichedFixtures);
  } else {
    res.status(404);
    throw new Error("Fixture not found");
  }
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

  await scoreFixtures({
    fixture,
    homeTeam: homePlayers,
    awayTeam: awayPlayers,
    homePlayerPoints,
    awayPlayerPoints,
  });

  res.json({ message: "Fixture scored successfully." });
};

const deleteAllFixtures = asyncHandler(async (req, res) => {
  await Fixture.deleteMany({});
  res.json({ message: "All fixtures deleted successfully" });
});



export { createFixtures, getFixtures, getFixtureById, scoreFixtureById, deleteAllFixtures };
