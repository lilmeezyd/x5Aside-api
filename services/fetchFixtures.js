// services/fetchFixtures.js
import axios from "axios";
import fixtureSchema from "../models/fixtureModel.js";
import { getModel } from "../config/db.js";

export const fetchFixtures = async (dbName) => {
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  try {
    const { data } = await axios.get("https://fantasy.premierleague.com/api/fixtures/");

    const fixturesToStore = data.map(fixture => ({
      eventId: fixture.event,
      homeTeam: fixture.team_h,
      awayTeam: fixture.team_a,
    }));

    // Optional: Clear existing fixtures before inserting new ones
    await Fixture.deleteMany({});
    const savedFixtures = await Fixture.insertMany(fixturesToStore);

    console.log(`✅ Stored ${savedFixtures.length} fixtures.`);
    return savedFixtures;
  } catch (error) {
    console.error("❌ Error fetching/storing fixtures:", error.message);
    throw error;
  }
};

export const generateFixtures = (teams) => {
  const fixtures = [];

  // Copy teams so we don't mutate the original array
  let list = [...teams];

  // Add a BYE team if odd number of teams
  if (list.length % 2 !== 0) {
    list.push({ _id: null, name: "BYE" });
  }

  const totalTeams = list.length;
  const rounds = totalTeams - 1;
  const matchesPerRound = totalTeams / 2;

  // ---------- First Leg ----------
  for (let round = 0; round < rounds; round++) {
    const gameweek = [];

    for (let i = 0; i < matchesPerRound; i++) {
      const home = list[i];
      const away = list[totalTeams - 1 - i];

      if (home._id !== null && away._id !== null) {
        gameweek.push({
          eventId: round + 1,
          homeTeamPro: home,
          awayTeamPro: away,
        });
      }
    }

    fixtures.push(...gameweek);

    // Rotate teams (leave first fixed)
    list = [
      list[0],
      list[totalTeams - 1],
      ...list.slice(1, totalTeams - 1),
    ];
  }

  // ---------- Second Leg (reverse home/away) ----------
  const firstLeg = [...fixtures];

  firstLeg.forEach(match => {
    fixtures.push({
      eventId: match.eventId + rounds,
      homeTeamPro: match.awayTeamPro,
      awayTeamPro: match.homeTeamPro,
    });
  });

  return fixtures;
}
