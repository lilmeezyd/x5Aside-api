import asyncHandler from "express-async-handler";
import Fixture from "../models/fixtureModel.js";

const createFixture = asyncHandler(async (req, res) => {
  const { homeTeam, awayTeam, eventId } = req.body;
  const fixture = await Fixture.create({ homeTeam, awayTeam, eventId });
  res.json(fixture);
});

export { createFixture };
