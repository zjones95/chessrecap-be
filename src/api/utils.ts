import { parseGame } from "@mliebelt/pgn-parser";
import { ParsedGame } from "../types/gameTypes";

export const getChessComMonthURL = (
  username: string,
  year: number,
  month: string
) => {
  return `${process.env.CHESS_COM_API_URL}/pub/player/${username}/games/${year}/${month}`;
};

export const parsePgn = (pgn: string) => {
  return parseGame(pgn) as ParsedGame;
};
