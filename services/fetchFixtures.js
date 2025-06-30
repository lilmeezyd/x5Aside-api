// services/fetchFixtures.js
import axios from "axios";
import fixtureSchema from "../models/fixtureModel.js";

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
