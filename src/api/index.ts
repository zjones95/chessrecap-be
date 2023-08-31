import { Router } from "express";
import stats from "./stats/stats";

const router = Router();

router.get<any, any>("/", async (req, res) => {
  res.json({ message: "ChessRecap Stats API" });
});

router.use("/stats", stats);

export default router;
