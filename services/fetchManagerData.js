// services/fetchManagerData.js
import axios from "axios";

export const fetchData = async (fplId) => {
  try {
    const { data } = await axios.get(`https://fantasy.premierleague.com/api/entry/${fplId}?format=json`);

    const manager = `${data.player_first_name} ${data.player_last_name}`;
    const teamName = data.name;
    console.log(`Fetched data for FPL ID ${fplId}: ${manager} - ${teamName}`);
    

    return { teamName, manager };
  } catch (error) {
    console.error(`❌ Error fetching data for FPL ID ${fplId}:`, error.message);
    throw error;
  }
};
