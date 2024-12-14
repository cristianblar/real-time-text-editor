import { type Handler, Router, type Request, type Response } from "express";
import { log } from "@repo/logger";
import { DocumentPermission, ServerError, type User } from "@repo/types";
import { isValidEmail } from "../utils";
import type { IUserDocumentService } from "../services/user-document";

const collaborationController = (
  userDocumentService: IUserDocumentService,
  passportHandler: Handler,
  checkDocumentAccessMiddleware: Handler,
): Router => {
  const router = Router();

  const inviteCollaborator = async (req: Request, res: Response) => {
    const { documentId } = req.params;
    const { email, permission } = req.body;

    const user = req.user as User;
    const { documentRelationship } = req as Request & {
      documentRelationship: DocumentPermission;
    };

    if (documentRelationship !== DocumentPermission.OWNS) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (
      !(
        isValidEmail(email) &&
        (permission === DocumentPermission.CAN_EDIT ||
          permission === DocumentPermission.CAN_VIEW) &&
        email !== user.email
      )
    ) {
      return res.status(400).json({ message: "Bad request" });
    }

    try {
      const result =
        permission === DocumentPermission.CAN_EDIT
          ? await userDocumentService.inviteUserToEdit(email, documentId)
          : await userDocumentService.inviteUserToView(email, documentId);

      if (result) {
        return res.status(204).send();
      }

      return res.status(400).json({ message: "Bad request" });
    } catch (error: any) {
      if (error?.message)
        log(`collaborationController: inviteCollaborator - ${error.message}`);
      if (error instanceof ServerError) {
        return res.status(error.status).json({ message: error.message });
      } else {
        throw error;
      }
    }
  };

  const removeCollaborator = async (req: Request, res: Response) => {
    const { documentId } = req.params;
    const { email } = req.body;

    const user = req.user as User;
    const { documentRelationship } = req as Request & {
      documentRelationship: DocumentPermission;
    };

    if (documentRelationship !== DocumentPermission.OWNS) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!(isValidEmail(email) && email !== user.email)) {
      return res.status(400).json({ message: "Bad request" });
    }

    try {
      const result = await userDocumentService.removeUser(email, documentId);

      if (result) {
        return res.status(204).send();
      }

      return res.status(400).json({ message: "Bad request" });
    } catch (error: any) {
      if (error?.message)
        log(`collaborationController: removeCollaborator - ${error.message}`);
      if (error instanceof ServerError) {
        return res.status(error.status).json({ message: error.message });
      } else {
        throw error;
      }
    }
  };

  router.post(
    "/:documentId/invite",
    passportHandler,
    checkDocumentAccessMiddleware,
    inviteCollaborator,
  );
  router.post(
    "/:documentId/remove",
    passportHandler,
    checkDocumentAccessMiddleware,
    removeCollaborator,
  );

  return router;
};

export default collaborationController;
