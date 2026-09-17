import cors from "cors";
import express, { Express } from "express";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { sentenceRouter } from "./routes/sentence.routes";

export function createApp(): Express {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/sentences", sentenceRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
