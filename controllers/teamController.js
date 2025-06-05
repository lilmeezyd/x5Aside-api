import asyncHandler from "express-async-handler";
import Team from "../models/teamModel.js";
import TeamClassic from "../models/teamClassicModel.js";
import TeamH2H from "../models/teamH2HModel.js";
// In server.js or a separate script
import { fetchAndStoreFPLTeams } from "../services/fetchTeams.js";

const createTeam = asyncHandler(async (req, res) => {
  const { name, playerIds } = req.body;
  const teams = fetchAndStoreFPLTeams();
  for (let team of teams) {
    await TeamClassic.create({
      team: team._id,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      recentResults: [],
    });
    await TeamH2H.create({
      team: team._id,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      recentResults: [],
    });
  }
  res.json(teams);
});

export { createTeam };
