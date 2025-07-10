import asyncHandler from "express-async-handler";
import fixtureSchema from "../models/fixtureModel.js";
import teamSchema from "../models/teamModel.js";
import playerEventPointsSchema from "../models/playerPointsModel.js";
import playerSchema from "../models/playerModel.js";
import playerFixtureSchema from "../models/playerFixtureModel.js";
import scoreFixtures from "../services/scoreFixtures.js";
import { fetchFixtures } from "../services/fetchFixtures.js";
import { getModel } from "../config/db.js"

const createFixtures = asyncHandler(async (req, res) => {
 const dbName = req.query.dbName || req.body?.dbName || "";
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
 await Fixture.deleteMany({});
  const fixtures = await fetchFixtures(dbName);
  res.json({ message: `${fixtures.length} fixtures added` });
});

const getFixtures = asyncHandler(async (req, res) => {
 const dbName = req.query.dbName || req.body?.dbName || "";
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  const Team = await getModel(dbName, "Team", teamSchema);
  const fixtures = await Fixture.find({}).lean();
  const teams = await Team.find({}).lean();
  const teamMap = {};
  const teamShortMap = {};
  for (const team of teams) {
    teamMap[team.id] = team.name;
    teamShortMap[team.id] = team.short_name;// Map FPL ID -> Team Name
  }

  
  const enrichedFixtures = fixtures.map((fixture) => ({
    ...fixture,
    homeTeamShort: teamShortMap[fixture.homeTeam],
    awayTeamShort: teamShortMap[fixture.awayTeam],
    homeTeam: teamMap[fixture.homeTeam] || fixture.homeTeam,
    awayTeam: teamMap[fixture.awayTeam] || fixture.awayTeam,
  }));
  res.json(enrichedFixtures);
});

const getFixtureById = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName || "";
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  const Team = await getModel(dbName, "Team", teamSchema);
  const fixtures = await Fixture.findById(req.params.id);

  if (fixtures) {
    // Get all teams once and map by FPL team ID
    const teams = await Team.find({}).lean();
    const teamMap = {};
    for (const team of teams) {
      teamMap[team.id] = team.name; // Map FPL ID -> Team Name
    }

    // Replace homeTeam and awayTeam with names
    const enrichedFixtures = fixtures.map((fixture) => ({
      ...fixture,
      homeTeam: teamMap[fixture.homeTeam] || fixture.homeTeam,
      awayTeam: teamMap[fixture.awayTeam] || fixture.awayTeam,
    }));

    res.json(enrichedFixtures);
  } else {
    res.status(404);
    throw new Error("Fixture not found");
  }
});

const scoreFixtureById = async (req, res) => {
  const { fixtureId } = req.params;
  const dbName = req.query.dbName || req.body?.dbName || "";
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  const Team = await getModel(dbName, "Team", teamSchema);
  const PlayerEventPoints = await getModel(dbName, "PlayerEventPoints", playerEventPointsSchema);
  const fixture = await Fixture.findById(fixtureId)
    .populate("homeTeam")
    .populate("awayTeam");

  if (!fixture) return res.status(404).json({ error: "Fixture not found" });

  if (!fixture.eventId)
    return res.status(400).json({ error: "Fixture has no eventId assigned" });

  // Get player points for each team
  const [homePlayers, awayPlayers] = await Promise.all([
    Team.findById(fixture.homeTeam._id).populate("players"),
    Team.findById(fixture.awayTeam._id).populate("players"),
  ]);

  const getPlayerPoints = async (players) => {
    const points = {};
    const all = await PlayerEventPoints.find({
      player: { $in: players.map((p) => p._id) },
      eventId: fixture.eventId,
    });

    for (const rec of all) {
      points[rec.player.toString()] = rec.eventPoints;
    }
    return points;
  };

  const [homePlayerPoints, awayPlayerPoints] = await Promise.all([
    getPlayerPoints(homePlayers.players),
    getPlayerPoints(awayPlayers.players),
  ]);

  await scoreFixtures({
    fixture,
    homeTeam: homePlayers,
    awayTeam: awayPlayers,
    homePlayerPoints,
    awayPlayerPoints,
  });

  res.json({ message: "Fixture scored successfully." });
};

const deleteAllFixtures = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName || "";
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  const PlayerFixture = await getModel(dbName, "PlayerFixture", playerFixtureSchema);
  await Fixture.deleteMany({});
  await PlayerFixture.deleteMany({});
  res.json({ message: "All fixtures deleted successfully" });
});
/*
const calculateClassicScores = asyncHandler(async (req, res) => {
  const fixtures = await Fixture.find({});

  for (const fixture of fixtures) {
    const { homeTeam, awayTeam } = fixture;
    const homeId = await Team.findOne({id: homeTeam});
    const awayId = await Team.findOne({id: awayTeam});
    
    const homePlayers = await Player.find({ team: homeId._id }).lean();
    const awayPlayers = await Player.find({ team: awayId._id }).lean();

    let homeTotal = 0;
    let awayTotal = 0;
    const homeStats = [];
    const awayStats = [];
    let homeScoreClassic = 0;
    let awayScoreClassic = 0;
    const homeResult = {};
    const awayResult = {};
    const goalsScorers = [];

    for (let player of homePlayers) {
      const playerPoints = await PlayerEventPoints.findOne({
        player: player._id,
        eventId: fixture.eventId,
      }).lean();

      const { eventPoints, eventTransfersCost } = playerPoints;
      homeTotal += eventPoints - eventTransfersCost;
      homeStats.push({
        ...player,
        points: eventPoints - eventTransfersCost,
        eventPoints,
        eventTransfersCost,
        goals: 0,
      });
    }

    for (let player of awayPlayers) {
      const playerPoints = await PlayerEventPoints.findOne({
        player: player._id,
        eventId: fixture.eventId,
      }).lean();

      const { eventPoints, eventTransfersCost } = playerPoints;
      awayTotal += eventPoints - eventTransfersCost;
      awayStats.push({
        ...player,
        points: eventPoints - eventTransfersCost,
        eventPoints,
        eventTransfersCost,
        goals: 0,
      });
    }

    if (homeTotal > awayTotal) {
      let hDiff = homeTotal - awayTotal;
      let goalsScored = Math.floor(hDiff / 20) + 1;
      homeScoreClassic += goalsScored;
      let extras = goalsScored % 5;
      let everybody = Math.floor(goalsScored / 5);
      if (everybody > 0) {
        homeStats.map((x) => {
          return { ...x, goals: x.goals + everybody };
        });
      }
      const ids = homeStats
        .sort((a, b) => b.points - a.points)
        .slice(0, extras)
        .map((x) => x._id);
      homeStats.map((x) => {
        if (ids.includes(x._id)) {
          return { ...x, goals: x.goals + 1 };
        } else {
          return x;
        }
      });
    }

    if (awayTotal > homeTotal) {
      let aDiff = awayTotal - homeTotal;
      let goalsScored = Math.floor(aDiff / 20) + 1;
      awayScoreClassic += goalsScored;
      let extras = goalsScored % 5;
      let everybody = Math.floor(goalsScored / 5);
      if (everybody > 0) {
        awayStats.map((x) => {
          return { ...x, goals: x.goals + everybody };
        });
      }
      const ids = awayStats
        .sort((a, b) => b.points - a.points)
        .slice(0, extras)
        .map((x) => x._id);
      awayStats.map((x) => {
        if (ids.includes(x._id)) {
          return { ...x, goals: x.goals + 1 };
        } else {
          return x;
        }
      });
    }
homeResult.event = fixture.eventId;
    homeResult.score = `${homeScoreClassic} : ${awayScoreClassic}`;
    awayResult.event = fixture.eventId;
    awayResult.score = `${homeScoreClassic} : ${awayScoreClassic}`;

    if (homeScoreClassic > awayScoreClassic) {
      homeResult.result = "W";
      awayResult.result = "L";
    }

    if (awayScoreClassic > homeScoreClassic) {
      homeResult.result = "L";
      awayResult.result = "W";
    }

    if (homeScoreClassic === awayScoreClassic) {
      homeResult.result = "D";
      awayResult.result = "D";
    }

    fixture.homeTotal = homeTotal;
    fixture.awayTotal = awayTotal;
    fixture.homeScoreClassic = homeScoreClassic;
    fixture.awayScoreClassic = awayScoreClassic;
    fixture.homeStats = homeStats;
    fixture.awayStats = awayStats;
    fixture.homeResultClassic = homeResult;
    fixture.awayResultClassic = awayResult;
    await fixture.save();
  }
  
  res.json({ message: "Classic scores calculated successfully" })
  });*/
const calculateClassicScores = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName || "";
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  const Team = await getModel(dbName, "Team", teamSchema);
  const Player = await getModel(dbName, "Player", playerSchema);
  const PlayerEventPoints = await getModel(dbName, "PlayerEventPoints", playerEventPointsSchema);
  const eventId = parseInt(req.params.eventId);
  const fixtures = await Fixture.find({});

  // Cache teams
  const allTeams = await Team.find({});
  const teamMap = {};
  for (const team of allTeams) {
    teamMap[team.id] = team._id.toString();
  }

  // Cache all players and group them by teamId
  const allPlayers = await Player.find({}).lean();
  const playersByTeam = {};
  for (const p of allPlayers) {
    const tid = p.team.toString();
    if (!playersByTeam[tid]) playersByTeam[tid] = [];
    playersByTeam[tid].push(p);
  }

  // Cache all points
  const allPoints = await PlayerEventPoints.find({}).lean();
  const pointsMap = {};
  for (const p of allPoints) {
    pointsMap[`${p.player}_${p.eventId}`] = p;
  }

  const bulkOps = [];

  for (const fixture of fixtures) {
    const homeTeamId = teamMap[fixture.homeTeam];
    const awayTeamId = teamMap[fixture.awayTeam];
    const eventId = fixture.eventId;

    const homePlayers = playersByTeam[homeTeamId] || [];
    const awayPlayers = playersByTeam[awayTeamId] || [];

    let homeTotal = 0;
    let awayTotal = 0;
    let homeScoreClassic = 0;
    let awayScoreClassic = 0;

    const homeStats = [];
    const awayStats = [];

    for (const p of homePlayers) {
      const points = pointsMap[`${p._id}_${eventId}`];
      if (!points) continue;
      const net = points.eventPoints - points.eventTransfersCost;
      homeTotal += net;
      homeStats.push({ ...p, points: net, goals: 0, eventPoints: points.eventPoints, eventTransfersCost: points.eventTransfersCost });
    }

    for (const p of awayPlayers) {
      const points = pointsMap[`${p._id}_${eventId}`];
      if (!points) continue;
      const net = points.eventPoints - points.eventTransfersCost;
      awayTotal += net;
      awayStats.push({ ...p, points: net, goals: 0, eventPoints: points.eventPoints, eventTransfersCost: points.eventTransfersCost });
    }

    // Determine score and goal assignment
    const assignGoals = (stats, diff) => {
      let goalsScored = Math.floor(diff / 20) + 1;
      let extras = goalsScored % 5;
      let everybody = Math.floor(goalsScored / 5);

      if (everybody > 0) {
        for (let i = 0; i < stats.length; i++) {
          stats[i].goals += everybody;
        }
      }

      const topIds = stats
        .sort((a, b) => b.points - a.points)
        .slice(0, extras)
        .map(p => p._id.toString());

      for (let i = 0; i < stats.length; i++) {
        if (topIds.includes(stats[i]._id.toString())) {
          stats[i].goals += 1;
        }
      }

      return goalsScored;
    };

    if (homeTotal > awayTotal) {
      homeScoreClassic = assignGoals(homeStats, homeTotal - awayTotal);
    } else if (awayTotal > homeTotal) {
      awayScoreClassic = assignGoals(awayStats, awayTotal - homeTotal);
    }

    // Prepare result
    const homeResult = {
      event: eventId,
      score: `${homeScoreClassic} : ${awayScoreClassic}`,
      result:
        homeScoreClassic > awayScoreClassic
          ? "W"
          : homeScoreClassic < awayScoreClassic
          ? "L"
          : "D",
    };

    const awayResult = {
      event: eventId,
      score: `${homeScoreClassic} : ${awayScoreClassic}`,
      result:
        awayScoreClassic > homeScoreClassic
          ? "W"
          : awayScoreClassic < homeScoreClassic
          ? "L"
          : "D",
    };

    // Push to bulk write array
    bulkOps.push({
      updateOne: {
        filter: { _id: fixture._id },
        update: {
          $set: {
            homeTotal,
            awayTotal,
            homeScoreClassic,
            awayScoreClassic,
            homeStats,
            awayStats,
            homeResultClassic: homeResult,
            awayResultClassic: awayResult,
          },
        },
      },
    });
  }

  if (bulkOps.length > 0) {
    await Fixture.bulkWrite(bulkOps);
  }

  res.json({ message: "Classic scores calculated successfully" });
});
const calculateH2HScores = asyncHandler(async (req, res) => {
 const dbName = req.query.dbName || req.body?.dbName || "";
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  const Team = await getModel(dbName, "Team", teamSchema);
  const Player = await getModel(dbName, "Player", playerSchema);
  const PlayerEventPoints = await getModel(dbName, "PlayerEventPoints", playerEventPointsSchema);
  const eventId = parseInt(req.params.eventId); const fixtures = await Fixture.find({});
  const allTeams = await Team.find({});
  const teamMap = {};
  for (const team of allTeams) {
    teamMap[team.id] = team._id.toString();
  }

  const allPlayers = await Player.find({}).lean();
  const playersByTeam = {};
  for (const player of allPlayers) {
    const teamId = player.team.toString();
    if (!playersByTeam[teamId]) playersByTeam[teamId] = [];
    playersByTeam[teamId].push(player);
  }

  const allPoints = await PlayerEventPoints.find({}).lean();
  const pointsMap = {};
  for (const p of allPoints) {
    pointsMap[`${p.player}_${p.eventId}`] = p;
  }

  const bulkOps = [];

  for (const fixture of fixtures) {
    const eventId = fixture.eventId;
    const homeTeamId = teamMap[fixture.homeTeam];
    const awayTeamId = teamMap[fixture.awayTeam];

    const homePlayers = playersByTeam[homeTeamId] || [];
    const awayPlayers = playersByTeam[awayTeamId] || [];

    let homeScoreH2H = 0;
    let awayScoreH2H = 0;
    const homeStats = [];
    const awayStats = [];

    for (const homePlayer of homePlayers) {
      const homePoints = pointsMap[`${homePlayer._id}_${eventId}`];
      if (!homePoints) continue;

      const netHome = homePoints.eventPoints - homePoints.eventTransfersCost;

      for (const awayPlayer of awayPlayers) {
        if (homePlayer.position !== awayPlayer.position) continue;

        const awayPoints = pointsMap[`${awayPlayer._id}_${eventId}`];
        if (!awayPoints) continue;

        const netAway = awayPoints.eventPoints - awayPoints.eventTransfersCost;

        if (netHome > netAway) {
          homeScoreH2H++;
          homeStats.push({ ...homePlayer, goals: 1, eventPoints: homePoints.eventPoints, eventTransfersCost: homePoints.eventTransfersCost });
          awayStats.push({ ...awayPlayer, goals: 0, eventPoints: awayPoints.eventPoints, eventTransfersCost: awayPoints.eventTransfersCost });
        } else if (netAway > netHome) {
          awayScoreH2H++;
          homeStats.push({ ...homePlayer, goals: 0, eventPoints: homePoints.eventPoints, eventTransfersCost: homePoints.eventTransfersCost });
          awayStats.push({ ...awayPlayer, goals: 1, eventPoints: awayPoints.eventPoints, eventTransfersCost: awayPoints.eventTransfersCost });
        } else {
          homeStats.push({ ...homePlayer, goals: 0, eventPoints: homePoints.eventPoints, eventTransfersCost: homePoints.eventTransfersCost });
          awayStats.push({ ...awayPlayer, goals: 0, eventPoints: awayPoints.eventPoints, eventTransfersCost: awayPoints.eventTransfersCost });
        }
      }
    }

    const homeResult = {
      event: eventId,
      score: `${homeScoreH2H} : ${awayScoreH2H}`,
      result:
        homeScoreH2H > awayScoreH2H
          ? "W"
          : homeScoreH2H < awayScoreH2H
          ? "L"
          : "D",
    };

    const awayResult = {
      event: eventId,
      score: `${homeScoreH2H} : ${awayScoreH2H}`,
      result:
        awayScoreH2H > homeScoreH2H
          ? "W"
          : awayScoreH2H < homeScoreH2H
          ? "L"
          : "D",
    };

    bulkOps.push({
      updateOne: {
        filter: { _id: fixture._id },
        update: {
          $set: {
            homeScoreH2H,
            awayScoreH2H,
            homeStatsH2H: homeStats,
            awayStatsH2H: awayStats,
            homeResultH2H: homeResult,
            awayResultH2H: awayResult,
          },
        },
      },
    });
  }

  if (bulkOps.length > 0) {
    await Fixture.bulkWrite(bulkOps);
  }

  res.json({ message: "H2H scores calculated successfully" });
});

/*
const calculateH2HScores = asyncHandler(async (req, res) => {
  const fixtures = await Fixture.find({});
  for (const fixture of fixtures) {
    const { homeTeam, awayTeam } = fixture; 

    const homeId = await Team.findOne({id: homeTeam});
    const awayId = await Team.findOne({id: awayTeam});
    
    const homePlayers = await Player.find({ team: homeId._id }).lean();
    const awayPlayers = await Player.find({ team: awayId._id }).lean();
    let homeScoreH2H = 0;
    let awayScoreH2H = 0;
    const homeStats = [];
    const awayStats = [];
    const homeResult = {};
    const awayResult = {};
    for (let homePlayer of homePlayers) {
      const hPPoints = await PlayerEventPoints.findOne({
        player: homePlayer._id,
        eventId: fixture.eventId,
      }).lean();
      for (let awayPlayer of awayPlayers) {
        if (homePlayer.position === awayPlayer.position) {
          const aPPoints = await PlayerEventPoints.findOne({
            player: awayPlayer._id,
            eventId: fixture.eventId,
          }).lean();

          // H2H ends in draw
          if (
            hPPoints.eventPoints - hPPoints.eventTransfersCost ===
            aPPoints.eventPoints - aPPoints.eventTransfersCost
          ) {
            awayStats.push({
              ...awayPlayer,
              goals: 0,
              eventPoints: aPPoints.eventPoints,
              eventTransfersCost: aPPoints.eventTransfersCost,
            });
            homeStats.push({
              ...homePlayer,
              goals: 0,
              eventPoints: hPPoints.eventPoints,
              eventTransfersCost: hPPoints.eventTransfersCost,
            });
          }

          // Away Player wins H2H
          if (
            hPPoints.eventPoints - hPPoints.eventTransfersCost <
            aPPoints.eventPoints - aPPoints.eventTransfersCost
          ) {
            awayScoreH2H += 1;
            awayStats.push({
              ...awayPlayer,
              goals: 1,
              eventPoints: aPPoints.eventPoints,
              eventTransfersCost: aPPoints.eventTransfersCost,
            });
            homeStats.push({
              ...homePlayer,
              goals: 0,
              eventPoints: hPPoints.eventPoints,
              eventTransfersCost: hPPoints.eventTransfersCost,
            });
          }

          // Home Player wins H2H
          if (
            hPPoints.eventPoints - hPPoints.eventTransfersCost >
            aPPoints.eventPoints - aPPoints.eventTransfersCost
          ) {
            homeScoreH2H += 1;
            homeStats.push({
              ...homePlayer,
              goals: 1,
              eventPoints: hPPoints.eventPoints,
              eventTransfersCost: hPPoints.eventTransfersCost,
            });

            awayStats.push({
              ...awayPlayer,
              goals: 0,
              eventPoints: aPPoints.eventPoints,
              eventTransfersCost: aPPoints.eventTransfersCost,
            });
          }
        }
      }
    }

    homeResult.event = fixture.eventId;
    homeResult.score = `${homeScoreH2H} : ${awayScoreH2H}`;
    awayResult.event = fixture.eventId;
    awayResult.score = `${homeScoreH2H} : ${awayScoreH2H}`;

    if (homeScoreH2H > awayScoreH2H) {
      homeResult.result = "W";
      awayResult.result = "L";
    }

    if (awayScoreH2H > homeScoreH2H) {
      homeResult.result = "L";
      awayResult.result = "W";
    }

    if (homeScoreH2H === awayScoreH2H) {
      homeResult.result = "D";
      awayResult.result = "D";
    }

    fixture.homeScoreH2H = homeScoreH2H;
    fixture.awayScoreH2H = awayScoreH2H;
    fixture.homeStatsH2H = homeStats;
    fixture.awayStatsH2H = awayStats;
    fixture.homeResultH2H = homeResult;
    fixture.awayResultH2H = awayResult;
    await fixture.save();
  }

  res.json({ message: "H2H scores calculated successfully" });
});*/
/*
const createPlayerFixtures = asyncHandler(async (req, res) => {
  const fixtures = await Fixture.find({});
  for (const fixture of fixtures) {
    const { homeTeam, awayTeam } = fixture;
    
    const homeId = await Team.findOne({id: homeTeam});
    const awayId = await Team.findOne({id: awayTeam});


    const homePlayers = await Player.find({ team: homeId._id });
    const awayPlayers = await Player.find({ team: awayId._id });
    for (let homePlayer of homePlayers) {
      for (let awayPlayer of awayPlayers) {
        if (homePlayer.position === awayPlayer.position) {
          await PlayerFixture.create({
            eventId: fixture.eventId, 
            homePlayer:
              homePlayer._id,
            awayPlayer: awayPlayer._id,
            homeTeam: homePlayer.team, 
            awayTeam:
              awayPlayer.team,
            position: homePlayer.position
          })
        }
      }
    }
  }

  res.json({ message: "Player fixtures successfully created"})
});*/

const createPlayerFixtures = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName || "";
  const PlayerFixture = await getModel(dbName, "PlayerFixture", playerFixtureSchema);
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  const Team = await getModel(dbName, "Team", teamSchema);
  const Player = await getModel(dbName, "Player", playerSchema);
  await PlayerFixture.deleteMany({});
  const eventId = parseInt(req.params.eventId);
  const fixtures = await Fixture.find({});
  

  // Build teamId lookup map
  const allTeams = await Team.find({});
  const teamMap = {};
  for (const team of allTeams) {
    teamMap[team.id] = team._id;
  }

  // Preload all players and group them by teamId and position
  const allPlayers = await Player.find({});
  const playersByTeam = {};

  for (const player of allPlayers) {
    const teamId = player.team.toString();
    if (!playersByTeam[teamId]) playersByTeam[teamId] = {};
    if (!playersByTeam[teamId][player.position]) playersByTeam[teamId][player.position] = [];
    playersByTeam[teamId][player.position].push(player);
  }

  const bulkOps = [];

  for (const fixture of fixtures) {
    const homeTeamId = teamMap[fixture.homeTeam];
    const awayTeamId = teamMap[fixture.awayTeam];

    if (!homeTeamId || !awayTeamId) continue;

    const homePlayers = playersByTeam[homeTeamId?.toString()] || {};
    const awayPlayers = playersByTeam[awayTeamId?.toString()] || {};

    for (const position of Object.keys(homePlayers)) {
      const homeGroup = homePlayers[position];
      const awayGroup = awayPlayers[position] || [];

      for (const homePlayer of homeGroup) {
        for (const awayPlayer of awayGroup) {
          bulkOps.push({
            insertOne: {
              document: {
                eventId: fixture.eventId,
                homePlayer: homePlayer._id,
                awayPlayer: awayPlayer._id,
                homeTeam: homePlayer.team,
                awayTeam: awayPlayer.team,
                position,
              },
            },
          });
        }
      }
    }
  }

  if (bulkOps.length > 0) {
    await PlayerFixture.bulkWrite(bulkOps);
  }

  res.json({ message: "Player fixtures successfully created" });
});


const getPlayerFixtures = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName || "";
  const PlayerFixture = await getModel(dbName, "PlayerFixture", playerFixtureSchema);
  
  const playerFixtures = await PlayerFixture.find({}).populate("homePlayer").populate("awayPlayer");
  res.json(playerFixtures);
})
/*
const calculatePlayerFixScores = asyncHandler(async (req, res) => {const fixtures = await PlayerFixture.find({});
  for (const fixture of fixtures) {
    const homeResult = {};
    const awayResult = {};
    const { homePlayer, awayPlayer, eventId } = fixture;
    const homePlayerPoints = await PlayerEventPoints.findOne({
      player: homePlayer,
      eventId: eventId
    });

const awayPlayerPoints = await PlayerEventPoints.findOne({
  player: awayPlayer,
  eventId: eventId
});
    let netAwayPoints = awayPlayerPoints.eventPoints - awayPlayerPoints.eventTransfersCost;
    let netHomePoints = homePlayerPoints.eventPoints - homePlayerPoints.eventTransfersCost;
    homeResult.event = fixture.eventId;
    homeResult.score = `${netHomePoints} : ${netAwayPoints}`;
    awayResult.event = fixture.eventId;
    awayResult.score = `${netHomePoints} : ${netAwayPoints}`;
    if (netHomePoints > netAwayPoints) {
      homeResult.result = "W";
     awayResult.result = "L"; }
    if (netAwayPoints > netHomePoints) {
      homeResult.result = "L";
     awayResult.result = "W"; }
    if (netHomePoints === netAwayPoints) {
      homeResult.result = "D";
      awayResult.result = "D";
    }
    fixture.homeResult = homeResult;
   fixture.awayResult = awayResult;
    fixture.homeScore = netHomePoints;
    fixture.awayScore = netAwayPoints;
    await fixture.save();
  }
                     
                                                                  res.json({ message: "Player fixture scores calculated successfully"})
                                               })*/

const calculatePlayerFixScores = asyncHandler(async (req, res) => {
  const dbName = req.query.dbName || req.body?.dbName || "";
  const PlayerFixture = await getModel(dbName, "PlayerFixture", playerFixtureSchema);
  const PlayerEventPoints = await getModel(dbName, "PlayerEventPoints", playerEventPointsSchema);
  const eventId = parseInt(req.params.eventId);
  // 1. Fetch all fixtures
  const fixtures = await PlayerFixture.find({});

  // 2. Build set of needed { player, eventId } pairs
  const pointQueryKeys = [];
  const fixtureKeyMap = {}; // To match keys back to fixtures

  for (const fixture of fixtures) {
    const { homePlayer, awayPlayer, eventId } = fixture;
    const homeKey = `${homePlayer}_${eventId}`;
    const awayKey = `${awayPlayer}_${eventId}`;
    pointQueryKeys.push(homeKey, awayKey);
    fixtureKeyMap[fixture._id] = {
      fixture,
      homeKey,
      awayKey,
    };
  }

  // 3. Fetch all PlayerEventPoints at once
  const allPlayerEventPoints = await PlayerEventPoints.find({
    $or: pointQueryKeys.map(key => {
      const [player, eventId] = key.split("_");
      return { player, eventId };
    }),
  });

  // 4. Index PlayerEventPoints by `${player}_${eventId}`
  const pointsMap = {};
  for (const pep of allPlayerEventPoints) {
    const key = `${pep.player}_${pep.eventId}`;
    pointsMap[key] = pep;
  }

  // 5. Prepare bulk update ops
  const bulkOps = [];

  for (const [fixtureId, { fixture, homeKey, awayKey }] of Object.entries(fixtureKeyMap)) {
    const homePoints = pointsMap[homeKey];
    const awayPoints = pointsMap[awayKey];

    if (!homePoints || !awayPoints) continue; // Skip if points missing

    const netHome = homePoints.eventPoints - homePoints.eventTransfersCost;
    const netAway = awayPoints.eventPoints - awayPoints.eventTransfersCost;

    const result = {
      homeResult: {
        event: fixture.eventId,
        score: `${netHome} : ${netAway}`,
        result: netHome > netAway ? "W" : netHome < netAway ? "L" : "D",
      },
      awayResult: {
        event: fixture.eventId,
        score: `${netHome} : ${netAway}`,
        result: netAway > netHome ? "W" : netAway < netHome ? "L" : "D",
      },
      homeScore: netHome,
      awayScore: netAway,
    };

    bulkOps.push({
      updateOne: {
        filter: { _id: fixtureId },
        update: {
          $set: result,
        },
      },
    });
  }

  // 6. Apply all updates in one bulkWrite
  if (bulkOps.length > 0) {
    await PlayerFixture.bulkWrite(bulkOps);
  }

  res.json({ message: "Player fixture scores calculated successfully" });
});


  
export {
  createFixtures,
  getFixtures,
  getFixtureById,
  scoreFixtureById,
  deleteAllFixtures,
  calculateClassicScores,
  calculateH2HScores,
  createPlayerFixtures,
  calculatePlayerFixScores,
  getPlayerFixtures
};
