import express from "express";
import { getLiveMatches } from "../services/football.service.js";


const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await getLiveMatches();

    res.json(data);
  } catch (error) {
    console.error("Erreur API football :", error);

    res.status(500).json({
      success: 0,
      message: "Impossible de récupérer les matchs en direct.",
    });
  }
});

export default router;