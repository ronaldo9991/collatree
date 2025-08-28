import express from "express";
import { registerRoutes } from "../server/routes";
import { serveStatic } from "../server/vite";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes
await registerRoutes(app);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  serveStatic(app);
} else {
  // In development, serve a simple message
  app.get("*", (req, res) => {
    res.send("Development mode - use npm run dev for full functionality");
  });
}

export default app;
