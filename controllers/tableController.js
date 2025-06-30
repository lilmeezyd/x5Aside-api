import asyncHandler from "express-async-handler";
import teamSchema from "../models/teamModel.js";
import teamClassicSchema from "../models/teamClassicModel.js";
import teamH2HSchema from "../models/teamH2HModel.js";
import playerTableSchema from "../models/playerTableModel.js";
import playerFixtureSchema from "../models/playerFixtureModel.js";
import fixtureSchema from "../models/fixtureModel.js";
import { getModel } from "../config/db.js";

const getClassicTable = asyncHandler(async (req, res) => {
  const eventId = parseInt(req.query.eventId);
  const dbName = req.query.dbName || req.user?.dbName || ""; 
  const TeamClassic = await getModel(dbName, "TeamClassic", teamClassicSchema);
  const Team = await getModel(dbName, "Team", teamSchema);
  
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
  const dbName = req.query.dbName || req.user?.dbName || "";
  const TeamH2H = await getModel(dbName, "TeamH2H", teamH2HSchema);
  const Team = await getModel(dbName, "Team", teamSchema);
  
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
  const dbName = req.query.dbName || req.user?. dbName || "";
  const PlayerTable = await getModel(dbName, "PlayerTable", playerTableSchema);
  const Player = await getModel(dbName, "Player", playerSchema);
  
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
/*
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
    console.log(row)
    for (const fixture of fixtures) {
      const homeId = await Team.findOne({id: fixture.homeTeam});
      const awayId = await Team.findOne({id:fixture.awayTeam});     
      if ((row.team.toString() === homeId._id.toString()) || (row.team.toString() === awayId._id.toString())) {
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
    console.log(P, W, D, L, GF, GA, GD, totalPoints,);
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
});*/
const updateClassicTable = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.user?.dbName || "";
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  const Team = await getModel(dbName, "Team", teamSchema);
  const TeamClassic = await getModel(dbName, "TeamClassic", teamClassicSchema);
  const eventId = parseInt(req.params.eventId);
  
  const fixtures = await Fixture.find({});
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

    if (!fixturesByTeam[homeTeamId]) fixturesByTeam[homeTeamId] = [];
    if (!fixturesByTeam[awayTeamId]) fixturesByTeam[awayTeamId] = [];

    fixturesByTeam[homeTeamId].push({ fixture, isHome: true });
    fixturesByTeam[awayTeamId].push({ fixture, isHome: false });
  }

  const table = await TeamClassic.find({});
  const bulkOps = [];

  for (const row of table) {
    const tid = row.team.toString();
    const relevant = fixturesByTeam[tid] || [];

    let P = 0, W = 0, D = 0, L = 0, GF = 0, GA = 0, GD = 0, points = 0;
    const results = [];

    for (const { fixture, isHome } of relevant) {
      const homeScore = fixture.homeScoreClassic;
      const awayScore = fixture.awayScoreClassic;
      const result = isHome ? fixture.homeResultClassic : fixture.awayResultClassic;

      P++;
      results.push(result);

      if (isHome) {
        GF += homeScore;
        GA += awayScore;
        GD += homeScore - awayScore;
        if (homeScore > awayScore) W++, points += 3;
        else if (homeScore < awayScore) L++;
        else D++, points += 1;
      } else {
        GF += awayScore;
        GA += homeScore;
        GD += awayScore - homeScore;
        if (awayScore > homeScore) W++, points += 3;
        else if (awayScore < homeScore) L++;
        else D++, points += 1;
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

  res.json({ message: "Classic table updated successfully" });
});

/*
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
});*/
const updateH2HTable = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.user?.dbName || "";
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  const Team = await getModel(dbName, "Team", teamSchema);
  const TeamH2H = await getModel(dbName, "TeamH2H", teamH2HSchema);
  const eventId = parseInt(req.params.eventId);
  const fixtures = await Fixture.find({});
  const teams = await Team.find({});
  const teamIdMap = {};
  for (const team of teams) {
    teamIdMap[team.id] = team._id.toString();
  }

  // Group fixtures by teamId for quick access
  const fixturesByTeam = {};
  for (const fixture of fixtures) {
    const homeTeamId = teamIdMap[fixture.homeTeam];
    const awayTeamId = teamIdMap[fixture.awayTeam];

    if (!fixturesByTeam[homeTeamId]) fixturesByTeam[homeTeamId] = [];
    if (!fixturesByTeam[awayTeamId]) fixturesByTeam[awayTeamId] = [];

    fixturesByTeam[homeTeamId].push({ fixture, isHome: true });
    fixturesByTeam[awayTeamId].push({ fixture, isHome: false });
  }

  const table = await TeamH2H.find({});
  const bulkOps = [];

  for (const row of table) {
    const tid = row.team.toString();
    const relevant = fixturesByTeam[tid] || [];

    let P = 0, W = 0, D = 0, L = 0, GF = 0, GA = 0, GD = 0, points = 0;
    const results = [];

    for (const { fixture, isHome } of relevant) {
      const homeScore = fixture.homeScoreH2H;
      const awayScore = fixture.awayScoreH2H;
      const result = isHome ? fixture.homeResultH2H : fixture.awayResultH2H;

      P++;
      results.push(result);
      if (isHome) {
        GF += homeScore;
        GA += awayScore;
        GD += homeScore - awayScore;
        if (homeScore > awayScore) W++, points += 3;
        else if (homeScore < awayScore) L++;
        else D++, points += 1;
      } else {
        GF += awayScore;
        GA += homeScore;
        GD += awayScore - homeScore;
        if (awayScore > homeScore) W++, points += 3;
        else if (awayScore < homeScore) L++;
        else D++, points += 1;
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

  res.json({ message: "H2H table updated successfully" });
});

/*const updatePlayerTable = asyncHandler(async (req, res) => {
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
});*/

const updatePlayerTable = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.user?.dbName || "";
  const Team = await getModel(dbName, "Team", teamSchema);
  const PlayerTable = await getModel(dbName, "PlayerTable", playerTableSchema);
  const PlayerFixture = await getModel(dbName, "PlayerFixture", playerFixtureSchema);
  const Player = await getModel(dbName, "Player", playerSchema);
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  
  
  const eventId = parseInt(req.params.eventId);
  const fixtures = await PlayerFixture.find({});
  const table = await PlayerTable.find({});

  // 1. Group fixtures by player ID
  const playerFixturesMap = {};

  for (const fixture of fixtures) {
    const homeId = fixture.homePlayer.toString();
    const awayId = fixture.awayPlayer.toString();

    if (!playerFixturesMap[homeId]) playerFixturesMap[homeId] = [];
    if (!playerFixturesMap[awayId]) playerFixturesMap[awayId] = [];

    playerFixturesMap[homeId].push({
      isHome: true,
      score: fixture.homeScore,
      oppScore: fixture.awayScore,
      result: fixture.homeResult,
    });

    playerFixturesMap[awayId].push({
      isHome: false,
      score: fixture.awayScore,
      oppScore: fixture.homeScore,
      result: fixture.awayResult,
    });
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
