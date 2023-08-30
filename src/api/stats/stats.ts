import express from "express";
import { getYearResults, verifyUserExists } from "./utils";

const router = express.Router();

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
      return res
        .status(400)
        .json({ message: "Username and/or year are invalid" });
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
