import {
  AverageRatingsMonth,
  Game,
  HighestRatingsKey,
  HoursPlayedMonth,
  Opening,
  Opponent,
  StreaksKey,
  TotalGamesKey,
} from "../../types/gameTypes";
import { getChessComMonthURL, parsePgn } from "../utils";
import fetch from "node-fetch";

import { DateTime } from "luxon";

export const isPlayerWhite = (white: string, username: string) => {
  return white.toLowerCase() === username.toLowerCase();
};

export const getPlayerRating = (
  playerIsWhite: boolean,
  whiteElo: string,
  blackElo: string
) => {
  if (playerIsWhite) return Number(whiteElo);

  return Number(blackElo);
};

export const getOpening = (ECOUrl: string) => {
  const openingSplit = ECOUrl.match(/([A-Z])\w([^0-9-])+/g);
  if (!openingSplit) return null;

  return openingSplit.slice(0, 2).join(" ");
};

export const didPlayerWin = (username: string, termination: string) => {
  return termination.toLowerCase().includes(`${username.toLowerCase()} won`);
};

export const getOpponentName = (
  username: string,
  black: string,
  white: string
) => {
  return username.toLowerCase() === black.toLowerCase() ? white : black;
};

export const getMonth = async (
  username: string,
  year: number,
  month: number,
  highestRatings: Record<HighestRatingsKey, number>,
  averageRatings: AverageRatingsMonth[],
  hoursPlayed: HoursPlayedMonth[],
  totalGames: Record<TotalGamesKey, number>,
  opponents: Record<string, Opponent>,
  openings: Record<string, Opening>,
  streaks: Record<StreaksKey, number>
) => {
  const averageRatingsMonth: AverageRatingsMonth = {
    month,
    averageRating: 0,
  };
  const hoursPlayedMonth: HoursPlayedMonth = {
    month,
    hoursPlayed: 0,
  };

  try {
    const response = await fetch(getChessComMonthURL(username, year, month));

    const result = (await response.json()) as { games: Game[] };

    const parsedGames = result.games.map((game) => {
      const parsedGame = parsePgn(game.pgn);

      return {
        tags: parsedGame.tags,
        timeClass: game.time_class,
      };
    });

    parsedGames.forEach((game) => {
      const playerIsWhite = isPlayerWhite(game.tags.White, username);
      const rating = getPlayerRating(
        playerIsWhite,
        game.tags.WhiteElo,
        game.tags.BlackElo
      );

      // Calculate average rating for month
      if (rating > averageRatingsMonth.averageRating)
        averageRatingsMonth.averageRating = rating;

      // Calculate highest rating & increment totalGames per timeClass
      if (game.timeClass === "bullet") {
        if (rating > highestRatings.bullet) highestRatings.bullet = rating;
        totalGames.bullet += 1;
      }
      if (game.timeClass === "blitz") {
        if (rating > highestRatings.blitz) highestRatings.blitz = rating;
        totalGames.blitz += 1;
      }
      if (game.timeClass === "rapid") {
        if (rating > highestRatings.rapid) highestRatings.rapid = rating;
        totalGames.rapid += 1;
      }

      // Calculate time & add to hoursPlayed
      const startTime = DateTime.fromFormat(game.tags.StartTime, "h:mm:ss");
      const endTime = DateTime.fromFormat(game.tags.EndTime, "h:mm:ss");

      let timeDifference = endTime.diff(startTime, "seconds").as("seconds");

      if (timeDifference < 0) {
        timeDifference += 86400;
      }

      hoursPlayedMonth.hoursPlayed += timeDifference / 3600;

      // Increment opponents played
      const opponent = getOpponentName(
        username,
        game.tags.Black,
        game.tags.White
      );

      if (!opponents[opponent]) {
        opponents[opponent] = {
          name: opponent,
          rating: Number(
            playerIsWhite ? game.tags.WhiteElo : game.tags.BlackElo
          ),
          wins: didPlayerWin(username, game.tags.Termination) ? 1 : 0,
          count: 1,
        };
      } else {
        opponents[opponent] = {
          name: opponents[opponent].name,
          wins: Number(
            didPlayerWin(username, game.tags.Termination)
              ? opponents[opponent].wins + 1
              : opponents[opponent].wins
          ),
          rating: opponents[opponent].rating,
          count: opponents[opponent].count + 1,
        };
      }

      // Increment openings played
      const opening = getOpening(game.tags.ECOUrl);

      if (opening) {
        if (!openings[opening]) {
          openings[opening] = {
            name: opening,
            wins: didPlayerWin(username, game.tags.Termination) ? 1 : 0,
            count: 1,
          };
        } else {
          openings[opening] = {
            name: openings[opening].name,
            wins: didPlayerWin(username, game.tags.Termination)
              ? openings[opening].wins + 1
              : openings[opening].wins,
            count: openings[opening].count + 1,
          };
        }
      }

      if (didPlayerWin(username, game.tags.Termination)) {
        streaks.currentWinStreak++;
        streaks.currentLossStreak = 0;
      } else {
        streaks.currentLossStreak++;
        streaks.currentWinStreak = 0;
      }

      if (streaks.currentWinStreak > streaks.longestWinStreak)
        streaks.longestWinStreak = streaks.currentWinStreak;
      if (streaks.currentLossStreak > streaks.longestLossStreak)
        streaks.longestLossStreak = streaks.currentLossStreak;
    });
  } catch (err) {
    console.log({ err });
  }

  hoursPlayedMonth.hoursPlayed = Number(
    hoursPlayedMonth.hoursPlayed.toFixed(1)
  );
  hoursPlayed.push(hoursPlayedMonth);
  averageRatings.push(averageRatingsMonth);
};

export const getYear = async (username: string, year: number) => {
  const rawAverageRatings: AverageRatingsMonth[] = [];
  const highestRatings: Record<HighestRatingsKey, number> = {
    bullet: 0,
    blitz: 0,
    rapid: 0,
  };
  const hoursPlayed: HoursPlayedMonth[] = [];
  const totalGames: Record<TotalGamesKey, number> = {
    bullet: 0,
    blitz: 0,
    rapid: 0,
  };
  const opponents: Record<string, Opponent> = {};
  const openings: Record<string, Opening> = {};

  //
  const streaks: Record<StreaksKey, number> = {
    longestWinStreak: 0,
    longestLossStreak: 0,
    currentWinStreak: 0,
    currentLossStreak: 0,
  };

  for (let i = 0; i < 12; i++) {
    await delay(0);

    await getMonth(
      username,
      year,
      i,
      highestRatings,
      rawAverageRatings,
      hoursPlayed,
      totalGames,
      opponents,
      openings,
      streaks
    );
  }

  const filteredAverageRatings = rawAverageRatings.filter(
    (rating) => rating.averageRating > 0
  );
  const yearAverageRating =
    filteredAverageRatings.length > 0
      ? Math.floor(
          filteredAverageRatings.reduce((a, b) => a + b.averageRating, 0) /
            filteredAverageRatings.length
        )
      : 0;
  const averageRatings = rawAverageRatings.map((rating) => ({
    month: rating.month,
    averageRating:
      rating.averageRating === 0 ? yearAverageRating : rating.averageRating,
  }));
  console.log(yearAverageRating, rawAverageRatings);

  const formattedOpenings = Object.values(openings)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const formattedOpponents = Object.values(opponents)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    averageRatings,
    highestRatings,
    hoursPlayed,
    totalGames,
    streaks: {
      longestWinStreak: streaks.longestWinStreak,
      longestLossStreak: streaks.longestLossStreak,
    },
    opponents: formattedOpponents,
    openings: formattedOpenings,
  };
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

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
