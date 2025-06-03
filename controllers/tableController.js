import asyncHandler from "express-async-handler";
import TeamClassic from "../models/teamClassicModel.js";
import TeamH2H from "../models/teamH2HModel.js";
import PlayerTable from "../models/playerTableModel.js";

const getClassicTable = asyncHandler(async (req, res) => {
  const eventId = parseInt(req.query.eventId);
  const table = await TeamClassic.find().populate("team").lean();
  const sorted = table.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - a.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
  res.json(sorted);
});

const getH2HTable = asyncHandler(async (req, res) => {
  const eventId = parseInt(req.query.eventId);
  const table = await TeamH2H.find().populate("team").lean();
  const sorted = table.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - a.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
    return b.goalsFor - a.goalsFor;
  });
  res.json(sorted);
});

const getPlayerTable = asyncHandler(async (req, res) => {
    const eventId = parseInt(req.query.eventId);
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

export { getClassicTable, getH2HTable, getPlayerTable }