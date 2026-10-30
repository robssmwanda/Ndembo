import express from "express";
import { getMatchesByDate } from "../services/football.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const result = await getMatchesByDate(today);

    res.json(result.data);
  } catch (error) {
    console.error("Erreur API football :", error);

    res.status(500).json({
      success: 0,
      message: "Impossible de récupérer les matchs à venir.",
    });
  }
});

export default router;