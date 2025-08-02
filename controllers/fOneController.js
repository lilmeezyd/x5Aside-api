import asyncHandler from 'express-async-handler';
import { getModel } from '../config/db.js';

import teamSchema from '../models/teamModel.js';
import playerSchema from '../models/playerModel.js';
import playerEventPointsSchema from '../models/playerPointsModel.js';
import eventSchema from '../models/eventModel.js';
import formulaOneSchema from '../models/formulaOneModel.js';
import formulaOneTotalSchema from '../models/formulaOneTotalModel.js';

const pointsTable = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

export const calculateF1perGW = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body.dbName;
  
  const Team = await getModel(dbName, 'Team', teamSchema);
  const Player = await getModel(dbName, 'Player', playerSchema);
  const PlayerEventPoints = await getModel(dbName, 'PlayerEventPoints', playerEventPointsSchema);
  const Event = await getModel(dbName, 'Event', eventSchema);
  const FormulaOne = await getModel(dbName, 'FormulaOne', formulaOneSchema);
  const event = await Event.findOne({current: true})
const { eventId } = event
  const [teams, events, allPlayers, allPoints] = await Promise.all([
    Team.find({}),
    Event.find({ eventId: { $lte: eventId } }).sort({ eventId: 1 }),
    Player.find({}),
    PlayerEventPoints.find({ eventId: { $lte: eventId } })
  ]);

  // Build maps
  const playersByTeam = new Map(); // team -> [players]
  for (const player of allPlayers) {
    const tid = player.team.toString();
    if (!playersByTeam.has(tid)) playersByTeam.set(tid, []);
    playersByTeam.get(tid).push(player);
  }

  const pointsByPlayerEvent = new Map(); // `${player}_${eventId}` -> points
  for (const pt of allPoints) {
    pointsByPlayerEvent.set(`${pt.player}_${pt.eventId}`, pt.eventPoints || 0);
  }

  for (const event of events) {
    const eventId = event.eventId;
    const teamScores = [];

    for (const team of teams) {
      const teamIdStr = team._id.toString();
      const players = playersByTeam.get(teamIdStr) || [];

      const totalPoints = players.reduce((sum, p) => {
        return sum + (pointsByPlayerEvent.get(`${p._id}_${eventId}`) || 0);
      }, 0);

      teamScores.push({
        teamId: team._id,
        name: team.name,
        eventId,
        totalPoints,
      });
    }

    // Sort and assign scores
    teamScores.sort((a, b) => b.totalPoints - a.totalPoints);

    const updates = teamScores.map((team, index) => ({
      updateOne: {
        filter: { teamId: team.teamId, eventId: team.eventId },
        update: {
          $set: {
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
  }

  await calculateTotalF1(dbName); // still efficient

  res.status(200).json({ message: 'Optimized F1 per GW and totals updated.' });
});

export const getF1Standings = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body.dbName || "";
  const FormulaOneTotal = await getModel(dbName, 'FormulaOneTotal', formulaOneTotalSchema);
  
  const Team = await getModel(dbName, 'Team', teamSchema);

  const standings = await FormulaOneTotal.find({})
  .populate('teamId')
  .sort({ totalScore: -1 })
  .select('teamId teamName totalScore');

standings.sort((a, b) => {
  if (a.totalScore === b.totalScore) {
    return a.teamId.id - b.teamId.id;
  }
  return 0; // keep totalScore order
});

  res.status(200).json(standings);
});

export const getF1ByEvent = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body.dbName;
  const eventId = parseInt(req.params.eventId);

  if (isNaN(eventId)) {
    res.status(400);
    throw new Error('eventId required');
  }

  const FormulaOne = await getModel(dbName, 'FormulaOne', formulaOneSchema);

  const results = await FormulaOne.find({ eventId })
    .populate('teamId')
    .sort({ score: -1 })
    .select('teamId teamName score totalPoints');

  results.sort((a, b) => {
    if (a.score === b.score) {
      return a.teamId.id - b.teamId.id;
    }
    return 0; // keep totalScore order
  });

  res.status(200).json(results);
});



const calculateTotalF1 = async (dbName) => {
  const FormulaOne = await getModel(dbName, 'FormulaOne', formulaOneSchema);
  const FormulaOneTotal = await getModel(dbName, 'FormulaOneTotal', formulaOneTotalSchema);
  const Team = await getModel(dbName, 'Team', teamSchema);

  // One query to get all team scores grouped by teamId
  const totals = await FormulaOne.aggregate([
    {
      $group: {
        _id: '$teamId',
        totalScore: { $sum: '$score' },
        teamName: { $first: '$teamName' },
      },
    },
  ]);
  console.log(totals)

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

