import type { NextFunction, Request, Response } from "express";
import type { DocumentPermission, User } from "@repo/types";
import type { IUserDocumentService } from "../../services/user-document";

const checkDocumentAccess = {
  initialize(userDocumentService: IUserDocumentService) {
    return async function (req: Request, res: Response, next: NextFunction) {
      const user = req.user as User | undefined | null;
      const { documentId } = req.params;

      if (!user?.email) {
        return res.status(401).send("Unauthorized");
      }

      if (!documentId) {
        return res.status(400).send("Bad request");
      }

      const userPermission =
        await userDocumentService.getUserDocumentRelationship(
          user.email,
          documentId,
        );

      if (!userPermission) {
        return res.status(403).send("Forbidden");
      }

      (
        req as Request & { documentRelationship: DocumentPermission }
      ).documentRelationship = userPermission;
      next();
    };
  },
};

export default checkDocumentAccess;
