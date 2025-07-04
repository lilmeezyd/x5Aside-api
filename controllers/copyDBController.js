import asyncHandler from 'express-async-handler';
import { getModel } from '../config/db.js';

import teamSchema from '../models/teamModel.js';
import playerSchema from '../models/playerModel.js';
import fixtureSchema from '../models/fixtureModel.js';
import playerFixtureSchema from '../models/playerFixtureModel.js';
import eventSchema from '../models/eventModel.js';
import playerEventPointsSchema from '../models/playerPointsModel.js';

const collections = [
  { name: 'Team', schema: teamSchema },
  { name: 'Player', schema: playerSchema },
  { name: 'Fixture', schema: fixtureSchema },
  { name: 'PlayerFixture', schema: playerFixtureSchema },
  { name: 'Event', schema: eventSchema },
  { name: 'PlayerEventPoints', schema: playerEventPointsSchema },
];

export const copyCoreData = asyncHandler(async (req, res) => {
  const fromDb = ""; // optionally: req.body.fromDb
  const toDb = "X5Aside";

  const results = [];

  for (const { name, schema } of collections) {
    const Source = await getModel(fromDb, name, schema);
    const Target = await getModel(toDb, name, schema);

    const docs = await Source.find({});
    if (docs.length === 0) {
      results.push({ collection: name, copied: 0, note: 'empty' });
      continue;
    }

    const cleanDocs = docs.map((doc) => doc.toObject());

    // ✅ Fix: use `.db.db` to get native driver Db
    const collectionName = Target.collection.name;
    const nativeDb = Target.db.db;

    const collectionExists = await nativeDb
      .listCollections({ name: collectionName })
      .toArray();

    if (collectionExists.length > 0) {
      await nativeDb.collection(collectionName).drop();
    }

    await Target.insertMany(cleanDocs, { ordered: false });
    results.push({ collection: name, copied: cleanDocs.length });
  }

  res.status(200).json({ message: 'Copy complete', results });
});
