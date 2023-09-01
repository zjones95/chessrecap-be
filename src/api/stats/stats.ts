import express from "express";
import { getYear, verifyUserExists } from "./utils";
import { PrismaClient } from "@prisma/client";

const router = express.Router();

const prisma = new PrismaClient();

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

    const existingRecap = await prisma.recap.findUnique({
      where: { id: username }, // Assuming `id` is used as the primary key (name)
      include: {
        averageRatings: {
          select: {
            month: true,
            averageRating: true,
          },
        },
        hoursPlayed: {
          select: {
            month: true,
            hoursPlayed: true,
          },
        },
        opponents: {
          select: {
            name: true,
            wins: true,
            rating: true,
            count: true,
          },
        },
        openings: {
          select: {
            name: true,
            wins: true,
            count: true,
          },
        },
      },
    });

    if (existingRecap) {
      console.log("Recap found in DB");
      return res.json(existingRecap);
    }

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

    const yearResults = await getYear(username, Number(year));

    if (!existingRecap) {
      await prisma.recap.create({
        data: {
          id: username,
          // Map yearResults to match the expected structure
          averageRatings: { createMany: { data: yearResults.averageRatings } },
          highestRatings: yearResults.highestRatings,
          hoursPlayed: { createMany: { data: yearResults.hoursPlayed } },
          totalGames: yearResults.totalGames,
          streaks: yearResults.streaks,
          opponents: { createMany: { data: yearResults.opponents } },
          openings: { createMany: { data: yearResults.openings } },
        },
      });
    }

    res.json({
      id: username,
      ...yearResults,
    });
  }
);

export default router;
