import express, { type Express } from "express";
import cors from "cors";

export const createApp = (): Express => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return app;
};

export const app = createApp();
