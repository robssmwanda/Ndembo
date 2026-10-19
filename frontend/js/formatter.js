export function formatStatus(status) {
  const statuses = {
    live: "En direct",
    upcoming: "À venir",
    finished: "Terminé",
    unknown: "Inconnu",
  };

  return statuses[status] || "Inconnu";
}