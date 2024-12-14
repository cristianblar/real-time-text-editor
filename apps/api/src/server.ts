import {
  createServer as createHttpServer,
  type Server as HttpServer,
} from "node:http";
import { json, urlencoded } from "body-parser";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import passport from "passport";
import authController from "./controllers/auth";
import getAuthSocketMiddleware from "./middlewares/auth/socket";
import checkDocumentAccess from "./middlewares/auth/check-document-access";
import collaborationController from "./controllers/collaboration";
import configurePassport from "./middlewares/auth/passport-jwt-strategy";
import documentsController from "./controllers/documents";
import DocumentService from "./services/document";
import errorHandlerMiddleware from "./middlewares/error-handling";
import Neo4jRepository from "./repositories/neo4j";
import UserDocumentService from "./services/user-document";
import UserService from "./services/user";

export const createServer = (): HttpServer => {
  const corsOptions = {
    origin: process.env.FRONTEND_DOMAIN || "http://localhost:3000",
    credentials: true,
  };

  const neo4jHost = process.env.NEO4J_HOST || "localhost";
  const neo4jPassword = process.env.NEO4J_PASSWORD || "abcd1234";
  const neo4jPort = process.env.NEO4J_PORT || "7687";
  const neo4jUsername = process.env.NEO4J_USERNAME || "neo4j";

  const neo4jRepository = Neo4jRepository.getInstance(
    neo4jHost,
    neo4jPassword,
    neo4jPort,
    neo4jUsername,
  );
  const userService = new UserService(neo4jRepository);
  const documentService = new DocumentService(neo4jRepository);
  const userDocumentService = new UserDocumentService(neo4jRepository);

  configurePassport(passport, userService);

  const passportHandler = passport.authenticate("jwt", { session: false });
  const checkDocumentAccessMiddleware =
    checkDocumentAccess.initialize(userDocumentService);
  const authRouter = authController(userService, passportHandler);
  const documentsRouter = documentsController(
    documentService,
    passportHandler,
    checkDocumentAccessMiddleware,
  );
  const collaborationRouter = collaborationController(
    userDocumentService,
    passportHandler,
    checkDocumentAccessMiddleware,
  );

  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cookieParser())
    .use(cors(corsOptions))
    .use(helmet())
    .use(passport.initialize())
    .use(errorHandlerMiddleware)
    .use("/auth", authRouter)
    .use("/documents", documentsRouter)
    .use("/collaboration", collaborationRouter)
    .get("/status", (_, res) => {
      return res.json({ ok: true });
    });

  const server = createHttpServer(app);

  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_DOMAIN || "http://localhost:3000",
      credentials: true,
    },
  });

  io.use(getAuthSocketMiddleware(userDocumentService));

  io.on("connection", (socket) => {
    socket.on("document:get-content", async (documentId) => {
      const fixedDocumentId = decodeURIComponent(documentId);
      socket.join(fixedDocumentId);
      socket.on("document:change", (data) => {
        socket.broadcast.to(fixedDocumentId).emit("document:update", data);
      });
      socket.on("document:save-content", async (content) => {
        await documentService.updateDocumentContent(fixedDocumentId, content);
      });

      const document = await documentService.getDocumentById(fixedDocumentId);

      if (document) {
        socket.emit("document:load-content", document.content ?? "");
      }
    });
  });

  return server;
};
