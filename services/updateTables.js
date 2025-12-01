import asyncHandler from "express-async-handler";
import { getModel } from "../config/db.js";
import teamSchema from "../models/teamModel.js";
import playerSchema from "../models/playerModel.js";
import playerEventPointsSchema from "../models/playerPointsModel.js";
import eventSchema from "../models/eventModel.js";
import formulaOneSchema from "../models/formulaOneModel.js";
import formulaOneTotalSchema from "../models/formulaOneTotalModel.js";
import teamClassicSchema from "../models/teamClassicModel.js";
import teamH2HSchema from "../models/teamH2HModel.js";
import playerTableSchema from "../models/playerTableModel.js";
import playerFixtureSchema from "../models/playerFixtureModel.js";
import fixtureSchema from "../models/fixtureModel.js";

const pointsTable = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
export const updateClassicTable = async (dbName, eventId) => {
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  const Team = await getModel(dbName, "Team", teamSchema);
  const TeamClassic = await getModel(dbName, "TeamClassic", teamClassicSchema);
  await TeamClassic.deleteMany({});

  const fixtures = await Fixture.find({ eventId: { $lte: eventId } });
  const teams = await Team.find({});

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
    const initialRows = teams.map((team) => ({
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
    await TeamClassic.insertMany(initialRows);
    table = await TeamClassic.find({});
  }

  const bulkOps = [];

  for (const row of table) {
    const tid = row.team.toString();
    const relevant = fixturesByTeam[tid] || [];

    let P = 0,
      W = 0,
      D = 0,
      L = 0,
      GF = 0,
      GA = 0,
      GD = 0,
      points = 0;
    const results = [];

    for (const { fixture, isHome } of relevant) {
      const homeScore = fixture.homeScoreClassic;
      const awayScore = fixture.awayScoreClassic;
      const result = isHome
        ? fixture.homeResultClassic
        : fixture.awayResultClassic;

      if (homeScore == null || awayScore == null) continue;

      P++;
      results.push(result);

      if (isHome) {
        GF += homeScore;
        GA += awayScore;
        GD += homeScore - awayScore;
        if (homeScore > awayScore) {
          W++;
          points += 3;
        } else if (homeScore < awayScore) {
          L++;
        } else {
          D++;
          points += 1;
        }
      } else {
        GF += awayScore;
        GA += homeScore;
        GD += awayScore - homeScore;
        if (awayScore > homeScore) {
          W++;
          points += 3;
        } else if (awayScore < homeScore) {
          L++;
        } else {
          D++;
          points += 1;
        }
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
};

export const updateH2HTable = async (dbName, eventId) => {
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  const Team = await getModel(dbName, "Team", teamSchema);
  const TeamH2H = await getModel(dbName, "TeamH2H", teamH2HSchema);
  await TeamH2H.deleteMany({});
  const fixtures = await Fixture.find({ eventId: { $lte: eventId } });
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
    const initialRows = teams.map((team) => ({
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

    let P = 0,
      W = 0,
      D = 0,
      L = 0,
      GF = 0,
      GA = 0,
      GD = 0,
      points = 0;
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
        if (homeScore > awayScore) {
          W++;
          points += 3;
        } else if (homeScore < awayScore) {
          L++;
        } else {
          D++;
          points += 1;
        }
      } else {
        GF += awayScore;
        GA += homeScore;
        GD += awayScore - homeScore;
        if (awayScore > homeScore) {
          W++;
          points += 3;
        } else if (awayScore < homeScore) {
          L++;
        } else {
          D++;
          points += 1;
        }
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
};

export const updatePlayerTable = async (dbName, eventId) => {
  const Team = await getModel(dbName, "Team", teamSchema);
  const PlayerTable = await getModel(dbName, "PlayerTable", playerTableSchema);
  const PlayerFixture = await getModel(
    dbName,
    "PlayerFixture",
    playerFixtureSchema
  );
  const Player = await getModel(dbName, "Player", playerSchema);
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  await PlayerTable.deleteMany({});
  const fixtures = await PlayerFixture.find({ eventId: { $lte: eventId } });
  const players = await Player.find({});
  let table = await PlayerTable.find({});

  //  If table doesn't exist, create it
  if (table.length === 0) {
    const initial = players.map((p) => ({
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
};

export const calculateF1perGW = asyncHandler(async (dbName, eventId) => {
  const Team = await getModel(dbName, "Team", teamSchema);
  const Player = await getModel(dbName, "Player", playerSchema);
  const PlayerEventPoints = await getModel(
    dbName,
    "PlayerEventPoints",
    playerEventPointsSchema
  );
  const Event = await getModel(dbName, "Event", eventSchema);
  const FormulaOne = await getModel(dbName, "FormulaOne", formulaOneSchema);
  //await FormulaOne.deleteMany({});
  const [teams, events, allPlayers, allPoints] = await Promise.all([
    Team.find({}),
    Event.find({ eventId: { $lte: eventId } }).sort({ eventId: 1 }),
    Player.find({ startGW: { $lte: eventId } }),
    PlayerEventPoints.find({ eventId }),
  ]);

  const playersByTeam = new Map();
  for (const player of allPlayers) {
    const tid = player.team.toString();
    if (!playersByTeam.has(tid)) playersByTeam.set(tid, []);
    playersByTeam.get(tid).push(player);
  }

  const pointsByPlayerEvent = new Map();
  for (const pt of allPoints) {
    pointsByPlayerEvent.set(
      `${pt.player}_${pt.eventId}`,
      pt.eventPoints - pt.eventTransfersCost || 0
    );
  }

  const teamScores = [];

  for (const team of teams) {
    const teamIdStr = team._id.toString();
    const players = playersByTeam.get(teamIdStr) || [];
    // Get each player’s score for this event
    const playerScores = players.map((p) => ({
      playerId: p._id,
      score: pointsByPlayerEvent.get(`${p._id}_${eventId}`) || 0,
    }));
    // Sort by score descending
    playerScores.sort((a, b) => b.score - a.score);

    // Extract top 5 scores (or fill with 0 if less than 5 players)
    const rankedScores = playerScores.map((p) => p.score);
    while (rankedScores.length < 5) rankedScores.push(0); // pad with zeros

    const totalPoints = players.reduce((sum, p) => {
      return sum + (pointsByPlayerEvent.get(`${p._id}_${eventId}`) || 0);
    }, 0);

    teamScores.push({
      teamId: team._id,
      name: team.name,
      eventId,
      totalPoints,
      first: rankedScores[0],
      second: rankedScores[1],
      third: rankedScores[2],
      fourth: rankedScores[3],
      fifth: rankedScores[4],
    });
  }

  teamScores.sort((a, b) => {
    return (
      b.totalPoints - a.totalPoints ||
      b.first - a.first ||
      b.second - a.second ||
      b.third - a.third ||
      b.fourth - a.fourth ||
      b.fifth - a.fifth
    );
  });


  const updates = teamScores.map((team, index) => ({
      updateOne: {
        filter: { teamId: team.teamId, eventId: team.eventId },
        update: {
          $set: {
            rank: index + 1,
            teamId: team.teamId,
            teamName: team.name,
            eventId: team.eventId,
            totalPoints: team.totalPoints,
            score: pointsTable[index] || 0,
          },
        },
        upsert: true,
      },
    }));

   if (updates.length > 0) {
      await FormulaOne.bulkWrite(updates);
    }

  await calculateTotalF1(dbName);
});

const calculateTotalF1 = async (dbName) => {
  const FormulaOne = await getModel(dbName, "FormulaOne", formulaOneSchema);
  const FormulaOneTotal = await getModel(
    dbName,
    "FormulaOneTotal",
    formulaOneTotalSchema
  );
  const Team = await getModel(dbName, "Team", teamSchema);

  // One query to get all team scores grouped by teamId
  const totals = await FormulaOne.aggregate([
    {
      $group: {
        _id: "$teamId",
        totalScore: { $sum: "$score" },
        teamName: { $first: "$teamName" },
      },
    },
  ]);

  const updates = totals.map((t) => ({
    updateOne: {
      filter: { teamId: t._id },
      update: {
        $set: {
          teamId: t._id,
          teamName: t.teamName,
          totalScore: t.totalScore,
        },
      },
      upsert: true,
    },
  }));

  if (updates.length > 0) {
    await FormulaOneTotal.bulkWrite(updates);
  }
};
