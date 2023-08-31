import { ParseTree } from "@mliebelt/pgn-parser";

export interface GamePlayer {
  rating: number;
  result: Result;
  "@id": string;
  username: string;
  uuid: string;
}

export type TimeClass = "bullet" | "blitz" | "rapid" | "daily";

export type TotalGamesKey = Exclude<TimeClass, "daily">;

export type StreaksKey = "longestWinStreak" | "longestLossStreak";

export type Pgn = string;

export interface HoursPlayedMonth {
  month: number;
  hoursPlayed: number;
}

export interface AverageRatingsMonth {
  month: number;
  averageRating: number;
}

export interface Opening {
  name: string;
  wins: number;
  count: number;
}

export interface Opponent {
  name: string;
  rating: number;
  wins: number;
  count: number;
}

export type HighestRatingsKey = "bullet" | "blitz" | "rapid";

export interface Game {
  url: string;
  pgn: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  tcn: string;
  uuid: string;
  initial_setup: string;
  fen: string;
  time_class: TimeClass;
  rules: string;
  white: GamePlayer;
  black: GamePlayer;
  accuracies?: Accuracies;
}

type ParsedTags = NonNullable<ParseTree["tags"]> & {
  ECOUrl: string;
  StartTime: string;
  EndTime: string;
};

export interface ParsedGame extends Omit<ParseTree, "Tags"> {
  tags: ParsedTags;
  timeClass: "bullet" | "blitz" | "rapid";
}

export interface ParsedResult {
  games: ParsedGame[];
  averageRatings: AverageRating[];
}

export interface AverageRating {
  month: number;
  averageRating: number;
}

export interface Accuracies {
  white: number;
  black: number;
}

export type Result =
  | "timeout"
  | "win"
  | "resigned"
  | "checkmated"
  | "repetition";
