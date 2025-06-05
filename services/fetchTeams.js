
import axios from 'axios';
import Team from '../models/teamModel.js';

export const fetchAndStoreFPLTeams = async () => {
  try {
    const { data } = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/');
    
    const teams = data.teams.map(team => ({
      id: team.id,
      name: team.name,
      short_name: team.short_name,
      players: [],
    }));

    // Optional: Clear existing FPL teams before saving new ones
    await Team.deleteMany({});
   const savedTeams = await Team.insertMany(teams);
    if(savedTeams.length === 20 && teams.length === 20) return savedTeams;

    console.log(`✅ Stored ${teams.length} teams.`);
  } catch (error) {
    console.error('❌ Error fetching or storing teams:', error.message);
  }
};
