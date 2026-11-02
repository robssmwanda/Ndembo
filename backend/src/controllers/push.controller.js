
import {
  savePushSubscription,
  removePushSubscription,
} from "../services/push.service.js";

export async function subscribePush(req, res) {
  try {
    const subscription = await savePushSubscription(req.body);

    res.status(201).json({
      success: true,
      message: "Abonnement Push enregistré",
      id: subscription._id,
    });
  } catch (error) {
    console.error("Erreur abonnement Push :", error.message);

    res.status(400).json({
      success: false,
      message: "Impossible d'enregistrer l'abonnement",
    });
  }
}

export async function unsubscribePush(req, res) {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        success: false,
        message: "Endpoint manquant",
      });
    }

    await removePushSubscription(endpoint);

    res.json({
      success: true,
      message: "Abonnement Push supprimé",
    });
  } catch (error) {
    console.error("Erreur désabonnement Push :", error.message);

    res.status(500).json({
      success: false,
      message: "Impossible de supprimer l'abonnement",
    });
  }
}
