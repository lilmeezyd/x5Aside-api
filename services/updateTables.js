import TeamClassic from "../models/teamClassicModel.js";
import TeamH2H from "../models/teamH2HModel.js";

const updateTeamTables = async ({
  eventId,
  homeTeam,
  awayTeam,
  classicResult,
  h2hResult,
  classicGoalsHome,
  classicGoalsAway,
}) => {
  const updateStats = (record, result, goalsFor, goalsAgainst) => {
    record.played += 1;
    record.goalsFor += goalsFor;
    record.goalsAgainst += goalsAgainst;
    record.goalDifference = record.goalsFor - record.goalsAgainst;

    switch (result) {
      case "WIN":
        record.wins += 1;
        record.points += 3;
        break;
      case "DRAW":
        record.draws += 1;
        record.points += 1;
        break;
      case "LOSS":
        record.losses += 1;
        break;
    }

    record.lastFive.push({
      eventId,
      result: result === "WIN" ? "W" : result === "DRAW" ? "D" : "L",
    });

    if (record.lastFive.length > 5) record.lastFive.shift();
  };

  const getResultType = (type, isHome) => {
    if (type === "DRAW") return "DRAW";
    if ((type === "HOME_WIN" && isHome) || (type === "AWAY_WIN" && !isHome))
      return "WIN";
    return "LOSS";
  };

  const [
    homeClassic = new TeamClassic({
      team: homeTeam._id,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      lastFive: [],
    }),
    awayClassic = new TeamClassic({
      team: awayTeam._id,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      lastFive: [],
    }),
    homeH2H = new TeamH2H({
      team: homeTeam._id,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      lastFive: [],
    }),
    awayH2H = new TeamH2H({
      team: awayTeam._id,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      lastFive: [],
    }),
  ] = await Promise.all([
    TeamClassic.findOne({ team: homeTeam._id }),
    TeamClassic.findOne({ team: awayTeam._id }),
    TeamH2H.findOne({ team: homeTeam._id }),
    TeamH2H.findOne({ team: awayTeam._id }),
  ]);

  // Classic
  const homeClassicResult = getResultType(classicResult, true);
  const awayClassicResult = getResultType(classicResult, false);

  updateStats(
    homeClassic,
    homeClassicResult,
    classicGoalsHome,
    classicGoalsAway,
  );
  updateStats(
    awayClassic,
    awayClassicResult,
    classicGoalsAway,
    classicGoalsHome,
  );

  // H2H
  const homeH2HResult = getResultType(h2hResult, true);
  const awayH2HResult = getResultType(h2hResult, false);

  updateStats(homeH2H, homeH2HResult, h2hGoalsHome, h2hGoalsAway);
  updateStats(awayH2H, awayH2HResult, h2hGoalsAway, h2hGoalsHome);

  await Promise.all([
    homeClassic.save(),
    awayClassic.save(),
    homeH2H.save(),
    awayH2H.save(),
  ]);
};
