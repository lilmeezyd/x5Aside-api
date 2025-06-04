import cron from "node-cron";
import fetchPlayerPoints from "./services/fetchPlayerPoints.js"; 

const scheduleFPLUpdates = () => {
  // Runs every Monday at 6am UTC
  cron.schedule("0 6 * * 1", async () => {
    const eventId = getCurrentEventId(); // implement this based on current date or config
    await fetchPlayerPoints(eventId);
  });
};

export default scheduleFPLUpdates;