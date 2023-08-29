import express from "express";
import {
  delay,
  getMostPlayedOpenings,
  getOpening,
  getTimeClass,
  getYearResults,
  verifyUserExists,
} from "./utils";
import fetch from "node-fetch";
import MessageResponse from "../../types/MessageResponse";

const router = express.Router();

// const getYearResults = async (username: string, year: number) => {
//   const results: any = [];

//   for (let i = 0; i < 12; i++) {
//     await delay(500);

//     const monthString = i < 9 ? `0${i + 1}` : `${i + 1}`;

//     try {
//       const response = await fetch(
//         `${process.env.CHESS_COM_API_URL}/pub/player/${username}/games/${year}/${monthString}`
//       );

//       const result = await response.json();
//       // results.push(...result.games.map((game: any) => parsePgn(game.pgn)));
//     } catch (err) {
//       console.log(err);
//     }
//   }

//   return results;
// };

interface StatsUsernameYearParams {
  username: string;
  year: string;
}

const requestIsValid = ({ username, year }: StatsUsernameYearParams) => {
  if (!username || !year || !Number(year) || year.length !== 4) {
    return false;
  }

  return true;
};

router.get<StatsUsernameYearParams, any>(
  "/:username/:year",
  async (req, res) => {
    console.log("Route hit - /stats/:username/:year");
    const username = req.params.username;
    const year = req.params.year;

    if (!requestIsValid({ username, year })) {
      return res.status(400).json({ message: "Username and year are invalid" });
    }

    const userExists = await verifyUserExists(username);

    if (!userExists) {
      return res
        .status(404)
        .json({ message: "User does not exist or the chess.com API is down" });
    }

    const yearResults = await getYearResults(username, Number(year));

    res.json({
      ...yearResults,
    });
  }
);

export default router;
