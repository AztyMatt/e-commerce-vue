import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import promBundle from "express-prom-bundle";
import client from "prom-client";

dotenv.config();

const app = express();

const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total HTTP requests received",
});

const responseTimeHistogram = new client.Histogram({
  name: "http_response_time_seconds",
  help: "Response time in seconds",
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

app.use((req, res, next) => {
  httpRequestCounter.inc();
  const start = Date.now();
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    responseTimeHistogram.observe(duration);
  });
  next();
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

const port = process.env.PORT || 3001;

// Ne pas connecter MongoDB si en mode test
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

app.use(
  cors({
    origin: "http://localhost:8080", // Remplacez par l'URL exacte du frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
// Middleware pour le logging des requêtes
app.use((req, res, next) => {
  console.log(`Requête reçue sur le chemin : ${req.method} ${req.originalUrl}`);
  next();
});
// Routes
app.post("/api/auth/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Invalid request data" });
  }
  res.json({ message: "Utilisateur créé avec succès", token: "dummy-token" });
});
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", service: "auth-service" });
});
app.get("/api/auth/ping", (req, res) => {
  res.json({ message: "Auth service is reachable" });
});
if (process.env.NODE_ENV !== "test") {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Auth service running on port ${port}`);
  });
}

export default app;
