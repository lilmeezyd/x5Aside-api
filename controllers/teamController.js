import asyncHandler from "express-async-handler";
import TeamClassic from "../models/teamClassicModel.js";
import TeamH2H from "../models/teamH2HModel.js";
import Team from "../models/teamModel.js";
import { fetchAndStoreFPLTeams } from "../services/fetchTeams.js";

const createTeam = asyncHandler(async (req, res) => {
  const teams = await fetchAndStoreFPLTeams();
  //fetchAndStoreFPLTeams();

  if (!Array.isArray(teams)) {
    res.status(500);
    throw new Error("Failed to fetch and store FPL teams");
  }

  const classicPromises = [];
  const h2hPromises = [];

  for (const team of teams) {
    const [classicExists, h2hExists] = await Promise.all([
      TeamClassic.exists({ team: team._id }),
      TeamH2H.exists({ team: team._id }),
    ]);

    if (!classicExists) {
      classicPromises.push(
        TeamClassic.create({
          team: team._id,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
          recentResults: [],
        }),
      );
    }

    if (!h2hExists) {
      h2hPromises.push(
        TeamH2H.create({
          team: team._id,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
          recentResults: [],
        }),
      );
    }
  }

  await Promise.all([...classicPromises, ...h2hPromises]);

  res.status(201).json({
    message: "Teams processed",
    createdClassic: classicPromises.length,
    createdH2H: h2hPromises.length,
    totalTeams: teams.length,
  });
});

const getTeams = 
asyncHandler(async (req, res) => {
  const teams = await
  Team.find({});
  res.json(teams);
});

const getTeamById = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (team) {
    res.json(team);
  } else {
    res.status(404);
    throw new Error("Team not found");
  }
});

export { createTeam, getTeams, getTeamById };
