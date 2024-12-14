import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { log } from "@repo/logger";
import { ServerError, type User } from "@repo/types";
import type { Repository } from "../repositories/neo4j";

export interface IUserService {
  checkUserByEmail(email: string): Promise<boolean>;
  signin(email: string, password: string): Promise<string | null>;
  signup(
    email: string,
    password: string,
  ): Promise<Omit<User, "password"> | null>;
}

class UserService implements IUserService {
  constructor(private repository: Repository) {}

  async checkUserByEmail(email: string): Promise<boolean> {
    try {
      const user = await this.repository.getUserByEmail(email);

      return !!user;
    } catch (error: any) {
      if (error?.message)
        log(`ERROR | UserService: checkUserByEmail - ${error.message}`);
      throw new ServerError("Internal server error", 500);
    }
  }

  async signin(email: string, password: string): Promise<string | null> {
    try {
      const user = await this.repository.getUserByEmail(email);

      if (!user) {
        return null;
      }

      const passwordsMatched = await bcrypt.compare(password, user.password);

      if (!passwordsMatched) {
        return null;
      }

      const token = jwt.sign({ email: user.email }, "your_jwt_secret", {
        expiresIn: "12h",
      });

      return token;
    } catch (error: any) {
      if (error?.message) log(`ERROR | UserService: signin - ${error.message}`);
      throw new ServerError("Internal server error", 500);
    }
  }

  async signup(
    email: string,
    password: string,
  ): Promise<Omit<User, "password"> | null> {
    try {
      const user = await this.repository.getUserByEmail(email);

      if (user) {
        return null;
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = await this.repository.createUser(email, hashedPassword);

      if (!newUser) {
        throw new Error("Failed to create user in the database");
      }

      return { email: newUser.email };
    } catch (error: any) {
      if (error?.message) log(`ERROR | UserService: signup - ${error.message}`);
      throw new ServerError("Internal server error", 500);
    }
  }
}

export default UserService;
