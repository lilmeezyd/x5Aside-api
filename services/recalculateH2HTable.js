const recalculateH2HTable = async () => {
  const fixtures = await Fixture.find({});
  const teams = await Team.find({});
  const teamIdMap = {};
  for (const team of teams) {
    teamIdMap[team.id] = team._id.toString();
  }

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
};
