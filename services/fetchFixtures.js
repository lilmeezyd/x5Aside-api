// services/fetchFixtures.js
import axios from "axios";
import fixtureSchema from "../models/fixtureModel.js";
import { getModel } from "../config/db.js";

export const fetchFixtures = async (dbName) => {
  const Fixture = await getModel(dbName, "Fixture", fixtureSchema);
  try {
    const { data } = await axios.get("https://fantasy.premierleague.com/api/fixtures/");

    const fixturesToStore = data.map(fixture => ({
      eventId: fixture.event,
      homeTeam: fixture.team_h,
      awayTeam: fixture.team_a,
    }));

    // Optional: Clear existing fixtures before inserting new ones
    await Fixture.deleteMany({});
    const savedFixtures = await Fixture.insertMany(fixturesToStore);

    console.log(`✅ Stored ${savedFixtures.length} fixtures.`);
    return savedFixtures;
  } catch (error) {
    console.error("❌ Error fetching/storing fixtures:", error.message);
    throw error;
  }
};

export const generateFixtures = (teams) => {
  if (!Array.isArray(teams) || teams.length < 2) {
    return [];
  }

  // ---------------------------------------------------------
  // 1. Copy teams
  // ---------------------------------------------------------
  let list = [...teams];

  // Add BYE for odd number of teams
  if (list.length % 2 !== 0) {
    list.push({
      id: null,
      name: "BYE",
    });
  }

  const totalTeams = list.length;
  const rounds = totalTeams - 1;
  const matchesPerRound = totalTeams / 2;
  const totalRounds = rounds * 2;

  // ---------------------------------------------------------
  // 2. Generate FIRST LEG pairings
  //
  // Circle method:
  //
  // For N teams:
  // N - 1 rounds
  // N / 2 matches per round
  //
  // Every pair occurs exactly ONCE.
  // ---------------------------------------------------------
  const firstLegRounds = [];

  let rotatingList = [...list];

  for (let round = 0; round < rounds; round++) {
    const matches = [];

    for (let i = 0; i < matchesPerRound; i++) {
      const team1 = rotatingList[i];
      const team2 = rotatingList[totalTeams - 1 - i];

      // Ignore BYE
      if (team1 !== null && team2 !== null) {
        matches.push({
          team1,
          team2,
        });
      }
    }

    firstLegRounds.push(matches);

    // Keep first team fixed and rotate the rest
    rotatingList = [
      rotatingList[0],
      rotatingList[totalTeams - 1],
      ...rotatingList.slice(1, totalTeams - 1),
    ];
  }

  // ---------------------------------------------------------
  // 3. Shuffle the rounds/matches slightly
  //
  // This gives the backtracking algorithm different possible
  // schedules to work with.
  // ---------------------------------------------------------
  const shuffle = (array) => {
    const result = [...array];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  };

  // ---------------------------------------------------------
  // 4. Generate a candidate schedule
  //
  // We assign home/away for the FIRST LEG.
  //
  // The second leg is automatically reversed.
  // ---------------------------------------------------------
  const generateCandidate = () => {
    const roundsCopy = firstLegRounds.map((round) =>
      shuffle(round)
    );

    // Randomize which side starts home/away
    roundsCopy.forEach((round) => {
      round.forEach((match) => {
        if (Math.random() > 0.5) {
          [match.team1, match.team2] = [
            match.team2,
            match.team1,
          ];
        }
      });
    });

    // -------------------------------------------------------
    // History for every team
    // -------------------------------------------------------
    const history = new Map();

    teams.forEach((team) => {
      history.set(team, []);
    });

    // -------------------------------------------------------
    // Check if adding this venue is allowed
    // -------------------------------------------------------
    const canPlay = (teamId, venue) => {
      const games = history.get(teamId);

      if (!games || games.length < 2) {
        return true;
      }

      // Don't allow:
      //
      // HOME HOME HOME
      //
      // or
      //
      // AWAY AWAY AWAY
      return !(
        games[games.length - 1] === venue &&
        games[games.length - 2] === venue
      );
    };

    const addGame = (teamId, venue) => {
      history.get(teamId).push(venue);
    };

    const removeGame = (teamId) => {
      history.get(teamId).pop();
    };

    // -------------------------------------------------------
    // Backtracking
    // -------------------------------------------------------
    const assignRound = (roundIndex) => {
      if (roundIndex >= rounds) {
        return true;
      }

      const round = roundsCopy[roundIndex];

      const assignMatch = (matchIndex) => {
        if (matchIndex >= round.length) {
          return assignRound(roundIndex + 1);
        }

        const match = round[matchIndex];

        const team1 = match.team1;
        const team2 = match.team2;

        // ---------------------------------------------------
        // OPTION 1
        //
        // Team 1 HOME
        // Team 2 AWAY
        // ---------------------------------------------------
        if (
          canPlay(team1, "home") &&
          canPlay(team2, "away")
        ) {
          addGame(team1, "home");
          addGame(team2, "away");

          match.homeTeam = team1;
          match.awayTeam = team2;

          if (assignMatch(matchIndex + 1)) {
            return true;
          }

          removeGame(team1);
          removeGame(team2);
        }

        // ---------------------------------------------------
        // OPTION 2
        //
        // Team 1 AWAY
        // Team 2 HOME
        // ---------------------------------------------------
        if (
          canPlay(team1, "away") &&
          canPlay(team2, "home")
        ) {
          addGame(team1, "away");
          addGame(team2, "home");

          match.homeTeam = team2;
          match.awayTeam = team1;

          if (assignMatch(matchIndex + 1)) {
            return true;
          }

          removeGame(team1);
          removeGame(team2);
        }

        return false;
      };

      return assignMatch(0);
    };

    if (!assignRound(0)) {
      return null;
    }

    // -------------------------------------------------------
    // Build complete season
    // -------------------------------------------------------
    const fixtures = [];

    // First leg
    roundsCopy.forEach((round, roundIndex) => {
      round.forEach((match) => {
        fixtures.push({
          eventId: roundIndex + 1,
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
        });
      });
    });

    // Second leg
    roundsCopy.forEach((round, roundIndex) => {
      round.forEach((match) => {
        fixtures.push({
          eventId: roundIndex + rounds + 1,
          homeTeam: match.awayTeam,
          awayTeam: match.homeTeam,
        });
      });
    });

    return fixtures;
  };

  // ---------------------------------------------------------
  // 5. Validate complete season
  // ---------------------------------------------------------
  const validateSchedule = (fixtures) => {
    const history = new Map();

    teams.forEach((team) => {
      history.set(team, []);
    });

    // ---------------------------------------------
    // Check every match
    // ---------------------------------------------
    for (const fixture of fixtures) {
      const homeId = fixture.homeTeam;
      const awayId = fixture.awayTeam;

      history.get(homeId).push({
        venue: "home",
        opponent: awayId,
      });

      history.get(awayId).push({
        venue: "away",
        opponent: homeId,
      });
    }

    // ---------------------------------------------
    // Check:
    //
    // 1. No 3 consecutive HOME
    // 2. No 3 consecutive AWAY
    // ---------------------------------------------
    for (const [teamId, games] of history.entries()) {
      for (let i = 2; i < games.length; i++) {
        const a = games[i - 2].venue;
        const b = games[i - 1].venue;
        const c = games[i].venue;

        if (a === b && b === c) {
          return false;
        }
      }
    }

    // ---------------------------------------------
    // Check every pair of teams
    //
    // Each pair must play exactly twice:
    //
    // A HOME vs B
    // B HOME vs A
    // ---------------------------------------------
    const pairMap = new Map();

    for (const fixture of fixtures) {
      const homeId = fixture.homeTeam;
      const awayId = fixture.awayTeam;

      const key = [homeId, awayId]
        .sort((a, b) => String(a).localeCompare(String(b)))
        .join("-");

      if (!pairMap.has(key)) {
        pairMap.set(key, []);
      }

      pairMap.get(key).push({
        homeId,
        awayId,
      });
    }

    // Every pair must occur exactly twice
    for (const matches of pairMap.values()) {
      if (matches.length !== 2) {
        return false;
      }

      const first = matches[0];
      const second = matches[1];

      // Must be home/away in opposite directions
      if (
        first.homeId !== second.awayId ||
        first.awayId !== second.homeId
      ) {
        return false;
      }
    }

    // Number of expected fixtures
    const expectedFixtures =
      teams.length * (teams.length - 1);

    if (fixtures.length !== expectedFixtures) {
      return false;
    }

    return true;
  };

  // ---------------------------------------------------------
  // 6. Try multiple candidate schedules
  // ---------------------------------------------------------
  const MAX_ATTEMPTS = 1000;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const fixtures = generateCandidate();

    if (!fixtures) {
      continue;
    }

    if (validateSchedule(fixtures)) {
      return fixtures;
    }
  }

  // ---------------------------------------------------------
  // Only throw if the generator genuinely couldn't find
  // a valid schedule after all attempts.
  // ---------------------------------------------------------
  throw new Error(
    "Unable to generate a valid fixture schedule after multiple attempts."
  );
};
