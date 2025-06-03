import asyncHandler from "express-async-handler";
import Team from "../models/teamModel.js";
import TeamClassic from "../models/teamClassicModel.js";
import TeamH2H from "../models/teamH2HModel.js";

const createTeam = asyncHandler(async (req, res) => {
  const { name, playerIds } = req.body;
  if (playerIds.length !== 5) throw new Error("Must have 5 players");
  const team = await Team.create({ name, players: playerIds });
  await TeamClassic.create({ team: team._id, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0, recentResults: [] });
  await TeamH2H.create({ team: team._id, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0, recentResults: [] });
  res.json(team);
});

export { createTeam };