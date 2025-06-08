import Player from "../models/playerModel.js";
import asyncHandler from "express-async-handler";
import PlayerTable from "../models/playerTableModel.js";
import { fetchData } from "../services/fetchManagerData.js"

const createPlayer = asyncHandler(async (req, res) => {
  const { xHandle, fplId, position, team } = req.body;
 const data = fetchData(fplId)
  const { teamName, manager } = data;
console.log(teamName, manager);
 const player = await Player.create({ teamName, manager, xHandle, fplId, position, team });
  await PlayerTable.create({
    player: player._id,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    points: 0,
  });
  res.json(player);
});
const getPlayers = asyncHandler(async (req, res) => {
const players = await Player.find({});
res.json(players)})
const deleteAllPlayers = asyncHandler(async (req, res) => {
  await Player.deleteMany({});
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

export { createPlayer, getPlayers, deleteAllPlayers, deletePlayer };
