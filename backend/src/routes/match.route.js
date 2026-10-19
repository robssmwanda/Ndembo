import express from "express";
import { getMatchById } from "../services/football.service.js";

const router = express.Router();

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