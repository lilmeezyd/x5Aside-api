import PlayerTable from "../models/PlayerTable.js";

const updatePlayerTable = async ({
  eventId,
  homePlayer,
  awayPlayer,
  homePoints,
  awayPoints,
}) => {
  const getResult = (a, b) => (a > b ? "W" : b > a ? "L" : "D");
  const resultA = getResult(homePoints, awayPoints);
  const resultB = getResult(awayPoints, homePoints);

  const applyUpdate = (record, result) => {
    record.played += 1;
    if (result === "W") {
      record.wins += 1;
      record.points += 3;
    } else if (result === "D") {
      record.draws += 1;
      record.points += 1;
    } else {
      record.losses += 1;
    }
    record.lastFive.push({ eventId, result });
    if (record.lastFive.length > 5) record.lastFive.shift();
  };

  const [ptA, ptB] = await Promise.all([
    PlayerTable.findOne({ player: homePlayer._id }) ||
      new PlayerTable({ player: homePlayer._id }),
    PlayerTable.findOne({ player: awayPlayer._id }) ||
      new PlayerTable({ player: awayPlayer._id }),
  ]);

  applyUpdate(ptA, resultA);
  applyUpdate(ptB, resultB);

  await Promise.all([ptA.save(), ptB.save()]);
};
