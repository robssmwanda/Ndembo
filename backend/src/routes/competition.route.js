import express from "express";

import {
  getCountries,
  getLeaguesByCountry,
  getPopularCompetitions,
  getCompetitionById,
  getCompetitionStandings,
} from "../services/football.service.js";

const router = express.Router();

router.get("/countries", async (req, res) => {
  try {
    const data = await getCountries();

    res.json(data);
  } catch (error) {
    console.error("Erreur API football :", error);

    res.status(500).json({
      success: 0,
      message: "Impossible de récupérer les pays.",
    });
  }
});

router.get("/popular", async (req, res) => {
  try {
    const data = await getPopularCompetitions();

    res.json(data);
  } catch (error) {
    console.error("Erreur API football :", error);

    res.status(500).json({
      success: 0,
      message: "Impossible de récupérer les compétitions populaires.",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const { country } = req.query;

    if (!country) {
      return res.status(400).json({
        success: 0,
        message: "Le code du pays est obligatoire.",
      });
    }

    const data = await getLeaguesByCountry(country);

    res.json(data);
  } catch (error) {
    console.error("Erreur API football :", error);

    res.status(500).json({
      success: 0,
      message: "Impossible de récupérer les compétitions.",
    });
  }
});

router.get("/:id/standings", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await getCompetitionStandings(id);

    res.json(data);
  } catch (error) {
    console.error("Erreur API football :", error);

    res.status(500).json({
      success: 0,
      message: "Impossible de récupérer le classement.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const data = await getCompetitionById(id);

    res.json(data);
  } catch (error) {
    console.error("Erreur API football :", error);

    res.status(500).json({
      success: 0,
      message: "Impossible de récupérer la compétition.",
    });
  }
});

export default router;