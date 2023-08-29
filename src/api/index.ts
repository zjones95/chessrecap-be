import { Router } from "express";
import stats from "./stats/stats";
import { GAMES } from "../sampleData";
import { parsePgn } from "./utils";

const router = Router();

router.get<any, any>("/", async (req, res) => {
  res.json(parsePgn(GAMES[0].pgn));
});

router.use("/stats", stats);

export default router;
