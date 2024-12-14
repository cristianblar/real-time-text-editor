import { Handler, Router, Request, Response } from "express";
import { log } from "@repo/logger";
import { DocumentPermission, ServerError, type User } from "@repo/types";
import type { IDocumentService } from "../services/document";

const documentsController = (
  documentService: IDocumentService,
  passportHandler: Handler,
  checkDocumentAccessMiddleware: Handler,
): Router => {
  const router = Router();

  const getDocumentById = async (req: Request, res: Response) => {
    const { documentId } = req.params;

    try {
      const document = await documentService.getDocumentById(documentId);

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      const { documentRelationship } = req as Request & {
        documentRelationship: DocumentPermission;
      };

      if (documentRelationship === DocumentPermission.OWNS) {
        const invitedUsers =
          await documentService.getInvitedUserEmailsToDocument(documentId);
        return res.json({
          document,
          permission: documentRelationship,
          invitedUsers,
        });
      }

      return res.json({ document, permission: documentRelationship });
    } catch (error: any) {
      if (error?.message)
        log(`documentsController: getDocumentById - ${error.message}`);
      if (error instanceof ServerError) {
        return res.status(error.status).json({ message: error.message });
      } else {
        throw error;
      }
    }
  };

  const getEditableDocuments = async (req: Request, res: Response) => {
    const user = req.user as User;

    try {
      const editableDocumentsMetadata =
        await documentService.getEditableDocumentsIdsWithOwnerEmails(
          user.email,
        );

      return res.json(editableDocumentsMetadata);
    } catch (error: any) {
      if (error?.message)
        log(`documentsController: getEditableDocuments - ${error.message}`);
      if (error instanceof ServerError) {
        return res.status(error.status).json({ message: error.message });
      } else {
        throw error;
      }
    }
  };

  const getOwnedDocument = async (req: Request, res: Response) => {
    const user = req.user as User;

    try {
      const ownedDocumentId = await documentService.getOwnedDocumentId(
        user.email,
      );

      if (!ownedDocumentId) {
        return res.status(404).json({ message: "Document not found" });
      }

      return res.json({ documentId: ownedDocumentId, ownerEmail: user.email });
    } catch (error: any) {
      if (error?.message)
        log(`documentsController: getOwnedDocument - ${error.message}`);
      if (error instanceof ServerError) {
        return res.status(error.status).json({ message: error.message });
      } else {
        throw error;
      }
    }
  };

  const getViewableDocuments = async (req: Request, res: Response) => {
    const user = req.user as User;

    try {
      const viewableDocumentsMetadata =
        await documentService.getViewableDocumentIdsWithOwnerEmails(user.email);

      return res.json(viewableDocumentsMetadata);
    } catch (error: any) {
      if (error?.message)
        log(`documentsController: getViewableDocuments - ${error.message}`);
      if (error instanceof ServerError) {
        return res.status(error.status).json({ message: error.message });
      } else {
        throw error;
      }
    }
  };

  const updateDocumentContent = async (req: Request, res: Response) => {
    const { documentId } = req.params;
    const { documentRelationship } = req as Request & {
      documentRelationship: DocumentPermission;
    };
    const { content } = req.body;

    if (documentRelationship === DocumentPermission.CAN_VIEW) {
      return res.status(403).json({ message: "Forbidden" });
    }

    try {
      const document = await documentService.updateDocumentContent(
        documentId,
        content,
      );

      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      return res.json(document);
    } catch (error: any) {
      if (error?.message)
        log(`documentsController: updateDocumentContent - ${error.message}`);
      if (error instanceof ServerError) {
        return res.status(error.status).json({ message: error.message });
      } else {
        throw error;
      }
    }
  };

  router.get("/editable", passportHandler, getEditableDocuments);
  router.get("/owned", passportHandler, getOwnedDocument);
  router.get("/viewable", passportHandler, getViewableDocuments);
  router.get(
    "/:documentId",
    passportHandler,
    checkDocumentAccessMiddleware,
    getDocumentById,
  );
  router.put(
    "/:documentId",
    passportHandler,
    checkDocumentAccessMiddleware,
    updateDocumentContent,
  );

  return router;
};

export default documentsController;
