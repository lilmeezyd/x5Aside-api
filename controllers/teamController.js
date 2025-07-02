import asyncHandler from "express-async-handler";
import teamClassicSchema from "../models/teamClassicModel.js";
import teamH2HSchema from "../models/teamH2HModel.js";
import teamSchema from "../models/teamModel.js";
import playerSchema from "../models/playerModel.js";
import fixtureSchema from "../models/fixtureModel.js";
import playerEventPointsSchema from "../models/playerPointsModel.js";
import playerFixtureSchema from "../models/playerFixtureModel.js";
import { fetchAndStoreFPLTeams } from "../services/fetchTeams.js";
import { getModel } from "../config/db.js"

const createTeam = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName || ""; 
  console.log(dbName)
  const teams = await fetchAndStoreFPLTeams(dbName);
  
  //fetchAndStoreFPLTeams();
  const TeamClassic = await getModel(dbName, "TeamClassic", teamClassicSchema);
  const TeamH2H = await getModel(dbName, "TeamH2H", teamH2HSchema);
  

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

const getTeams = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName || ""; 
  const Team = await getModel(dbName, "Team", teamSchema);
  const Player = await getModel(dbName, "Player", playerSchema);
  const teams = await Team.find({}).populate('players');
  res.json(teams);
});

const getTeamById = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName || ""; 
  const Team = await getModel(dbName, "Team", teamSchema)
  const team = await Team.findById(req.params.id);
  /*const liverpool = await Team.findOne({ name: "Liverpool" });
  const villa = await Team.findOne({ name: "Aston Villa" });
  const everton = await Team.findOne({ name: "Everton" });
  const crystal = await Team.findOne({ name: "Crystal Palace"});
  const castle = await Team.findOne({ name: "Newcastle" });

  const city = await Team.findOne({ name: "Man City"});

  const arsenal = await Team.findOne({ name: "Arsenal" });

  const fixture = await Fixture.findOne({ homeTeam: everton.id, awayTeam: liverpool.id });
 fixture.eventId = 15;
  await fixture.save();
  
  const fixture3 = await Fixture.findOne({ homeTeam: villa.id, awayTeam: liverpool.id });
  fixture3.eventId = 29;
  await fixture3.save();
  
  const fixture2 = await Fixture.findOne({ homeTeam: castle.id, awayTeam: crystal.id });
  fixture2.eventId = 29;
  await fixture2.save();

  const fixture1 = await Fixture.findOne({ homeTeam: arsenal.id, awayTeam: crystal.id });
  fixture1.eventId = 34;
  await fixture1.save();

  const fixture4 = await Fixture.findOne({ homeTeam: city.id, awayTeam: villa.id });
  fixture4.eventId = 34;
  await fixture4.save();
  

   */
  

  if (team) {
    res.json(team);
  } else {
    res.status(404);
    throw new Error("Team not found");
  }
});

const deleteAllTeams = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName || ""; 
  const Team = await getModel(dbName, "Team", teamSchema);
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  const TeamClassic = await getModel(dbName, "TeamClassic", teamClassicSchema);
  const TeamH2H = await getModel(dbName, "TeamH2H", teamH2HSchema);
  const Player = await getModel(dbName, "Player", playerSchema);
  const PlayerEventPoints = await getModel(dbName, "PlayerEventPoints", playerEventPointsSchema);
  const PlayerFixture = await getModel(dbName, "PlayerFixture", playerFixtureSchema);
  
  await Team.deleteMany({});
  await Fixture.deleteMany({});
  await TeamClassic.deleteMany({});
  await TeamH2H.deleteMany({});
  await Player.deleteMany({});
  await PlayerEventPoints.deleteMany({});
  await PlayerFixture.deleteMany({});
  res.json({ message: "All teams and associated data deleted" });
});
const deleteTeam = asyncHandler(async (req, res) => {
  const teamId = req.params.id;
  const dbName = req.query.dbName || req.body?.dbName || ""; 
  const Team = await getModel(dbName, "Team", teamSchema)
  const TeamClassic = await getModel(dbName, "TeamClassic", teamClassicSchema);
  const TeamH2H = await getModel(dbName, "TeamH2H", teamH2HSchema);
  const team = await Team.findById(teamId);

  if (team) {
    await Team.deleteOne({ _id: teamId });
    await TeamClassic.deleteOne({ team: teamId });
    await TeamH2H.deleteOne({ team: teamId });

    res.json({ message: "Team and associated data deleted" });
  } else {
    res.status(404);
    throw new Error("Team not found");
  }
});


export { createTeam, getTeams, getTeamById, deleteAllTeams, deleteTeam };
