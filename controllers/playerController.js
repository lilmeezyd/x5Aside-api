import Player from "../models/playerModel.js";
import asyncHandler from "express-async-handler";
import PlayerTable from "../models/playerTableModel.js";
import Fixture from "../models/fixtureModel.js";
import { fetchData } from "../services/fetchManagerData.js";
import PlayerEventPoints from "../models/playerPointsModel.js";
import Team from "../models/teamModel.js";
import Leaderboard from "../models/leaderboardModel.js";
import PlayerFixture from "../models/playerFixtureModel.js";
import axios from "axios";
const createPlayer = asyncHandler(async (req, res) => {
  const { xHandle, fplId, position, team } = req.body;
  if (!fplId || !position || !team) {
    res.status(400);
    console.log("Invalid data");
    throw new Error("Invalid data");
  }
  const playerExists = await Player.findOne({ fplId });
  if (playerExists) {
    res.status(400);
    console.log("Fpl Id already taken")
    throw new Error("Fpl Id already exists");
  }
  const positionTaken = await Player.find({ position, team });
  console.log(positionTaken);
  if (positionTaken.length > 0) {
    res.status(400);
    throw new Error("Position already taken");
  }
  const data = await fetchData(fplId);
  const { teamName, manager } = data;
  console.log(data)
  if (team === null) {
    res.status(400);
    throw new Error("No team added");
  }
  
  const playerTeam = await Team.findById(team);
  const player = await Player.create({
    teamName,
    manager,
    xHandle,
    fplId,
    position,
    team,
  });
  await PlayerTable.create({
    player: player._id,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    points: 0,
  });
  playerTeam.players.push(player.id);
  await playerTeam.save();
  res.json({ manager: player.manager });
});
const getPlayers = asyncHandler(async (req, res) => {
  const players = await Player.find({}).populate("team");
  res.json(players);
});
const deleteAllPlayers = asyncHandler(async (req, res) => {
  await Player.deleteMany({});
  await PlayerEventPoints.deleteMany({});
  await PlayerFixture.deleteMany({});
  await PlayerTable.deleteMany({});
  await Leaderboard.deleteMany({});
  await Team.updateMany(
    {},
    {
      $set: { players: [] },
    },
  );
  res.json({ message: "All players deleted" });
});

const deletePlayer = asyncHandler(async (req, res) => {
  const player = await Player.findById(req.params.id);
  if (player) {
    await Player.deleteOne({ _id: player._id }); // Use deleteOne instead of remove
    await PlayerEventPoints.deleteMany({ player: player._id });
    await PlayerFixture.deleteMany({ player: player._id });
    await PlayerTable.deleteOne({ player: player._id });
    await Leaderboard.deleteOne({ player: player._id });
    await Team.updateOne(
      { _id: player.team },
      { $pull: { players: player._id } },
    );
    res.json({ message: "Player removed" });
  } else {
    res.status(404);
    throw new Error("Player not found");
  }
});

const updatePlayer = asyncHandler(async (req, res) => {
  const updatedPlayer = await Player.updateOne(
    { _id: req.params.id },
    req.body,
  );
  res.json({ message: `Player ${updatedPlayer.manager} updated` });
});
const fetchAndStorePlayerEventPoints = asyncHandler(async (req, res) => {
  try {
    const players = await Player.find({});
    console.log(players[0])

    for (const player of players) {
      const { fplId, _id: playerId } = player;
     console.log(playerId, player)

      const { data } = await axios.get(
        `https://fantasy.premierleague.com/api/entry/${fplId}/history/`,
      );
      const events = data.current;

      const bulkOps = events.map((event) => ({
        updateOne: {
          filter: {
            player: playerId,
            eventId: event.event,
          },
          update: {
            $set: {
              player: playerId,
              eventId: event.event,
              eventPoints: event.points,
              eventTransfersCost: event.event_transfers_cost,
              overallRank: event.overall_rank,
              totalPoints: event.total_points,
            },
          },
          upsert: true, // Avoid duplicate inserts for same player+event
        },
      }));

      if (bulkOps.length > 0) {
        await PlayerEventPoints.bulkWrite(bulkOps);
        console.log(`Synced ${bulkOps.length} events for @${player.xHandle}`);
      }
    }

    res
      .status(200)
      .json({ message: "Player event points updated successfully." });
  } catch (err) {
    console.error("Error syncing player event points:", err.message);
    res.status(500).json({ error: "Failed to sync player event points." });
  }
});
const getPlayerEventPoints = asyncHandler(async (req, res) => {
  try {
    const { playerId } = req.params;
    const playerEventPoints = await PlayerEventPoints.find({
      player: playerId,
    });
    res.status(200).json(playerEventPoints);
  } catch (error) {
    console.error("Error fetching player event points:", error.message);
    res.status(500).json({ error: "Failed to fetch player event points." });
  }
});

const updateLeadingScorers = asyncHandler(async (req, res) => {
  const fixtures = await Fixture.find({});
  const goalsScorers = [];
  for (const fixture of fixtures) {
    const { homeStats, awayStats } = fixture;
    goalsScorers.push(...homeStats, ...awayStats);
  }
  if (goalsScorers.length > 0) {
    function mergeGoalsById(data) {
      const result = {};

      for (const player of data) {
        const { _id, goals } = player;

        if (!result[_id]) {
          result[_id] = { _id, goals };
        } else {
          result[_id].goals += goals;
        }
      }

      // Convert to array and sort by goals descending
      return Object.values(result).sort((a, b) => b.goals - a.goals);
    }
    const mergedPlayers = mergeGoalsById(goalsScorers);
    const leaderboardEntries = mergedPlayers.map((p) => ({
      player: p._id, // assuming `id` is already a valid ObjectId
      goals: p.goals,
    }));

    await Leaderboard.deleteMany({});

    await Leaderboard.insertMany(leaderboardEntries);
    res.json({ message: "Leading scorers updated successfully" });
  }
});
const getLeadingScorers = asyncHandler(async (req, res) => {
  const leadingScorers = await Leaderboard.find({}).populate("player");
  res.json(leadingScorers);
});

export {
  createPlayer,
  getPlayers,
  deleteAllPlayers,
  deletePlayer,
  updatePlayer,
  updateLeadingScorers,
  getLeadingScorers,
  fetchAndStorePlayerEventPoints,
  getPlayerEventPoints,
};
