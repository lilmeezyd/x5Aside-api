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
  const nextEventId = eventId+1

  const teams = await Team.find({}).lean();
  const nextFixtures = await Fixture.find({eventId: nextEventId}).lean();
  
  const teamNameMap = new Map(teams.map(x => [x.id, x.short_name]))

  const teamIdMap = {};
  for (const team of teams) {
    teamIdMap[team.id] = team._id;
  }

  // Preserve existing rows
  const existingTable = await TeamClassic.find({}).lean();
  const existingMap = {};
  for (const row of existingTable) {
    existingMap[row.team.toString()] = row;
  }

  const aggregated = await Fixture.aggregate([
    { $match: { eventId: { $lte: eventId } } },
    {
      $project: {
        teams: [
          {
            team: "$homeTeam",
            goalsFor: "$homeScoreClassic",
            goalsAgainst: "$awayScoreClassic",
            result: "$homeResultClassic",
          },
          {
            team: "$awayTeam",
            goalsFor: "$awayScoreClassic",
            goalsAgainst: "$homeScoreClassic",
            result: "$awayResultClassic",
          },
        ],
      },
    },
    { $unwind: "$teams" },
    {
      $group: {
        _id: "$teams.team",
        played: { $sum: 1 },
        win: {
          $sum: { $cond: [{ $eq: ["$teams.result.result", "W"] }, 1, 0] },
        },
        draw: {
          $sum: { $cond: [{ $eq: ["$teams.result.result", "D"] }, 1, 0] },
        },
        loss: {
          $sum: { $cond: [{ $eq: ["$teams.result.result", "L"] }, 1, 0] },
        },
        goalsFor: { $sum: "$teams.goalsFor" },
        goalsAgainst: { $sum: "$teams.goalsAgainst" },
        points: {
          $sum: {
            $switch: {
              branches: [
                { case: { $eq: ["$teams.result.result", "W"] }, then: 3 },
                { case: { $eq: ["$teams.result.result", "D"] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
        result: { $push: "$teams.result" },
      },
    },
    {
      $addFields: {
        goalDifference: { $subtract: ["$goalsFor", "$goalsAgainst"] },
      },
    },
    {
      $addFields: {
        sortKey: {
          $add: [
            { $multiply: ["$points", 1000000000] },
            { $multiply: ["$goalDifference", 1000000] },
            { $multiply: ["$goalsFor", 1000] },
            { $subtract: [1000, "$_id"] },
          ],
        },
      },
    },
    {
      $setWindowFields: {
        sortBy: { sortKey: -1 },
        output: {
          rank: { $rank: {} },
        },
      },
    },
  ]);

  const getOpponent = (teamId) => {
    const nextFixture = nextFixtures.find(x => (x.homeTeam === teamId || x.awayTeam === teamId))
    const nextTeam = teamId === nextFixture.homeTeam ? nextFixture.awayTeam : nextFixture.homeTeam
    return teamNameMap.get(nextTeam)
  }

  const bulkOps = aggregated.map((row) => {
    const teamObjectId = teamIdMap[row._id];
    const existing = existingMap[teamObjectId?.toString()];
    const nextOpponent = (nextEventId < 38) ? getOpponent(row._id) : "None"

    const oldRank = existing?.oldRank ?? row.rank;
    const rankChange = oldRank - row.rank;

    return {
      updateOne: {
        filter: { team: teamObjectId },
        update: {
          $set: {
            played: row.played,
            win: row.win,
            draw: row.draw,
            loss: row.loss,
            goalsFor: row.goalsFor,
            goalsAgainst: row.goalsAgainst,
            goalDifference: row.goalDifference,
            points: row.points,
            result: row.result,
            rank: row.rank,
            next: nextOpponent
          },
        },
        upsert: true,
      },
    };
  });

  if (bulkOps.length > 0) {
    await TeamClassic.bulkWrite(bulkOps);
  }
};

export const updateH2HTable = async (dbName, eventId) => {
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  const Team = await getModel(dbName, "Team", teamSchema);
  const TeamH2H = await getModel(dbName, "TeamH2H", teamH2HSchema);
  const nextEventId = eventId+1

  const teams = await Team.find({}).lean();
  const nextFixtures = await Fixture.find({eventId: nextEventId}).lean();
  const teamNameMap = new Map(teams.map(x => [x.id, x.short_name]))

  const teamIdMap = {};
  for (const team of teams) {
    teamIdMap[team.id] = team._id;
  }

  // Preserve existing rows
  const existingTable = await TeamH2H.find({}).lean();
  const existingMap = {};
  for (const row of existingTable) {
    existingMap[row.team.toString()] = row;
  }

  const aggregated = await Fixture.aggregate([
    { $match: { eventId: { $lte: eventId } } },
    {
      $project: {
        teams: [
          {
            team: "$homeTeam",
            goalsFor: "$homeScoreH2H",
            goalsAgainst: "$awayScoreH2H",
            result: "$homeResultH2H",
          },
          {
            team: "$awayTeam",
            goalsFor: "$awayScoreH2H",
            goalsAgainst: "$homeScoreH2H",
            result: "$awayResultH2H",
          },
        ],
      },
    },
    { $unwind: "$teams" },
    {
      $group: {
        _id: "$teams.team",
        played: { $sum: 1 },
        win: {
          $sum: { $cond: [{ $eq: ["$teams.result.result", "W"] }, 1, 0] },
        },
        draw: {
          $sum: { $cond: [{ $eq: ["$teams.result.result", "D"] }, 1, 0] },
        },
        loss: {
          $sum: { $cond: [{ $eq: ["$teams.result.result", "L"] }, 1, 0] },
        },
        goalsFor: { $sum: "$teams.goalsFor" },
        goalsAgainst: { $sum: "$teams.goalsAgainst" },
        points: {
          $sum: {
            $switch: {
              branches: [
                { case: { $eq: ["$teams.result.result", "W"] }, then: 3 },
                { case: { $eq: ["$teams.result.result", "D"] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
        result: { $push: "$teams.result" },
      },
    },
    {
      $addFields: {
        goalDifference: { $subtract: ["$goalsFor", "$goalsAgainst"] },
      },
    },
    {
      $addFields: {
        sortKey: {
          $add: [
            { $multiply: ["$points", 1000000000] },
            { $multiply: ["$goalDifference", 1000000] },
            { $multiply: ["$goalsFor", 1000] },
            { $subtract: [1000, "$_id"] },
          ],
        },
      },
    },
    {
      $setWindowFields: {
        sortBy: { sortKey: -1 },
        output: {
          rank: { $rank: {} },
        },
      },
    },
  ]);

  const getOpponent = (teamId) => {
    const nextFixture = nextFixtures.find(x => (x.homeTeam === teamId || x.awayTeam === teamId))
    const nextTeam = teamId === nextFixture.homeTeam ? nextFixture.awayTeam : nextFixture.homeTeam
    return teamNameMap.get(nextTeam)
  }

  const bulkOps = aggregated.map((row) => {
    const teamObjectId = teamIdMap[row._id];
    const existing = existingMap[teamObjectId?.toString()];
    const nextOpponent = (nextEventId < 38) ? getOpponent(row._id) : "None"

    const oldRank = existing?.oldRank ?? row.rank;
    const rankChange = oldRank - row.rank;

    return {
      updateOne: {
        filter: { team: teamObjectId },
        update: {
          $set: {
            played: row.played,
            win: row.win,
            draw: row.draw,
            loss: row.loss,
            goalsFor: row.goalsFor,
            goalsAgainst: row.goalsAgainst,
            goalDifference: row.goalDifference,
            points: row.points,
            result: row.result,
            rank: row.rank,
            next: nextOpponent
          },
        },
        upsert: true,
      },
    };
  });

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
    playerFixtureSchema,
  );
  const Player = await getModel(dbName, "Player", playerSchema);
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  const fixtures = await PlayerFixture.find({ eventId: { $lte: eventId } });
  const players = await Player.find({});
  let table = await PlayerTable.find({});

  const aggregated = await PlayerFixture.aggregate([
    { $match: { eventId: { $lte: eventId } } },
    {
      $project: {
        players: [
          {
            player: "$homePlayer",
            pointsFor: "$homeScore",
            pointsAgainst: "$awayScore",
            result: "$homeResult",
          },
          {
            player: "$awayPlayer",
            pointsFor: "$awayScore",
            pointsAgainst: "$homeScore",
            result: "$awayResult",
          },
        ],
      },
    },
    { $unwind: "$players" },
    {
      $group: {
        _id: "$players.player",
        played: { $sum: 1 },
        win: {
          $sum: { $cond: [{ $eq: ["$players.result.result", "W"] }, 1, 0] },
        },
        draw: {
          $sum: { $cond: [{ $eq: ["$players.result.result", "D"] }, 1, 0] },
        },
        loss: {
          $sum: { $cond: [{ $eq: ["$players.result.result", "L"] }, 1, 0] },
        },
        pointsFor: { $sum: "$players.pointsFor" },
        pointsAgainst: { $sum: "$players.pointsAgainst" },
        points: {
          $sum: {
            $switch: {
              branches: [
                { case: { $eq: ["$players.result.result", "W"] }, then: 3 },
                { case: { $eq: ["$players.result.result", "D"] }, then: 1 },
              ],
              default: 0,
            },
          },
        },
        result: { $push: "$players.result" },
      },
    },
    {
      $lookup: {
        from: "players",
        let: { playerId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$playerId"] },
            },
          },
          {
            $project: { fplId: 1, _id: 0 },
          },
        ],
        as: "playerInfo",
      },
    },
    {
      $addFields: {
        pointsDifference: { $subtract: ["$pointsFor", "$pointsAgainst"] },
        fplId: { $arrayElemAt: ["$playerInfo.fplId", 0] },
      },
    },
    {
      $addFields: {
        sortKey: {
          $add: [
            { $multiply: ["$points", 1000000000] },
            { $multiply: ["$pointsDifference", 1000000] },
            { $multiply: ["$pointsFor", 1000] },
            { $subtract: [1000, "$fplId"] },
          ],
        },
      },
    },
    {
      $setWindowFields: {
        sortBy: { sortKey: -1 },
        output: {
          rank: { $rank: {} },
        },
      },
    },
  ]);

  const bulkOps = aggregated.map((row) => {
    return {
      updateOne: {
        filter: { player: row._id },
        update: {
          $set: {
            played: row.played,
            win: row.win,
            draw: row.draw,
            loss: row.loss,
            pointsFor: row.pointsFor,
            pointsAgainst: row.pointsAgainst,
            pointsDifference: row.pointsDifference,
            points: row.points,
            result: row.result,
            rank: row.rank,
          },
        },
        upsert: true,
      },
    };
  });

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
    playerEventPointsSchema,
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
      pt.eventPoints - pt.eventTransfersCost || 0,
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
    formulaOneTotalSchema,
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
    {
      $lookup: {
        from: "teams",
        let: { teamId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$teamId"] },
            },
          },
          {
            $project: { id: 1, _id: 0 },
          },
        ],
        as: "teamInfo",
      },
    },
    {
      $addFields: {
        teamId: { $arrayElemAt: ["$teamInfo.id", 0] },
      },
    },
    {
      $addFields: {
        sortKey: {
          $add: [
            { $multiply: ["$totalScore", 1000000000] },
            { $subtract: [1000, "$teamId"] },
          ],
        },
      },
    },
    {
      $setWindowFields: {
        sortBy: { sortKey: -1 },
        output: {
          rank: { $rank: {} },
        },
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
          rank: t.rank,
        },
      },
      upsert: true,
    },
  }));

  if (updates.length > 0) {
    await FormulaOneTotal.bulkWrite(updates);
  }
};
