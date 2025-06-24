import asyncHandler from "express-async-handler";
import Team from "../models/teamModel.js";
import TeamClassic from "../models/teamClassicModel.js";
import TeamH2H from "../models/teamH2HModel.js";
import PlayerTable from "../models/playerTableModel.js";
import PlayerFixture from "../models/playerFixtureModel.js";
import Fixture from "../models/fixtureModel.js";

const getClassicTable = asyncHandler(async (req, res) => {
  const eventId = parseInt(req.query.eventId);
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
/*
const getClassicTable = asyncHandler(async (req, res) => {
  let eventId = parseInt(req.query.eventId);
  if (isNaN(eventId)) {
    res.status(400);
    throw new Error("Missing or invalid eventId");
    eventId = 38;
  }

  const table = await TeamClassic.find().populate("team").lean();

  const processedTable = table.map((entry) => {
    const resultsUpToEvent = entry.recentResults.filter(
      (r) => r.eventId <= eventId,
    );

    let wins = 0,
      draws = 0,
      losses = 0;
    let goalsFor = 0,
      goalsAgainst = 0;

    for (const r of resultsUpToEvent) {
      if (r.result === "W") wins++;
      else if (r.result === "D") draws++;
      else if (r.result === "L") losses++;

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
      points,
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
});*/

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
});
/*
const getH2HTable = asyncHandler(async (req, res) => {
  let eventId = parseInt(req.query.eventId);
  if (isNaN(eventId)) {
    /*res.status(400);
    throw new Error("Missing or invalid eventId");
    eventId = 38;
  }

  const table = await TeamH2H.find().populate("team").lean();

  const processedTable = table.map((entry) => {
    const resultsUpToEvent = entry.recentResults.filter(
      (r) => r.eventId <= eventId,
    );

    let wins = 0,
      draws = 0,
      losses = 0;
    let goalsFor = 0,
      goalsAgainst = 0;

    for (const r of resultsUpToEvent) {
      if (r.result === "W") wins++;
      else if (r.result === "D") draws++;
      else if (r.result === "L") losses++;

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
      points,
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
});*/

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

const updateClassicTable = asyncHandler(async (req, res) => {
  const eventId = parseInt(req.params.eventId);
  const fixtures = await Fixture.find({});
  const table = await TeamClassic.find({});

  for (const row of table) {
    let totalPoints = 0;
    let GF = 0;
    let GA = 0;
    let W = 0;
    let D = 0;
    let L = 0;
    let P = 0;
    let GD = 0;
    const results = [];
    for (const fixture of fixtures) {
      const homeId = await Team.findOne({id: fixture.homeTeam});
      const awayId = await Team.findOne({id:fixture.awayTeam});      if ((row.team.toString() === homeId._id.toString()) || (row.team.toString() === awayId._id.toString())) {
        P++;
        // Update team stats if they're home
        if (row.team.toString() === homeId._id.toString())  {
          results.push(fixture.homeResultClassic);
          GF += fixture.homeScoreClassic;
          GA += fixture.awayScoreClassic;
          GD += fixture.homeScoreClassic - fixture.awayScoreClassic;
          if (fixture.homeScoreClassic > fixture.awayScoreClassic) {
            W++;
            totalPoints += 3;
          
        } else if (fixture.homeScoreClassic < fixture.awayScoreClassic) {
          L++;
        } else {
          D++;
          totalPoints += 1;
        }
        }
        // Update teams stats if they're away
        if (row.team.toString() === awayId._id.toString()) {
          results.push(fixture.awayResultClassic);
          GF += fixture.awayScoreClassic;
          GA += fixture.homeScoreClassic;
          GD += fixture.awayScoreClassic - fixture.homeScoreClassic;
          if (fixture.homeScoreClassic > fixture.awayScoreClassic) {
            L++;
          
        } else if (fixture.homeScoreClassic < fixture.awayScoreClassic) {
          W++;
          totalPoints += 3;
        } else {
          D++;
          totalPoints += 1;
        }
      }
      }
    }
    row.played = P;
    row.win = W;
    row.draw = D;
    row.loss = L;
    row.goalsFor = GF;
    row.goalsAgainst = GA;
    row.goalDifference = GD;
    row.points = totalPoints;
    row.result = results;
    await row.save();
  }

  res.json({ message: "Classic table updated successfully" });
});

const updateH2HTable = asyncHandler(async (req, res) => {
  {
    const eventId = parseInt(req.params.eventId);
    const fixtures = await Fixture.find({});
    const table = await TeamH2H.find({});

    for (const row of table) {
      let totalPoints = 0;
      let GF = 0;
      let GA = 0;
      let W = 0;
      let D = 0;
      let L = 0;
      let P = 0;
      let GD = 0;
      const results = [];
      for (const fixture of fixtures) {
        const homeId = await Team.findOne({id: fixture.homeTeam});
        const awayId = await Team.findOne({id:fixture.awayTeam});      if ((row.team.toString() === homeId._id.toString()) || (row.team.toString() === awayId._id.toString())) {
          P++;
          // Update team stats if they're home
          if (row.team.toString() === homeId._id.toString()) {
            results.push(fixture.homeResultH2H);
            GF += fixture.homeScoreH2H;
            GA += fixture.awayScoreH2H;
            GD += fixture.homeScoreH2H - fixture.awayScoreH2H;
            if (fixture.homeScoreH2H > fixture.awayScoreH2H) {
              W++;
              totalPoints += 3;
            
          } else if (fixture.homeScoreH2H < fixture.awayScoreH2H) {
            L++;
          } else {
            D++;
            totalPoints += 1;
          }
        }

          // Update teams stats if they're away
          if (row.team.toString() === awayId._id.toString() ){
            results.push(fixture.awayResultH2H);
            GF += fixture.awayScoreH2H;
            GA += fixture.homeScoreH2H;
            GD += fixture.awayScoreH2H - fixture.homeScoreH2H;
            if (fixture.homeScoreH2H > fixture.awayScoreH2H) {
              L++;
          } else if (fixture.homeScoreH2H < fixture.awayScoreH2H) {
            W++;
            totalPoints += 3;
          } else {
            D++;
            totalPoints += 1;
          }
        }
      }
      }
      row.played = P;
      row.win = W;
      row.draw = D;
      row.loss = L;
      row.goalsFor = GF;
      row.goalsAgainst = GA;
      row.goalDifference = GD;
      row.points = totalPoints;
      row.result = results;
      await row.save();
    }

    res.json({ message: "H2H table updated successfully" });
  }
});

const updatePlayerTable = asyncHandler(async (req, res) => {
  const fixtures = await PlayerFixture.find({});
  const table = await PlayerTable.find({});

  for (const row of table) {
    let totalPoints = 0;
    let GF = 0;
    let GA = 0;
    let W = 0;
    let D = 0;
    let L = 0;
    let P = 0;
    let GD = 0;
    const results = [];
    for (const fixture of fixtures) 
    {
      if (row.player.toString() === fixture.homePlayer.toString()) {
        P++;
        results.push(fixture.homeResult);
        GF += fixture.homeScore;
        GA += fixture.awayScore;
        GD += fixture.homeScore - fixture.awayScore;
        if (fixture.homeScore > fixture.awayScore) {
          W++;
          totalPoints += 3;
        } else if (fixture.homeScore < fixture.awayScore) {
          L++;
        } else {
          D++;
          totalPoints += 1;
        }
      }

      if (row.player.toString() === fixture.awayPlayer.toString()) {
        P++;
        results.push(fixture.awayResult);
        GF += fixture.awayScore;
        GA += fixture.homeScore;
        GD += fixture.awayScore - fixture.homeScore;
        if (fixture.homeScore > fixture.awayScore) {
          L++;
        } else if (fixture.homeScore < fixture.awayScore) {
          W++;
          totalPoints += 3;
        } else {
          D++;
          totalPoints += 1;
        }
      }
    }
    row.played = P;
    row.win = W;
    row.draw = D;
    row.loss = L;
    row.pointsFor = GF;
    row.pointsAgainst = GA;
    row.pointsDifference = GD;
    row.points = totalPoints;
    row.result = results;
    await row.save();
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
