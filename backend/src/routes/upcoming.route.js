import express from "express";
import { getUpcomingMatches } from "../services/football.service.js";
import { mapUpcomingMatch } from "../services/match.mapper.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await getUpcomingMatches();

    const matches = data.data.map(mapUpcomingMatch);

    res.json(matches);
  } catch (error) {
    console.error("Erreur API football :", error);

    res.status(500).json({
      success: 0,
      message: "Impossible de récupérer les matchs à venir.",
    });
  }
});

export default router;