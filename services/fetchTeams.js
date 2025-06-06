import axios from "axios";
import Team from "../models/teamModel.js";

export const fetchAndStoreFPLTeams = async () => {
  try {
    const { data } = await axios.get(
      "https://fantasy.premierleague.com/api/bootstrap-static/"
    );

    const teams = data.teams.map((team) => ({
      id: team.id,
      name: team.name,
      short_name: team.short_name
    }));

    // Fetch all existing team FPL IDs
    const existingTeamIds = await Team.find({}, 'id').then((docs) =>
      docs.map((doc) => doc.id)
    );

    // Filter only new teams
    const newTeams = teams.filter(
      (team) => !existingTeamIds.includes(team.id)
    );


    // Insert only the new teams
    if (newTeams.length > 0) {
     await Team.insertMany(newTeams);
      console.log(`✅ Stored ${newTeams.length} new teams.`);
    } else {
      console.log("ℹ️ All teams already exist. Skipped insertion.");
    }

    // Return all teams in DB
    const allTeams = await Team.find({});
    return allTeams;
  } catch (error) {
    console.error("❌ Error fetching or storing teams:", error.message);
    return [];
  }
};
