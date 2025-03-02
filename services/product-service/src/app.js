import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
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

const port = process.env.PORT || 3000;

console.log(`App starting with NODE_ENV=${process.env.NODE_ENV}`);

// Connexion à la base de données
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", service: "product-service" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`Product service running on port ${port}`);
  });
}

export default app;
