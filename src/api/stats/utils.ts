import {
  AverageRating,
  Game,
  ParsedGame,
  TimeClass,
} from "../../types/gameTypes";
import { getChessComMonthURL, parsePgn } from "../utils";
import fetch from "node-fetch";

import { DateTime, Duration } from "luxon";

export const getOpening = (game: ParsedGame) => {
  if (!game.tags?.ECOUrl) return null;

  return game.tags.ECOUrl.replace("https://www.chess.com/openings/", "")
    .split("-")
    .slice(0, 2)
    .join(" ");
};

export const getMostPlayedOpenings = (games: ParsedGame[]) => {
  const openings: { [key: string]: number } = {};

  games.forEach((game) => {
    const opening = getOpening(game);

    if (opening) {
      openings[opening] = openings[opening] ? openings[opening] + 1 : 1;
    }
  });

  const sortedOpenings = Object.entries(openings).sort((a, b) => b[1] - a[1]);

  return sortedOpenings.slice(0, 10);
};

const isPlayerWhite = (game: ParsedGame, username: string) => {
  if (!game.tags) return false;

  return game.tags.White === username;
};

const getAverageRatingByMonth = (
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

export const getYearResults = async (username: string, year: number) => {
  const averageRatings: AverageRating[] = [];
  const games: ParsedGame[] = [];
  const hoursPlayed: { month: number; hoursPlayed: number }[] = [];

  for (let i = 0; i < 12; i++) {
    await delay(200);

    const monthResults = await getMonthResults(username, year, i);
    averageRatings.push(monthResults.averageRating);
    games.push(...monthResults.parsedGames);
    hoursPlayed.push(monthResults.hoursPlayed);
  }

  const openings = getMostPlayedOpenings(games);
  const highestRatings = getHighestRatings(games, username);

  return {
    averageRatings,
    openings,
    highestRatings,
    hoursPlayed,
    sampleGame: games[0],
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

    secondsPlayed += startTime.diff(endTime, "seconds").as("seconds");
  });

  return { month, hoursPlayed: secondsPlayed };
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
