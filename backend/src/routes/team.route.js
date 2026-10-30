import express from "express";
import { getTeamFixtures, getTeamInfo } from "../services/football.service.js";

const router = express.Router();

router.get("/:id/fixtures", async (req, res) => {
  try {
    const { id } = req.params;
    const { status = "all", season } = req.query;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: 0,
        message: "Identifiant de club invalide.",
      });
    }

    if (!season || !/^\d{4}$/.test(String(season))) {
      return res.status(400).json({
        success: 0,
        message: "La saison est obligatoire.",
      });
    }

    const data = await getTeamFixtures(
      id,
      Number(season),
      status
    );

    res.json(data);
  } catch (error) {
    console.error("Erreur matchs du club :", error);

    res.status(500).json({
      success: 0,
      message: "Impossible de récupérer les matchs de l'équipe.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        success: 0,
        message: "Identifiant de club invalide.",
      });
    }

    const team = await getTeamInfo(id);

    res.json({
      success: 1,
      data: team,
    });
  } catch (error) {
    console.error("Erreur informations du club :", error);

    res.status(500).json({
      success: 0,
      message: "Impossible de récupérer les informations du club.",
    });
  }
});

export default router;