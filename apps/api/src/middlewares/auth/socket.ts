import jwt, { JwtPayload } from "jsonwebtoken";
import type { ExtendedError, Socket } from "socket.io";
import { IUserDocumentService } from "../../services/user-document";

function getAuthSocketMiddleware(userDocumentService: IUserDocumentService) {
  return async function authSocketMiddleware(
    socket: Socket,
    next: (err?: ExtendedError | undefined) => void,
  ) {
    const cookieHeader = socket.handshake.headers.cookie;
    const documentId = decodeURIComponent(
      socket.handshake.query.documentId as string,
    );

    if (!cookieHeader) return next(new Error("Authentication error"));

    if (!documentId) {
      return next(new Error("Document ID is required"));
    }

    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => c.split("=")),
    );
    const token = cookies?.token;

    if (!token) return next(new Error("Authentication error"));

    try {
      const payload = jwt.verify(token, "your_jwt_secret");
      const email = (payload as JwtPayload).email;

      const documentPermission =
        await userDocumentService.getUserDocumentRelationship(
          email,
          documentId,
        );

      if (!documentPermission) {
        return next(new Error("Authentication error"));
      }

      (socket as Socket & { user: { email: string } }).user = { email };
      (socket as Socket & { documentId: string }).documentId = documentId;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  };
}

export default getAuthSocketMiddleware;
