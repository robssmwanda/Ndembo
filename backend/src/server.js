
import express from "express";
import dotenv from "dotenv";

import connectDB from "./config/database.js";

import liveRoutes from "./routes/live.route.js";
import upcomingRoutes from "./routes/upcoming.route.js";
import finishedRoutes from "./routes/finished.route.js";
import matchRoutes from "./routes/match.route.js";
import competitionRoutes from "./routes/competition.route.js";
import teamRoutes from "./routes/team.route.js";
import pushRoutes from "./routes/push.route.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://ndembo-frontend.onrender.com",
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Vary", "Origin");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

const PORT = process.env.PORT || 3000;

app.use("/api/live", liveRoutes);
app.use("/api/upcoming", upcomingRoutes);
app.use("/api/finished", finishedRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/push", pushRoutes);
// Démarrage après connexion à MongoDB
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Ndembo server is running on port ${PORT}.`);
      console.log(
        `🔑 API key loaded: ${
          process.env.FOOTBALL_API_KEY ? "YES" : "NO"
        }`
      );
    });
  } catch (error) {
    console.error("❌ Impossible de démarrer Ndembo :", error);
    process.exit(1);
  }
};

startServer();
