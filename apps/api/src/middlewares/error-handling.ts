import type { NextFunction, Request, Response } from "express";
import { log } from "@repo/logger";

const errorHandlerMiddleware = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  log(`Unhandled ERROR | ${error.message}`);

  return res.status(500).json({ message: "Something went wrong" });
};

export default errorHandlerMiddleware;
