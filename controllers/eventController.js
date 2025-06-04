import asyncHandler from 'express-async-handler'
import Event from '../models/eventModel.js'
import Fixture from '../models/fixtureModel.js'
import Team from '../models/teamModel.js'
import scoreFixtures from "../services/scoreFixtures.js"


const createEvent =  asyncHandler(async (req, res) => {
  const { eventId } = req.body;
  const event = await Event.create({ eventId });
  res.json(event);
});

const scoreEventFixtures = async (req, res) => {
  const { eventId } = req.params;

  const fixtures = await Fixture.find({ eventId: parseInt(eventId) })
    .populate("homeTeam")
    .populate("awayTeam");

  if (!fixtures.length)
    return res.status(404).json({ error: `No fixtures found for event ${eventId}` });

  for (const fixture of fixtures) {
    const [homeTeam, awayTeam] = await Promise.all([
      Team.findById(fixture.homeTeam._id).populate("players"),
      Team.findById(fixture.awayTeam._id).populate("players")
    ]);

    const getPoints = async (players) => {
      const entries = await PlayerEventPoints.find({
        player: { $in: players.map(p => p._id) },
        eventId: parseInt(eventId)
      });
      return Object.fromEntries(entries.map(e => [e.player.toString(), e.eventPoints]));
    };

    const [homePlayerPoints, awayPlayerPoints] = await Promise.all([
      getPoints(homeTeam.players),
      getPoints(awayTeam.players)
    ]);

    await scoreFixtures({
      fixture,
      homeTeam,
    fixture,
      homePlayerPoints,
      awayPlayerPoints
    });
  }

  res.json({ message: `All fixtures for event ${eventId} scored successfully.` });
};


export default { createEvent, scoreEventFixtures }