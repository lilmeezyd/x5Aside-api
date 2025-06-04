import Fixture from "../models/fixtureModel.js";
import Team from "../models/teamModel.js";
import Player from "../models/playerModel.js";
import PlayerEventPoints from "../models/playerPointsModel.js";
import TeamClassic from "../models/teamClassicModel.js";
import TeamH2H from "../models/teamH2HModel.js";
import PlayerTable from "../models/playerTableModel.js";

const scoreFixture = async (fixtureId) => {
  const fixture = await Fixture.findById(fixtureId).lean();
  if (!fixture || fixture.isPlayed) return;

  const [homeTeam, awayTeam] = await Promise.all([
    Team.findById(fixture.homeTeam).populate("players"),
    Team.findById(fixture.awayTeam).populate("players"),
  ]);

  const eventId = fixture.eventId;

  const getPlayerPoints = async (players) => {
    const ids = players.map((p) => p._id);
    const points = await PlayerEventPoints.find({
      player: { $in: ids },
      eventId,
    });
    const pointMap = {};
    for (let p of points) {
      pointMap[p.player.toString()] = p.eventPoints || 0;
    }
    return pointMap;
  };

  const homePointsMap = await getPlayerPoints(homeTeam.players);
  const awayPointsMap = await getPlayerPoints(awayTeam.players);

  let homeTotal = 0;
  let awayTotal = 0;
  let h2hGoalsHome = 0;
  let h2hGoalsAway = 0;

  const positionOrder = ["Captain", "Ace", "Fwd", "Mid", "Def"];
  for (const pos of positionOrder) {
    const homePlayer = homeTeam.players.find((p) => p.position === pos);
    const awayPlayer = awayTeam.players.find((p) => p.position === pos);

    const hPoint = homePointsMap[homePlayer._id.toString()] || 0;
    const aPoint = awayPointsMap[awayPlayer._id.toString()] || 0;

    homeTotal += hPoint;
    awayTotal += aPoint;

    // H2H goals
    if (hPoint > aPoint) h2hGoalsHome += 1;
    else if (aPoint > hPoint) h2hGoalsAway += 1;

    await updatePlayerTable({
  eventId,
  homePlayer,
  awayPlayer,
  homePoints: hPoint,
  awayPoints: aPoint
});
    

    // Player vs Player table logic can go here later
  }

  // CLASSIC GOAL CALCULATION
  const pointDiff = Math.abs(homeTotal - awayTotal);
  const getClassicGoals = (pointsA, pointsB) => {
    if (pointsA === pointsB) return 0;
    return Math.floor(Math.max(pointsA, pointsB) / 10); // 1 goal per 10pts
  };

  const classicGoalsHome = getClassicGoals(homeTotal, awayTotal);
  const classicGoalsAway = getClassicGoals(awayTotal, homeTotal);

  const classicResult =
    homeTotal > awayTotal
      ? "HOME_WIN"
      : homeTotal < awayTotal
        ? "AWAY_WIN"
        : "DRAW";

  const h2hResult =
    h2hGoalsHome > h2hGoalsAway
      ? "HOME_WIN"
      : h2hGoalsHome < h2hGoalsAway
        ? "AWAY_WIN"
        : "DRAW";

  // Update Fixture
  await Fixture.findByIdAndUpdate(fixtureId, {
    homePoints: homeTotal,
    awayPoints: awayTotal,
    h2hGoalsHome,
    h2hGoalsAway,
    classicResult,
    h2hResult,
    isPlayed: true,
  });

  // Update team & player tables here...
  await updateTeamTables({
    eventId,
    homeTeam,
    awayTeam,
    classicResult,
    h2hResult,
    classicGoalsHome,
    classicGoalsAway,
  });

  console.log(`Fixture ${fixtureId} scored`);
};
