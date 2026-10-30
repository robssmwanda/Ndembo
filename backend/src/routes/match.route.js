import express from "express";
import { getMatchById, getMatchesByDate, getLiveMatchEvents} from "../services/football.service.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const date = String(req.query.date || "").trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: 0,
        message: "Date invalide. Format attendu : YYYY-MM-DD.",
      });
    }

    const data = await getMatchesByDate(date);

    res.json(data.data);
  } catch (error) {
    console.error("Erreur API football DATE :", error);

    res.status(500).json({
      success: 0,
      message: "Impossible de récupérer les matchs de cette date.",
    });
  }
});

// Récupérer les événements d'un match en direct
router.get("/:id/events", async (req, res) => {
  try {
    const events = await getLiveMatchEvents(req.params.id);

    res.json({
      success: 1,
      events,
    });
  } catch (error) {
    console.error("Erreur récupération événements :", error);

    res.status(500).json({
      success: 0,
      message: "Impossible de récupérer les événements du match.",
    });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const data = await getMatchById(req.params.id);

    res.json(data);
  } catch (error) {
    console.error("Erreur API football :", error);

    res.status(500).json({
      success: 0,
      message: "Impossible de récupérer le détail du match.",
    });
  }
});


export default router;