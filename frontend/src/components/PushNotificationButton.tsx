
import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { subscribeToPush } from "@/lib/push";

export function PushNotificationButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleEnableNotifications = async () => {
    try {
      setLoading(true);
      setMessage("");

      await subscribeToPush();

      setMessage("Notifications NDEMBO activées !");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible d'activer les notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleEnableNotifications}
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? (
          "Activation..."
        ) : (
          <>
            <BellRing size={18} />
            Activer les notifications
          </>
        )}
      </button>

      {message && (
        <p className="text-sm text-center text-muted-foreground">
          {message}
        </p>
      )}
    </div>
  );
}
