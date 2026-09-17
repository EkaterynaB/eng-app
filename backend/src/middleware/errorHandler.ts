import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

export function notFoundHandler(_req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(404, "Route not found"));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err && typeof err === "object" && "name" in err && (err as { name: unknown }).name === "ValidationError") {
    res.status(400).json({ error: (err as Error).message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
