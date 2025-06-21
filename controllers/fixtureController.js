import asyncHandler from "express-async-handler";
import Fixture from "../models/fixtureModel.js";
import Team from "../models/teamModel.js";
import PlayerEventPoints from "../models/playerPointsModel.js";
import Player from "../models/playerModel.js";
import PlayerFixture from "../models/playerFixtureModel.js";
import scoreFixtures from "../services/scoreFixtures.js";
import { fetchFixtures } from "../services/fetchFixtures.js";

const createFixtures = asyncHandler(async (req, res) => {
  await Fixture.deleteMany({});
  const fixtures = await fetchFixtures();
  res.json({ message: `${fixtures.length} fixtures added` });
});

const getFixtures = asyncHandler(async (req, res) => {
  const fixtures = await Fixture.find({}).lean();
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
});

const getFixtureById = asyncHandler(async (req, res) => {
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
  await Fixture.deleteMany({});
  await PlayerFixture.deleteMany({});
  res.json({ message: "All fixtures deleted successfully" });
});

const calculateClassicScores = asyncHandler(async (req, res) => {
  const fixtures = await Fixture.find({});

  for (const fixture of fixtures) {
    const { homeTeam, awayTeam } = fixture;
    const homePlayers = Player.find({ team: homeTeam });
    const awayPlayers = Player.find({ team: awayTeam });

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
      });

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
      });

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
  res.json({ message: "Classic scores calculated successfully" });
});

const calculateH2HScores = asyncHandler(async (req, res) => {
  const fixtures = await Fixture.find({});
  for (const fixture of fixtures) {
    const { homeTeam, awayTeam } = fixture;
    const homePlayers = await Player.find({ team: homeTeam });
    const awayPlayers = await Player.find({ team: awayTeam });
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
      });
      for (let awayPlayer of awayPlayers) {
        if (homePlayer.position === awayPlayer.position) {
          const aPPoints = await PlayerEventPoints.findOne({
            player: awayPlayer._id,
            eventId: fixture.eventId,
          });

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
});

const createPlayerFixtures = asyncHandler(async (req, res) => {
  const fixtures = await Fixture.find({});
  for (const fixture of fixtures) {
    const { homeTeam, awayTeam } = fixture;
    
    const homeId = await Team.findOne({id: homeTeam});
    const awayId = await Team.findOne({id: awayTeam});
console.log(homeId._id, awayId._id);

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
});

const getPlayerFixtures = asyncHandler(async (req, res) => {
  const playerFixtures = await PlayerFixture.find({}).populate("homePlayer").populate("awayPlayer");
  res.json(playerFixtures);
})

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
                                               })



  
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
