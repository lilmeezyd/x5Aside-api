import asyncHandler from "express-async-handler";
import teamSchema from "../models/teamModel.js";
import teamClassicSchema from "../models/teamClassicModel.js";
import teamH2HSchema from "../models/teamH2HModel.js";
import playerTableSchema from "../models/playerTableModel.js";
import playerFixtureSchema from "../models/playerFixtureModel.js";
import fixtureSchema from "../models/fixtureModel.js";
import playerSchema from "../models/playerModel.js";
import { getModel } from "../config/db.js";

const getClassicTable = asyncHandler(async (req, res) => {
  const eventId = parseInt(req.query.eventId);
  const dbName = req.query.dbName || req.body?.dbName || ""; 
  const TeamClassic = await getModel(dbName, "TeamClassic", teamClassicSchema);
  const Team = await getModel(dbName, "Team", teamSchema);
  
  const table = await TeamClassic.find().populate("team").lean();
  const sorted = table.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - a.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;

    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

    return a.team.id - b.team.id;
  });
  res.json(sorted);
});

const getH2HTable = asyncHandler(async (req, res) => {
  const eventId = parseInt(req.query.eventId);
  const dbName = req.query.dbName || req.body?.dbName || "";
  const TeamH2H = await getModel(dbName, "TeamH2H", teamH2HSchema);
  const Team = await getModel(dbName, "Team", teamSchema);
  
  const table = await TeamH2H.find().populate("team").lean();
  const sorted = table.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - a.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;

    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

    return a.team.id - b.team.id;
  });
  res.json(sorted);
});


const getPlayerTable = asyncHandler(async (req, res) => {
  const eventId = parseInt(req.query.eventId);
  const dbName = req.query.dbName || req.body?.dbName || "";
  const PlayerTable = await getModel(dbName, "PlayerTable", playerTableSchema);
const Player = await getModel(dbName, "Player", playerSchema);
  const table = await PlayerTable.find().populate("player").lean();
  const sorted = table.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - a.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
  res.json(sorted);
});

const updateClassicTable = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
  if (!dbName) {
    return res.status(400).json({ message: "dbName is required" });
  }

  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  const Team = await getModel(dbName, "Team", teamSchema);
  const TeamClassic = await getModel(dbName, "TeamClassic", teamClassicSchema);
  await TeamClassic.deleteMany({})

  const fixtures = await Fixture.find({});
  const teams = await Team.find({});
  
  const eventId = parseInt(req.params.eventId); // optional

  const teamIdMap = {};
  for (const team of teams) {
    teamIdMap[team.id] = team._id.toString();
  }
  
  // Group fixtures by team _id
  const fixturesByTeam = {};
  for (const fixture of fixtures) {
    const homeTeamId = teamIdMap[fixture.homeTeam];
    const awayTeamId = teamIdMap[fixture.awayTeam];

    if (!homeTeamId || !awayTeamId) continue;

    if (!fixturesByTeam[homeTeamId]) fixturesByTeam[homeTeamId] = [];
    if (!fixturesByTeam[awayTeamId]) fixturesByTeam[awayTeamId] = [];

    fixturesByTeam[homeTeamId].push({ fixture, isHome: true });
    fixturesByTeam[awayTeamId].push({ fixture, isHome: false });
  }

  // Ensure TeamClassic table is initialized
  let table = await TeamClassic.find({});
  if (table.length === 0) {
    const initialRows = teams.map(team => ({
      team: team._id,
      played: 0,
      win: 0,
      draw: 0,
      loss: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      result: [],
    }));
    console.log(initialRows)
    await TeamClassic.insertMany(initialRows);
    table = await TeamClassic.find({});
  }

  const bulkOps = [];

  for (const row of table) {
    const tid = row.team.toString();
    const relevant = fixturesByTeam[tid] || [];

    let P = 0, W = 0, D = 0, L = 0, GF = 0, GA = 0, GD = 0, points = 0;
    const results = [];

    for (const { fixture, isHome } of relevant) {
      const homeScore = fixture.homeScoreClassic;
      const awayScore = fixture.awayScoreClassic;
      const result = isHome ? fixture.homeResultClassic : fixture.awayResultClassic;

      if (homeScore == null || awayScore == null) continue;

      P++;
      results.push(result);

      if (isHome) {
        GF += homeScore;
        GA += awayScore;
        GD += homeScore - awayScore;
        if (homeScore > awayScore) { W++; points += 3; }
        else if (homeScore < awayScore) { L++; }
        else { D++; points += 1; }
      } else {
        GF += awayScore;
        GA += homeScore;
        GD += awayScore - homeScore;
        if (awayScore > homeScore) { W++; points += 3; }
        else if (awayScore < homeScore) { L++; }
        else { D++; points += 1; }
      }
    }

    bulkOps.push({
      updateOne: {
        filter: { _id: row._id },
        update: {
          $set: {
            played: P,
            win: W,
            draw: D,
            loss: L,
            goalsFor: GF,
            goalsAgainst: GA,
            goalDifference: GD,
            points,
            result: results,
          },
        },
      },
    });
  }

  if (bulkOps.length > 0) {
    await TeamClassic.bulkWrite(bulkOps);
  }

  res.json({ message: "Classic table updated successfully" });
});



const updateH2HTable = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
  if (!dbName) {
    return res.status(400).json({ message: "dbName is required" });
  }

  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  const Team = await getModel(dbName, "Team", teamSchema);
  const TeamH2H = await getModel(dbName, "TeamH2H", teamH2HSchema);
  const eventId = parseInt(req.params.eventId);
await TeamH2H.deleteMany({});
  const fixtures = await Fixture.find({});
  const teams = await Team.find({});

  const teamIdMap = {};
  for (const team of teams) {
    teamIdMap[team.id] = team._id.toString();
  }

  // Group fixtures by teamId
  const fixturesByTeam = {};
  for (const fixture of fixtures) {
    const homeTeamId = teamIdMap[fixture.homeTeam];
    const awayTeamId = teamIdMap[fixture.awayTeam];

    if (!homeTeamId || !awayTeamId) continue;

    if (!fixturesByTeam[homeTeamId]) fixturesByTeam[homeTeamId] = [];
    if (!fixturesByTeam[awayTeamId]) fixturesByTeam[awayTeamId] = [];

    fixturesByTeam[homeTeamId].push({ fixture, isHome: true });
    fixturesByTeam[awayTeamId].push({ fixture, isHome: false });
  }

  // Ensure H2H table is initialized
  let table = await TeamH2H.find({});
  if (table.length === 0) {
    const initialRows = teams.map(team => ({
      team: team._id,
      played: 0,
      win: 0,
      draw: 0,
      loss: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      result: [],
    }));
    await TeamH2H.insertMany(initialRows);
    table = await TeamH2H.find({});
  }

  const bulkOps = [];

  for (const row of table) {
    const tid = row.team.toString();
    const relevant = fixturesByTeam[tid] || [];

    let P = 0, W = 0, D = 0, L = 0, GF = 0, GA = 0, GD = 0, points = 0;
    const results = [];

    for (const { fixture, isHome } of relevant) {
      const homeScore = fixture.homeScoreH2H;
      const awayScore = fixture.awayScoreH2H;
      const result = isHome ? fixture.homeResultH2H : fixture.awayResultH2H;

      if (homeScore == null || awayScore == null) continue;

      P++;
      results.push(result);

      if (isHome) {
        GF += homeScore;
        GA += awayScore;
        GD += homeScore - awayScore;
        if (homeScore > awayScore) { W++; points += 3; }
        else if (homeScore < awayScore) { L++; }
        else { D++; points += 1; }
      } else {
        GF += awayScore;
        GA += homeScore;
        GD += awayScore - homeScore;
        if (awayScore > homeScore) { W++; points += 3; }
        else if (awayScore < homeScore) { L++; }
        else { D++; points += 1; }
      }
    }

    bulkOps.push({
      updateOne: {
        filter: { _id: row._id },
        update: {
          $set: {
            played: P,
            win: W,
            draw: D,
            loss: L,
            goalsFor: GF,
            goalsAgainst: GA,
            goalDifference: GD,
            points,
            result: results,
          },
        },
      },
    });
  }

  if (bulkOps.length > 0) {
    await TeamH2H.bulkWrite(bulkOps);
  }

  res.json({ message: "H2H table updated successfully" });
});




const updatePlayerTable = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName;
  if (!dbName) {
    return res.status(400).json({ message: "dbName is required" });
  }

  const Team = await getModel(dbName, "Team", teamSchema);
  const PlayerTable = await getModel(dbName, "PlayerTable", playerTableSchema);
  const PlayerFixture = await getModel(dbName, "PlayerFixture", playerFixtureSchema);
  const Player = await getModel(dbName, "Player", playerSchema);
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);

  const eventId = parseInt(req.params.eventId);
  const fixtures = await PlayerFixture.find({});
  const players = await Player.find({});
  let table = await PlayerTable.find({});

  // 🔧 If table doesn't exist, create it
  if (table.length === 0) {
    const initial = players.map(p => ({
      player: p._id,
      teamId: p.teamId,
      position: p.position,
      played: 0,
      win: 0,
      draw: 0,
      loss: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      pointsDifference: 0,
      points: 0,
      result: [],
    }));
    await PlayerTable.insertMany(initial);
    table = await PlayerTable.find({});
  }

  // 1. Group fixtures by player ID
  const playerFixturesMap = {};

  for (const fixture of fixtures) {
    const homeId = fixture.homePlayer?.toString();
    const awayId = fixture.awayPlayer?.toString();

    if (homeId) {
      if (!playerFixturesMap[homeId]) playerFixturesMap[homeId] = [];
      playerFixturesMap[homeId].push({
        isHome: true,
        score: fixture.homeScore,
        oppScore: fixture.awayScore,
        result: fixture.homeResult,
      });
    }

    if (awayId) {
      if (!playerFixturesMap[awayId]) playerFixturesMap[awayId] = [];
      playerFixturesMap[awayId].push({
        isHome: false,
        score: fixture.awayScore,
        oppScore: fixture.homeScore,
        result: fixture.awayResult,
      });
    }
  }

  // 2. Bulk update player rows
  const bulkOps = [];

  for (const row of table) {
    const pid = row.player.toString();
    const data = playerFixturesMap[pid] || [];

    let totalPoints = 0;
    let GF = 0;
    let GA = 0;
    let W = 0;
    let D = 0;
    let L = 0;
    let P = 0;
    let GD = 0;
    const results = [];

    for (const match of data) {
      const { score, oppScore, result } = match;

      if (score == null || oppScore == null) continue;

      P++;
      GF += score;
      GA += oppScore;
      GD += score - oppScore;
      results.push(result);

      if (score > oppScore) {
        W++;
        totalPoints += 3;
      } else if (score < oppScore) {
        L++;
      } else {
        D++;
        totalPoints += 1;
      }
    }

    bulkOps.push({
      updateOne: {
        filter: { _id: row._id },
        update: {
          $set: {
            played: P,
            win: W,
            draw: D,
            loss: L,
            pointsFor: GF,
            pointsAgainst: GA,
            pointsDifference: GD,
            points: totalPoints,
            result: results,
          },
        },
      },
    });
  }

  if (bulkOps.length > 0) {
    await PlayerTable.bulkWrite(bulkOps);
  }

  res.json({ message: "Players table updated successfully" });
});


export {
  getClassicTable,
  getH2HTable,
  getPlayerTable,
  updateClassicTable,
  updateH2HTable,
  updatePlayerTable,
};
