import {
  AverageRating,
  Game,
  ParsedGame,
  TimeClass,
} from "../../types/gameTypes";
import { getChessComMonthURL, parsePgn } from "../utils";
import fetch from "node-fetch";

import { DateTime } from "luxon";

export const getOpening = (game: ParsedGame) => {
  if (!game.tags?.ECOUrl) return null;

  return game.tags.ECOUrl.replace("https://www.chess.com/openings/", "")
    .split("-")
    .slice(0, 2)
    .join(" ");
};

export const getMostPlayedOpenings = (
  games: ParsedGame[],
  username: string
) => {
  const openings: { [key: string]: { count: number; wins: number } } = {};

  games.forEach((game) => {
    const opening = getOpening(game);

    if (opening) {
      if (!openings[opening]) openings[opening] = { count: 0, wins: 0 };

      if (
        game.tags.Termination.toLowerCase().includes(
          `${username.toLowerCase()} won`
        )
      ) {
        openings[opening].wins = openings[opening].wins
          ? openings[opening].wins + 1
          : 1;
      }
      openings[opening].count = openings[opening].count
        ? openings[opening].count + 1
        : 1;
    }
  });

  const sortedOpenings = Object.entries(openings).sort(
    (a, b) => b[1].count - a[1].count
  );

  return sortedOpenings.slice(0, 10).map((opening) => ({
    name: opening[0],
    count: opening[1].count,
    wins: opening[1].wins,
  }));
};

export const isPlayerWhite = (game: ParsedGame, username: string) => {
  if (!game.tags) return false;

  return game.tags.White.toLowerCase() === username.toLowerCase();
};

export const getAverageRatingByMonth = (
  games: ParsedGame[],
  username: string,
  month: number
) => {
  if (games.length === 0) return { month, averageRating: 0 };

  const ratings: number[] = [];

  games.forEach((game) => {
    isPlayerWhite(game, username)
      ? ratings.push(Number(game.tags.WhiteElo))
      : ratings.push(Number(game.tags.BlackElo));
  });

  return {
    month,
    averageRating: Math.floor(ratings.reduce((a, b) => a + b) / games.length),
  };
};

export const getMonthResults = async (
  username: string,
  year: number,
  month: number
) => {
  const monthString = month < 9 ? `0${month + 1}` : `${month + 1}`;

  try {
    const response = await fetch(
      getChessComMonthURL(username, year, monthString)
    );

    const result = (await response.json()) as { games: Game[] };

    const parsedGames = result.games.map((game) => parsePgn(game.pgn));

    const averageRating = getAverageRatingByMonth(parsedGames, username, month);

    const hoursPlayed = getHoursPlayedByMonth(parsedGames, month);

    return { averageRating, parsedGames, hoursPlayed };
  } catch (err) {
    return {
      averageRating: { month, averageRating: 0 },
      parsedGames: [],
      hoursPlayed: { month, hoursPlayed: 0 },
    };
  }
};

export const verifyUserExists = async (username: string) => {
  try {
    const response = await fetch(
      `${process.env.CHESS_COM_API_URL}/pub/player/${username}`
    );

    const result = await response.json();

    if (result.code === 0) return false;

    return true;
  } catch (err) {
    return false;
  }
};

export const getLongestStreaks = (games: ParsedGame[], username: string) => {
  let longestWinStreak = 0;
  let longestLossStreak = 0;

  let currentWinStreak = 0;
  let currentLossStreak = 0;

  games.forEach((game) => {
    if (
      game.tags.Termination.toLowerCase().includes(
        `${username.toLowerCase()} won`
      )
    ) {
      currentWinStreak++;
      currentLossStreak = 0;
    } else {
      currentLossStreak++;
      currentWinStreak = 0;
    }

    if (currentWinStreak > longestWinStreak)
      longestWinStreak = currentWinStreak;
    if (currentLossStreak > longestLossStreak)
      longestLossStreak = currentLossStreak;
  });

  return { longestWinStreak, longestLossStreak };
};

export const getMostPlayedOpponents = (
  games: ParsedGame[],
  username: string
) => {
  const opponents: { [key: string]: number } = {};
  const opponentRatings: { [key: string]: number } = {};
  const opponentRecords: { [key: string]: { wins: number; losses: number } } =
    {};

  games.forEach((game) => {
    let opponent = "";

    if (isPlayerWhite(game, username)) {
      opponent = game.tags.Black;
      opponentRatings[opponent] = opponentRatings[opponent]
        ? opponentRatings[opponent]
        : Number(game.tags.BlackElo);
    } else {
      opponent = game.tags.White;
      opponentRatings[opponent] = opponentRatings[opponent]
        ? opponentRatings[opponent]
        : Number(game.tags.WhiteElo);
    }

    if (
      game.tags.Termination.toLowerCase().includes(
        `${username.toLowerCase()} won`
      )
    ) {
      opponentRecords[opponent] = opponentRecords[opponent]
        ? {
            wins: opponentRecords[opponent].wins + 1,
            losses: opponentRecords[opponent].losses,
          }
        : { wins: 1, losses: 0 };
    } else {
      opponentRecords[opponent] = opponentRecords[opponent]
        ? {
            wins: opponentRecords[opponent].wins,
            losses: opponentRecords[opponent].losses + 1,
          }
        : { wins: 0, losses: 1 };
    }

    opponents[opponent] = opponents[opponent] ? opponents[opponent] + 1 : 1;
  });

  const sortedOpponents = Object.entries(opponents).sort((a, b) => b[1] - a[1]);

  return sortedOpponents.slice(0, 5).map((opponent) => ({
    name: opponent[0],
    count: opponent[1],
    rating: opponentRatings[opponent[0]],
    wins: opponentRecords[opponent[0]].wins,
    losses: opponentRecords[opponent[0]].losses,
  }));
};

export const getYearResults = async (username: string, year: number) => {
  const rawAverageRatings: AverageRating[] = [];
  const games: ParsedGame[] = [];
  const hoursPlayed: { month: number; hoursPlayed: number }[] = [];

  for (let i = 0; i < 12; i++) {
    await delay(0);

    const monthResults = await getMonthResults(username, year, i);
    rawAverageRatings.push(monthResults.averageRating);
    games.push(...monthResults.parsedGames);
    hoursPlayed.push(monthResults.hoursPlayed);
  }

  const filteredAverageRatings = rawAverageRatings.filter(
    (rating) => rating.averageRating > 0
  );
  const yearAverageRating = Math.floor(
    filteredAverageRatings.reduce((a, b) => a + b.averageRating, 0) /
      filteredAverageRatings.length
  );
  const averageRatings = rawAverageRatings.map((rating) => ({
    month: rating.month,
    averageRating:
      rating.averageRating === 0 ? yearAverageRating : rating.averageRating,
  }));

  const openings = getMostPlayedOpenings(games, username);
  const highestRatings = getHighestRatings(games, username);
  const streaks = getLongestStreaks(games, username);

  const totalGames = {
    bullet: getTotalGamesPerTimeClass(games, "bullet"),
    blitz: getTotalGamesPerTimeClass(games, "blitz"),
    rapid: getTotalGamesPerTimeClass(games, "rapid"),
  };

  const mostPlayedOpponents = getMostPlayedOpponents(games, username);

  return {
    averageRatings,
    highestRatings,
    hoursPlayed,
    totalGames,
    streaks,
    mostPlayedOpponents,
    openings,
  };
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const getHighestRatings = (games: ParsedGame[], username: string) => {
  const highestBulletRating = getHighestRatingByTimeClass(
    games,
    username,
    "bullet"
  );
  const highestBlitzRating = getHighestRatingByTimeClass(
    games,
    username,
    "blitz"
  );
  const highestRapidRating = getHighestRatingByTimeClass(
    games,
    username,
    "rapid"
  );

  return {
    highestBulletRating,
    highestBlitzRating,
    highestRapidRating,
  };
};

export const getTotalGamesPerTimeClass = (
  games: ParsedGame[],
  timeClass: TimeClass
) => {
  return games.filter((game) => getTimeClass(game) === timeClass).length;
};

export const getHighestRatingByTimeClass = (
  games: ParsedGame[],
  username: string,
  timeClass: TimeClass
) => {
  let highestRating = 0;

  games.forEach((game) => {
    const playerIsWhite = isPlayerWhite(game, username);

    if (getTimeClass(game) === timeClass) {
      if (playerIsWhite && Number(game.tags.WhiteElo) > highestRating) {
        highestRating = Number(game.tags.WhiteElo);
      }

      if (
        Number(game.tags.BlackElo) > highestRating &&
        playerIsWhite === false
      ) {
        highestRating = Number(game.tags.BlackElo);
      }
    }
  });

  return highestRating;
};

export const getHoursPlayedByMonth = (games: ParsedGame[], month: number) => {
  let secondsPlayed = 0;

  games.forEach((game) => {
    const startTime = DateTime.fromFormat(game.tags.StartTime, "h:mm:ss");
    const endTime = DateTime.fromFormat(game.tags.EndTime, "h:mm:ss");

    const timeDifference = endTime.diff(startTime, "seconds").as("seconds");

    if (timeDifference < 0) {
      return (secondsPlayed += timeDifference + 86400);
    }

    return (secondsPlayed += timeDifference);
  });

  return { month, hoursPlayed: Math.floor((secondsPlayed / 3600) * 10) / 10 };
};

export const getTimeClass = (game: ParsedGame): TimeClass => {
  const timeValue = Number(game.tags.TimeControl.value) ?? 0;

  if (timeValue >= 30 && timeValue < 120) return "bullet";
  if (timeValue > 120 && timeValue <= 300) return "blitz";
  if (timeValue > 300 && timeValue < 2000) return "rapid";
  else {
    return "daily";
  }
};
