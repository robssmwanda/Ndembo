
import "../config/env.js";
import webpush from "web-push";
import PushSubscription from "../models/pushSubscription.model.js";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Enregistrer un abonnement
export async function savePushSubscription(subscription) {
  const { endpoint, expirationTime, keys } = subscription;

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    throw new Error("Abonnement Push invalide");
  }

  return PushSubscription.findOneAndUpdate(
    { endpoint },
    {
      endpoint,
      expirationTime: expirationTime ?? null,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    },
    { upsert: true, new: true, runValidators: true }
  );
}

// Supprimer un abonnement
export async function removePushSubscription(endpoint) {
  return PushSubscription.deleteOne({ endpoint });
}

// Envoyer une notification à tous les abonnés
export async function sendPushNotification(payload) {
  const subscriptions = await PushSubscription.find();

  const results = await Promise.allSettled(
    subscriptions.map(async (subscription) => {
      const pushSubscription = {
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime,
        keys: subscription.keys,
      };

      try {
        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(payload)
        );
      } catch (error) {
        if (error.statusCode === 404 || error.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: subscription._id });
        } else {
          throw error;
        }
      }
    })
  );

  return results;
}
