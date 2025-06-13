import asyncHandler from "express-async-handler";
import TeamClassic from "../models/teamClassicModel.js";
import TeamH2H from "../models/teamH2HModel.js";
import PlayerTable from "../models/playerTableModel.js";

/*
const getClassicTable = asyncHandler(async (req, res) => {
  const eventId = parseInt(req.query.eventId);
  const table = await TeamClassic.find().populate("team").lean();
  const sorted = table.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.goalsFor - a.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;
  
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

    return a.team.id - b.team.id;
  });
  res.json(sorted);
});*/

const getClassicTable = asyncHandler(async (req, res) => {
  let eventId = parseInt(req.query.eventId);
  if (isNaN(eventId)) {
    /*res.status(400);
    throw new Error("Missing or invalid eventId");*/
    eventId = 38;
  }

  const table = await TeamClassic.find().populate("team").lean();

  const processedTable = table.map((entry) => {
    const resultsUpToEvent = entry.recentResults.filter(r => r.eventId <= eventId);

    let wins = 0, draws = 0, losses = 0;
    let goalsFor = 0, goalsAgainst = 0;

    for (const r of resultsUpToEvent) {
      if (r.result === 'W') wins++;
      else if (r.result === 'D') draws++;
      else if (r.result === 'L') losses++;

      goalsFor += r.goalsFor;
      goalsAgainst += r.goalsAgainst;
    }

    const played = wins + draws + losses;
    const points = wins * 3 + draws;

    return {
      ...entry,
      played,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      points
    };
  });

  const sorted = processedTable.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;

    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

    return a.team.id - b.team.id;
  });

  res.json(sorted);
});

/*
const getH2HTable = asyncHandler(async (req, res) => {
  const eventId = parseInt(req.query.eventId);
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
});*/

const getH2HTable = asyncHandler(async (req, res) => {
  let eventId = parseInt(req.query.eventId);
  if (isNaN(eventId)) {
    /*res.status(400);
    throw new Error("Missing or invalid eventId");*/
    eventId = 38;
  }

  const table = await TeamH2H.find().populate("team").lean();

  const processedTable = table.map((entry) => {
    const resultsUpToEvent = entry.recentResults.filter(r => r.eventId <= eventId);

    let wins = 0, draws = 0, losses = 0;
    let goalsFor = 0, goalsAgainst = 0;

    for (const r of resultsUpToEvent) {
      if (r.result === 'W') wins++;
      else if (r.result === 'D') draws++;
      else if (r.result === 'L') losses++;

      goalsFor += r.goalsFor;
      goalsAgainst += r.goalsAgainst;
    }

    const played = wins + draws + losses;
    const points = wins * 3 + draws;

    return {
      ...entry,
      played,
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      points
    };
  });

  const sorted = processedTable.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;

    const gdA = a.goalsFor - a.goalsAgainst;
    const gdB = b.goalsFor - b.goalsAgainst;
    if (gdB !== gdA) return gdB - gdA;

    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;

    return a.team.id - b.team.id;
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

const updateClassicTable = asyncHandler(async (req, res) => {});

const updateH2HTable = asyncHandler(async (req, res) => {});

const updatePlayerTable = asyncHandler(async (req, res) => {});

export { getClassicTable, getH2HTable, getPlayerTable,
       updateClassicTable,
       updateH2HTable, updatePlayerTable };
