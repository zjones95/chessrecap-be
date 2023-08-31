import { parseGame } from "@mliebelt/pgn-parser";
import { ParsedGame } from "../types/gameTypes";

export const getChessComMonthURL = (
  username: string,
  year: number,
  month: string | number
) => {
  const monthNumber = Number(month);
  const monthString =
    monthNumber < 9 ? `0${monthNumber + 1}` : `${monthNumber + 1}`;

  return `${process.env.CHESS_COM_API_URL}/pub/player/${username}/games/${year}/${monthString}`;
};

export const parsePgn = (pgn: string) => {
  return parseGame(pgn) as ParsedGame;
};
