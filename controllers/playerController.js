import Player from "../models/playerModel.js";
import asyncHandler from "express-async-handler";
import PlayerTable from "../models/playerTableModel.js";
import { fetchData } from "../services/fetchManagerData.js";
import PlayerEventPoints from "../models/playerPointsModel.js";
import Team from "../models/teamModel.js";
import axios from "axios";
const createPlayer = asyncHandler(async (req, res) => {
  const { xHandle, fplId, position, team } = req.body;
  const data = await fetchData(fplId);
  const { teamName, manager } = data;
  if(team === null) {
    res.status(400);
    throw new Error("No team added");
  }
  if (!fplId || ! position || !teamName || !manager) {
    res.status(400);
    throw new Error("Invalid data");
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
  res.json({manager: player.manager});
});
const getPlayers = asyncHandler(async (req, res) => {
  const players = await Player.find({});
  res.json(players);
});
const deleteAllPlayers = asyncHandler(async (req, res) => {
  await Player.deleteMany({});
  await PlayerEventPoints.deleteMany({});
  res.json({ message: "All players deleted" });
});

const deletePlayer = asyncHandler(async (req, res) => {
  const player = await Player.findById(req.params.id);
  if (player) {
    await Player.deleteOne({ _id: player._id }); // Use deleteOne instead of remove
    res.json({ message: "Player removed" });
  } else {
    res.status(404);
    throw new Error("Player not found");
  }
});

const fetchAndStorePlayerEventPoints = async (req, res) => {
  try {
    const players = await Player.find();

    for (const player of players) {
      const { fplId, _id: playerId } = player;

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
              totalPoints: event.total_points
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
};
const getPlayerEventPoints = asyncHandler(async (req, res) => {
  try {
    const { playerId } = req.params;
    const playerEventPoints = await PlayerEventPoints.find({ player: playerId });
    res.status(200).json(playerEventPoints);
  } catch (error) {
    console.error("Error fetching player event points:", error.message);
    res.status(500).json({ error: "Failed to fetch player event points." });
  }
});


export { createPlayer, getPlayers, deleteAllPlayers, deletePlayer, 
fetchAndStorePlayerEventPoints,
       getPlayerEventPoints };
