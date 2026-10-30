import express from "express";
import dotenv from "dotenv";
import liveRoutes from "./routes/live.route.js";
import upcomingRoutes from "./routes/upcoming.route.js";
import finishedRoutes from "./routes/finished.route.js";
import matchRoutes from "./routes/match.route.js";
import competitionRoutes from "./routes/competition.route.js";
import teamRoutes from "./routes/team.route.js";

dotenv.config();

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

const PORT = process.env.PORT || 3000;

app.use("/api/live", liveRoutes);
app.use("/api/upcoming", upcomingRoutes);
app.use("/api/finished", finishedRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/teams", teamRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Ndembo server is running on port ${PORT}.`);
  console.log(
    `🔑 API key loaded: ${
      process.env.FOOTBALL_API_KEY ? "YES" : "NO"
    }`
  );
});