import express from "express";
import { registerRoutes } from "../server/routes";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register API routes
registerRoutes(app).then(() => {
  // Serve static files in production
  if (process.env.NODE_ENV === "production") {
    // In production, serve static files from the built client
    app.use(express.static("client/dist"));
    app.get("*", (req, res) => {
      res.sendFile("client/dist/index.html", { root: process.cwd() });
    });
  } else {
    // In development, serve a simple message
    app.get("*", (req, res) => {
      res.send("Development mode - use npm run dev for full functionality");
    });
  }
});

export default app;
