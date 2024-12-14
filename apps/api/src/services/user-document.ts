import type { DocumentPermission } from "@repo/types";
import type { Repository } from "../repositories/neo4j";

export interface IUserDocumentService {
  getUserDocumentRelationship(
    email: string,
    documentId: string,
  ): Promise<DocumentPermission | null>;
  inviteUserToEdit(email: string, documentId: string): Promise<boolean>;
  inviteUserToView(email: string, documentId: string): Promise<boolean>;
  removeUser(email: string, documentId: string): Promise<boolean>;
}

class UserDocumentService implements IUserDocumentService {
  constructor(private repository: Repository) {}

  public async getUserDocumentRelationship(
    email: string,
    documentId: string,
  ): Promise<DocumentPermission | null> {
    return await this.repository.getUserPermissionOnDocument(email, documentId);
  }

  public async inviteUserToEdit(
    email: string,
    documentId: string,
  ): Promise<boolean> {
    await this.repository.removeUserFromDocument(email, documentId);

    return await this.repository.inviteUserToEditDocument(email, documentId);
  }

  public async inviteUserToView(
    email: string,
    documentId: string,
  ): Promise<boolean> {
    await this.repository.removeUserFromDocument(email, documentId);

    return await this.repository.inviteUserToViewDocument(email, documentId);
  }

  public async removeUser(email: string, documentId: string): Promise<boolean> {
    return await this.repository.removeUserFromDocument(email, documentId);
  }
}

export default UserDocumentService;
