import PlayerEventPoints from "../models/playerPointsModel.js";
import Player from "../models/playerModel.js";
import axios from "axios";

async function fetchPlayerPoints(eventId, players) {
  for (const player of players) {
    const url = `https://fantasy.premierleague.com/api/entry/${player.fplId}/history/`;
    try {
      const res = await axios.get(url);
      const current = res.data.current.find((ev) => ev.event === eventId);
      if (!current) continue;

      await PlayerEventPoints.findOneAndUpdate(
        { player: player._id, eventId },
        {
          player: player._id,
          eventId,
          fplId: player.fplId,
          eventPoints: current.points,
          eventTransfersCost: current.event_transfers_cost,
        },
        { upsert: true, new: true },
      );
    } catch (err) {
      console.error(`FPL API error for ${player.name}:`, err.message);
    }
  }
}

export default fetchPlayerPoints;
