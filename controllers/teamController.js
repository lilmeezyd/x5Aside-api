import mongoose from "mongoose";
import asyncHandler from "express-async-handler";
import teamClassicSchema from "../models/teamClassicModel.js";
import teamH2HSchema from "../models/teamH2HModel.js";
import teamSchema from "../models/teamModel.js";
import eventSchema from "../models/eventModel.js";
import playerSchema from "../models/playerModel.js";
import fixtureSchema from "../models/fixtureModel.js";
import formulaOneSchema from "../models/formulaOneModel.js";
import formulaOneTotalSchema from "../models/formulaOneTotalModel.js";
import leaderboardSchema from "../models/leaderboardModel.js";
import playerTableSchema from "../models/playerTableModel.js";
import playerEventPointsSchema from "../models/playerPointsModel.js";
import playerFixtureSchema from "../models/playerFixtureModel.js";
import pointsTotalSchema from "../models/pointsTotalModel.js";
import userSchema from "../models/userModel.js";
import proPicksSchema from "../models/proPicksModel.js";
import { fetchAndStoreFPLTeams } from "../services/fetchTeams.js";
import { fetchData } from "../services/fetchManagerData.js";
import { getModel, getModelFromConn } from "../config/db.js";
import ImageKit from "imagekit";
import { connectDb } from "../config/db.js";

const imagekit = new ImageKit({
  publicKey: "public_3mlFIPEJClyIcClD9DpRy722ej8=",
  privateKey: "private_D1PQcI+sV3dUAzhFKm+/VFpH5x4=",
  urlEndpoint: "https://ik.imagekit.io/cap10",
});

const createTeam = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
  const teams = await fetchAndStoreFPLTeams(dbName);

  //fetchAndStoreFPLTeams();
  const TeamClassic = await getModel(dbName, "TeamClassic", teamClassicSchema);
  const TeamH2H = await getModel(dbName, "TeamH2H", teamH2HSchema);
  const FormulaOneTotal = await getModel(
    dbName,
    "FormulaOneTotal",
    formulaOneTotalSchema,
  );

  if (!Array.isArray(teams)) {
    res.status(500);
    throw new Error("Failed to fetch and store FPL teams");
  }

  const classicPromises = [];
  const h2hPromises = [];
  const formulaOneTotalPromises = [];

  for (const team of teams) {
    const [classicExists, h2hExists, formulaOneExists] = await Promise.all([
      TeamClassic.exists({ team: team._id }),
      TeamH2H.exists({ team: team._id }),
      FormulaOneTotal.exists({ teamId: team._id }),
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
    if (!formulaOneExists) {
      formulaOneTotalPromises.push(
        FormulaOneTotal.create({
          teamId: team._id,
          teamName: team.name,
          totalScore: 0,
        }),
      );
    }
  }

  await Promise.all([
    ...classicPromises,
    ...h2hPromises,
    ...formulaOneTotalPromises,
  ]);

  res.status(201).json({
    message: "Teams processed",
    createdClassic: classicPromises.length,
    createdH2H: h2hPromises.length,
    totalTeams: teams.length,
    createdFormulaOneTotal: formulaOneTotalPromises.length,
  });
});

const getTeams = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
  const Team = await getModel(dbName, "Team", teamSchema);
  const Player = await getModel(dbName, "Player", playerSchema);
  const teams = await Team.find({}).sort({ _id: 1 }).populate("players");
  res.json(teams);
});

const getTeamById = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName || "";
  const Team = await getModel(dbName, "Team", teamSchema);
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  //console.log(Fixture)
  /*
  const team = await Team.findById(req.params.id);
  const liverpool = await Team.findOne({ name: "Liverpool" });
  const villa = await Team.findOne({ name: "Aston Villa" });
  const everton = await Team.findOne({ name: "Everton" });
  const crystal = await Team.findOne({ name: "Crystal Palace"});
  const castle = await Team.findOne({ name: "Newcastle" });

  const city = await Team.findOne({ name: "Man City"});

  const arsenal = await Team.findOne({ name: "Arsenal" });

  const fixture = await Fixture.findOne({ homeTeam: everton.id, awayTeam: liverpool.id });*/
  //console.log(fixture)
  /*fixture.eventId = 15;
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
  

   
  

  if (team) {
    res.json(team);
  } else {
    res.status(404);
    throw new Error("Team not found");
  }*/
});

const deleteAllTeams = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
  const Team = await getModel(dbName, "Team", teamSchema);
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  const TeamClassic = await getModel(dbName, "TeamClassic", teamClassicSchema);
  const TeamH2H = await getModel(dbName, "TeamH2H", teamH2HSchema);
  const Player = await getModel(dbName, "Player", playerSchema);
  const PlayerEventPoints = await getModel(
    dbName,
    "PlayerEventPoints",
    playerEventPointsSchema,
  );
  const PlayerFixture = await getModel(
    dbName,
    "PlayerFixture",
    playerFixtureSchema,
  );
  const FormulaOne = await getModel(dbName, "FormulaOne", formulaOneSchema);
  const FormulaOneTotal = await getModel(
    dbName,
    "FormulaOneTotal",
    formulaOneTotalSchema,
  );
  const PlayerTable = await getModel(dbName, "PlayerTable", playerTableSchema);
  const Leaderboard = await getModel(dbName, "Leaderboard", leaderboardSchema);

  await Promise.all([
    Player.deleteMany({}),
    PlayerEventPoints.deleteMany({}),
    PlayerFixture.deleteMany({}),
    PlayerTable.deleteMany({}),
    Leaderboard.deleteMany({}),
    FormulaOne.deleteMany({}),
    FormulaOneTotal.deleteMany({}),
    Team.deleteMany({}),
    Fixture.deleteMany({}),
    TeamClassic.deleteMany({}),
    TeamH2H.deleteMany({}),
  ]);

  res.json({ message: "All teams and associated data deleted" });
});

const deleteTeam = asyncHandler(async (req, res) => {
  const teamId = req.params.id;
  const dbName = req.query.dbName || req.body?.dbName || "";
  const Team = await getModel(dbName, "Team", teamSchema);
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

const getTeamTotalPoints = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
  const PointsTotal = await getModel(dbName, "PointsTotal", pointsTotalSchema);
  const totals = await PointsTotal.find({});
  res.json(totals);
});

/* Create Pro Team and add memebers */
const createProTeamAndMembers = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
  const { teamName, shortName, managerIds } = req.body;

  if (!dbName) {
    res.status(400);
    throw new Error("Database name is required");
  }

  if (!teamName || !shortName || !managerIds) {
    res.status(400);
    throw new Error("Missing required fields");
  }

  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  let ids;

  try {
    ids = JSON.parse(managerIds);
  } catch {
    res.status(400);
    throw new Error("Invalid managerIds");
  }

  const conn = await connectDb(dbName);
  const session = await conn.startSession();

  const Team = getModelFromConn(conn, "Team", teamSchema);
  const Player = getModelFromConn(conn, "Player", playerSchema);
  const TeamClassic = getModelFromConn(conn, "TeamClassic", teamClassicSchema);
  const ProPicks = getModelFromConn(conn, "ProPicks", proPicksSchema);

  // For Authentication DB, use the same MongoClient via useDb:
  const authDb = conn.useDb("Authentication");
  const User = getModelFromConn(authDb, "User", userSchema);

  /*const [Team, Player, User, TeamClassic] = await Promise.all([
    getModel(dbName, "Team", teamSchema),
    getModel(dbName, "Player", playerSchema),
    getModel("Authentication", "User", userSchema),
    getModel(dbName, "TeamClassic", teamClassicSchema),
  ]);*/

  if (req.user.hasPicks) {
    res.status(400);
    throw new Error("User has already made picks. Cannot create a new team.");
  }

  // Upload image BEFORE starting the transaction.
  const image = await imagekit.upload({
    file: req.file.buffer.toString("base64"),
    fileName: req.file.originalname,
  });

  //const session = await conn.startSession();

  try {
    session.startTransaction();

    const [team] = await Team.create(
      [
        {
          user: req.user._id,
          name: teamName,
          short_name: shortName,
          url: image.url,
          fileId: image.fileId,
          fileName: req.file.originalname,
        },
      ],
      { session },
    );

    const managers = await Promise.all(ids.map(fetchData));

    const players = managers.map((manager) => ({
      ...manager,
      isActive: true,
      team: team._id,
      communityName: team.name,
      startGW: 1,
    }));

    const createdPlayers = await Player.insertMany(players, { session });
    const picks = createdPlayers.map((x, idx) => {
      return {
        player: x._id,
        position: idx + 1,
        multiplier: idx === 0 ? 2 : idx === 5 ? 0 : 1,
        isCaptain: idx === 0 ? true : false,
        isViceCaptain: idx === 1 ? true : false,
      };
    });

    await TeamClassic.create(
      [
        {
          team: team._id,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
          recentResults: [],
        },
      ],
      { session },
    );

    const proPicks = await ProPicks.create({
      user: req.user._id,
      picks,
      eventId: 1,
    });

    /* const proPicks = Array.from({ length: 38 }, (_, index) => ({
      user: req.user._id,
      picks,
      eventId: index + 1,
    })); */

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { hasPicks: true },
      { session, new: true },
    ).select("-password");

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Pro team created successfully",
      team,
      picks: proPicks,
      players: createdPlayers,
      user: updatedUser,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    await User.findByIdAndUpdate(req.user._id, { hasPicks: false });

    // Remove uploaded image since DB transaction failed
    if (image?.fileId) {
      try {
        await imagekit.deleteFile(image.fileId);
      } catch (deleteErr) {
        console.error("Failed to delete orphaned image:", deleteErr);
      }
    }

    throw err;
  }
});

/* Get team selection */
const getPicks = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
  const ProPicks = await getModel(dbName, "ProPicks", proPicksSchema);
  const Event = await getModel(dbName, "Event", eventSchema);
  const Team = await getModel(dbName, "Team", teamSchema)
  const Player = await getModel(dbName, "Player", playerSchema);
  const nextEvent = await Event.findOne({ next: true });
  if (!nextEvent) {
    res.status(404);
    throw new Error("Next event not found");
  }
  const team = await Team.findOne({user: req.user._id})

  const proPicks = await ProPicks.findOne({
    user: req.user._id,
    eventId: nextEvent.eventId,
  }).populate("picks.player").lean();
  const newProPicks = {
      ...proPicks, teamId: team._id,
      teamName: team?.name,
      shortName: team?.short_name,
      url: team?.url
  }
  res.json(newProPicks);
});

/* Edit team */
const editPicks = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
  const { picks } = req.body;
  const Event = await getModel(dbName, "Event", eventSchema);
  const ProPicks = await getModel(dbName, "ProPicks", proPicksSchema);
  const eventId = Number(req.params.id);
  if (!eventId) {
    res.status(400);
    throw new Error("Event ID is required");
  }
  const event = await Event.findOne({ eventId: eventId });
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }
  const proPicks = await ProPicks.findOne({
    user: req.user._id,
  });

  if (!proPicks) {
    res.status(404);
    throw new Error("Picks not found");
  }

  if (proPicks.eventId !== Number(eventId)) {
    res.status(400);
    throw new Error("Invalid event.");
  }
  const currentTime = new Date();
  const { deadline } = event;
  /*if (currentTime.toISOString() >= deadline) {
    res.status(400);
    throw new Error("Deadline has passed! Cannot edit picks!");
  }*/
  proPicks.picks = picks;
  const updatedProPicks = await proPicks.save();
  /*const updatedProPicks = await ProPicks.findByIdAndUpdate(
    proPicks._id,
    { picks },
    { new: true },
  );*/
  res.json({
    message: "Picks updated successfully",
    proPicks: updatedProPicks,
    picks
  });
});

/* Get team points by user ID */
const getPicksWithPoints = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
});

export {
  createTeam,
  getTeams,
  getTeamTotalPoints,
  getTeamById,
  deleteAllTeams,
  deleteTeam,
  createProTeamAndMembers,
  getPicks,
  editPicks,
  getPicksWithPoints,
};
