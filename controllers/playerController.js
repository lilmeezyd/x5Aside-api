import Player from "../models/playerModel.js";
import asyncHandler from "express-async-handler";
import PlayerTable from "../models/playerTableModel.js";

const createPlayer = asyncHandler(async (req, res) => {
  const { name, xHandle, fplId, position } = req.body;
  const player = await Player.create({ name, xHandle, fplId, position });
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
export { createPlayer, getPlayers };