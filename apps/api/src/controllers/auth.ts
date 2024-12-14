import { type Handler, Router, type Request, type Response } from "express";
import { log } from "@repo/logger";
import { ServerError } from "@repo/types";
import { isValidEmail, isValidPassword } from "../utils";
import type { IUserService } from "../services/user";

const authController = (
  userService: IUserService,
  passportHandler: Handler,
): Router => {
  const router = Router();

  const checkSession = async (req: Request, res: Response) => {
    return res.status(204).send();
  };

  const signin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!(isValidEmail(email) && isValidPassword(password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    try {
      const token = await userService.signin(email, password);
      if (!token) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 43200000,
      });

      return res.status(204).send();
    } catch (error: any) {
      if (error?.message) log(`authController: signin - ${error.message}`);
      if (error instanceof ServerError) {
        return res.status(error.status).json({ message: error.message });
      } else {
        throw error;
      }
    }
  };

  const signup = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!(isValidEmail(email) && isValidPassword(password))) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    try {
      const user = await userService.signup(email, password);

      if (!user) {
        return res
          .status(409)
          .json({ message: "Email already has a registered account" });
      }

      return res.status(201).json(user);
    } catch (error: any) {
      if (error?.message) log(`authController: signup - ${error.message}`);
      if (error instanceof ServerError) {
        return res.status(error.status).json({ message: error.message });
      } else {
        throw error;
      }
    }
  };

  const logout = async (req: Request, res: Response) => {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
    });
    return res.status(204).send();
  };

  router.get("/check-session", passportHandler, checkSession);
  router.post("/signin", signin);
  router.post("/signup", signup);
  router.post("/logout", passportHandler, logout);

  return router;
};

export default authController;
