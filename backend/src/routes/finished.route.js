import express from "express";
import { getFinishedMatches } from "../services/football.service.js";
import { mapFinishedMatch } from "../services/match.mapper.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await getFinishedMatches();

    console.log("FINISHED RESPONSE :", {
      hasData: !!data,
      hasDataArray: Array.isArray(data?.data),
      length: data?.data?.length,
    });

    const matches = data.data.map(mapFinishedMatch);

    res.json(matches);
  } catch (error) {
    console.error("Erreur API football :", error);

    res.status(500).json({
      success: 0,
      message: "Impossible de récupérer les matchs terminés.",
    });
  }
});


export default router;