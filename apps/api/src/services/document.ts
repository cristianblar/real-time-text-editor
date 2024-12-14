import { log } from "@repo/logger";
import {
  type Document,
  type DocumentIdWithOwnerEmail,
  type DocumentPermission,
  ServerError,
} from "@repo/types";
import type { Repository } from "../repositories/neo4j";

export interface IDocumentService {
  getDocumentById(documentId: string): Promise<Document | null>;
  getEditableDocumentsIdsWithOwnerEmails(
    email: string,
  ): Promise<DocumentIdWithOwnerEmail[]>;
  getInvitedUserEmailsToDocument(
    documentId: string,
  ): Promise<{ email: string; permission: DocumentPermission }[]>;
  getOwnedDocumentId(email: string): Promise<string | null>;
  getViewableDocumentIdsWithOwnerEmails(
    email: string,
  ): Promise<DocumentIdWithOwnerEmail[]>;
  updateDocumentContent(
    documentId: string,
    content: string,
  ): Promise<Document | null>;
}

class DocumentService implements IDocumentService {
  constructor(private repository: Repository) {}

  public async getDocumentById(documentId: string): Promise<Document | null> {
    try {
      return await this.repository.getDocumentById(documentId);
    } catch (error: any) {
      if (error?.message)
        log(`ERROR | DocumentService: getDocumentById - ${error.message}`);
      throw new ServerError("Internal server error", 500);
    }
  }

  public async getEditableDocumentsIdsWithOwnerEmails(
    email: string,
  ): Promise<DocumentIdWithOwnerEmail[]> {
    try {
      return await this.repository.getEditableDocumentIdsWithOwnerEmails(email);
    } catch (error: any) {
      if (error?.message)
        log(
          `ERROR | DocumentService: getEditableDocumentsIdsWithOwnerEmails - ${error.message}`,
        );
      throw new ServerError("Internal server error", 500);
    }
  }

  public async getInvitedUserEmailsToDocument(documentId: string) {
    try {
      return await this.repository.getInvitedUserEmailsToDocument(documentId);
    } catch (error: any) {
      if (error?.message)
        log(
          `ERROR | DocumentService: getInvitedUserEmailsToDocument - ${error.message}`,
        );
      throw new ServerError("Internal server error", 500);
    }
  }

  public async getOwnedDocumentId(email: string): Promise<string | null> {
    try {
      return await this.repository.getOwnedDocumentId(email);
    } catch (error: any) {
      if (error?.message)
        log(`ERROR | DocumentService: getOwnedDocumentId - ${error.message}`);
      throw new ServerError("Internal server error", 500);
    }
  }

  public async getViewableDocumentIdsWithOwnerEmails(
    email: string,
  ): Promise<DocumentIdWithOwnerEmail[]> {
    try {
      return await this.repository.getViewableDocumentIdsWithOwnerEmails(email);
    } catch (error: any) {
      if (error?.message)
        log(
          `ERROR | DocumentService: getViewableDocumentIdsWithOwnerEmails - ${error.message}`,
        );
      throw new ServerError("Internal server error", 500);
    }
  }

  public async updateDocumentContent(
    documentId: string,
    content: string,
  ): Promise<Document | null> {
    try {
      return await this.repository.updateDocumentContent(documentId, content);
    } catch (error: any) {
      if (error?.message)
        log(
          `ERROR | DocumentService: updateDocumentContent - ${error.message}`,
        );
      throw new ServerError("Internal server error", 500);
    }
  }
}

export default DocumentService;
