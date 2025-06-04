import express from "express";
const router = express.Router();
import fetchPlayerPoints from "../services/fetchPlayerPoints.js";

router.post("/admin/fetch-points/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    await fetchPlayerPoints(parseInt(eventId));
    res.json({ message: "Points fetched and stored." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;