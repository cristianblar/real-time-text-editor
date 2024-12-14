import neo4j, { type Driver } from "neo4j-driver";
import { log } from "@repo/logger";
import {
  type Document,
  type DocumentIdWithOwnerEmail,
  DocumentPermission,
  type User,
} from "@repo/types";

export interface Repository {
  createUser(email: string, hashedPassword: string): Promise<User | null>;
  getDocumentById(documentId: string): Promise<Document | null>;
  getEditableDocumentIdsWithOwnerEmails(
    email: string,
  ): Promise<DocumentIdWithOwnerEmail[]>;
  getInvitedUserEmailsToDocument(
    documentId: string,
  ): Promise<{ email: string; permission: DocumentPermission }[]>;
  getOwnedDocumentId(email: string): Promise<string | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserPermissionOnDocument(
    email: string,
    documentId: string,
  ): Promise<DocumentPermission | null>;
  getViewableDocumentIdsWithOwnerEmails(
    email: string,
  ): Promise<DocumentIdWithOwnerEmail[]>;
  inviteUserToEditDocument(email: string, documentId: string): Promise<boolean>;
  inviteUserToViewDocument(email: string, documentId: string): Promise<boolean>;
  removeUserFromDocument(email: string, documentId: string): Promise<boolean>;
  updateDocumentContent(
    documentId: string,
    content: string,
  ): Promise<Document | null>;
}

class Neo4jRepository implements Repository {
  private static instance: Neo4jRepository;
  private driver: Driver;

  private constructor(
    neo4jHost: string,
    neo4jPassword: string,
    neo4jPort: string,
    neo4jUsername: string,
  ) {
    this.driver = neo4j.driver(
      `bolt://${neo4jHost}:${neo4jPort}`,
      neo4j.auth.basic(neo4jUsername, neo4jPassword),
    );
  }

  public static getInstance(
    neo4jHost: string,
    neo4jPassword: string,
    neo4jPort: string,
    neo4jUsername: string,
  ): Neo4jRepository {
    if (!Neo4jRepository.instance) {
      try {
        Neo4jRepository.instance = new Neo4jRepository(
          neo4jHost,
          neo4jPassword,
          neo4jPort,
          neo4jUsername,
        );
      } catch (error: any) {
        if (error?.message)
          log(`ERROR | Neo4jRepository: constructor - ${error.message}`);
        throw error;
      }
    }

    return Neo4jRepository.instance;
  }

  private async run(query: string, params: Record<string, any>) {
    const session = this.driver.session();
    try {
      return await session.run(query, params);
    } finally {
      session.close();
    }
  }

  public async createUser(email: string, hashedPassword: string) {
    try {
      const result = await this.run(
        `
      CREATE (u:User {email: $email, password: $password})
      CREATE (d:Document)
      CREATE (u)-[:${DocumentPermission.OWNS}]->(d)
      RETURN u
      `,
        { email, password: hashedPassword },
      );
      return result.records.length > 0
        ? result.records[0].get("u").properties
        : null;
    } catch (error: any) {
      if (error?.message)
        log(`ERROR | Neo4jRepository: createUser - ${error.message}`);
      throw error;
    }
  }

  public async getDocumentById(documentId: string) {
    try {
      const result = await this.run(
        `
      MATCH (d:Document) WHERE elementId(d) = $documentId
      MATCH (o:User)-[:${DocumentPermission.OWNS}]->(d)
      RETURN d, o.email as ownerEmail
      `,
        { documentId },
      );
      return result.records.length > 0
        ? {
            ...result.records[0].get("d").properties,
            ownerEmail: result.records[0].get("ownerEmail"),
          }
        : null;
    } catch (error: any) {
      if (error?.message)
        log(`ERROR | Neo4jRepository: getDocumentById - ${error.message}`);
      throw error;
    }
  }

  public async getEditableDocumentIdsWithOwnerEmails(email: string) {
    try {
      const result = await this.run(
        `
      MATCH (u:User {email: $email})-[:${DocumentPermission.CAN_EDIT}]->(d:Document)
      MATCH (o:User)-[:${DocumentPermission.OWNS}]->(d)
      RETURN o.email as ownerEmail, d
      `,
        { email },
      );
      return result.records.map((record) => ({
        ownerEmail: record.get("ownerEmail"),
        documentId: record.get("d").elementId,
      }));
    } catch (error: any) {
      if (error?.message)
        log(
          `ERROR | Neo4jRepository: getEditableDocumentIdsWithOwnerEmails - ${error.message}`,
        );
      throw error;
    }
  }

  public async getInvitedUserEmailsToDocument(documentId: string) {
    try {
      const result = await this.run(
        `
      MATCH (u:User)-[r:${DocumentPermission.CAN_EDIT}|${DocumentPermission.CAN_VIEW}]->(d:Document)
      WHERE elementId(d) = $documentId
      RETURN u.email as email, type(r) as relation
      `,
        { documentId },
      );
      return result.records.map((record) => ({
        email: record.get("email"),
        permission: record.get("relation"),
      }));
    } catch (error: any) {
      if (error?.message)
        log(
          `ERROR | Neo4jRepository: getInvitedUserEmailsToDocument - ${error.message}`,
        );
      throw error;
    }
  }

  public async getOwnedDocumentId(email: string) {
    try {
      const result = await this.run(
        `
      MATCH (u:User {email: $email})-[:${DocumentPermission.OWNS}]->(d:Document)
      RETURN d
      `,
        { email },
      );
      return result.records.length > 0
        ? result.records[0].get("d").elementId
        : null;
    } catch (error: any) {
      if (error?.message)
        log(`ERROR | Neo4jRepository: getOwnedDocumentId - ${error.message}`);
      throw error;
    }
  }

  public async getUserByEmail(email: string) {
    try {
      const result = await this.run(
        `
      MATCH (u:User {email: $email})
      RETURN u
      `,
        { email },
      );
      return result.records.length > 0
        ? result.records[0].get("u").properties
        : null;
    } catch (error: any) {
      if (error?.message)
        log(`ERROR | Neo4jRepository: getUserByEmail - ${error.message}`);
      throw error;
    }
  }

  public async getUserPermissionOnDocument(email: string, documentId: string) {
    try {
      const result = await this.run(
        `
      MATCH (u:User {email: $email})-[r]->(d:Document)
      WHERE elementId(d) = $documentId
      RETURN type(r) as permission
      `,
        { email, documentId },
      );
      return result.records.length > 0
        ? result.records[0].get("permission")
        : null;
    } catch (error: any) {
      if (error?.message)
        log(
          `ERROR | Neo4jRepository: getUserPermissionOnDocument - ${error.message}`,
        );
      throw error;
    }
  }

  public async getViewableDocumentIdsWithOwnerEmails(email: string) {
    try {
      const result = await this.run(
        `
      MATCH (u:User {email: $email})-[:${DocumentPermission.CAN_VIEW}]->(d:Document)
      MATCH (o:User)-[:${DocumentPermission.OWNS}]->(d)
      RETURN o.email as ownerEmail, d
      `,
        { email },
      );
      return result.records.map((record) => ({
        ownerEmail: record.get("ownerEmail"),
        documentId: record.get("d").elementId,
      }));
    } catch (error: any) {
      if (error?.message)
        log(
          `ERROR | Neo4jRepository: getViewableDocumentIdsWithOwnerEmails - ${error.message}`,
        );
      throw error;
    }
  }

  public async inviteUserToEditDocument(email: string, documentId: string) {
    try {
      const result = await this.run(
        `
      MATCH (u:User {email: $email})
      MATCH (d:Document) WHERE elementId(d) = $documentId
      CREATE (u)-[e:${DocumentPermission.CAN_EDIT}]->(d)
      RETURN e
      `,
        { email, documentId },
      );
      return result.records.length > 0;
    } catch (error: any) {
      if (error?.message)
        log(
          `ERROR | Neo4jRepository: inviteUserToEditDocument - ${error.message}`,
        );
      throw error;
    }
  }

  public async inviteUserToViewDocument(email: string, documentId: string) {
    try {
      const result = await this.run(
        `
      MATCH (u:User {email: $email})
      MATCH (d:Document) WHERE elementId(d) = $documentId
      CREATE (u)-[v:${DocumentPermission.CAN_VIEW}]->(d)
      RETURN v
      `,
        { email, documentId },
      );
      return result.records.length > 0;
    } catch (error: any) {
      if (error?.message)
        log(
          `ERROR | Neo4jRepository: inviteUserToViewDocument - ${error.message}`,
        );
      throw error;
    }
  }

  public async removeUserFromDocument(email: string, documentId: string) {
    try {
      const result = await this.run(
        `
      MATCH (u:User {email: $email})
      MATCH (d:Document) WHERE elementId(d) = $documentId
      MATCH (u)-[r]-(d)
      DELETE r
      RETURN r
      `,
        { email, documentId },
      );
      return result.records.length > 0;
    } catch (error: any) {
      if (error?.message)
        log(
          `ERROR | Neo4jRepository: removeUserFromDocument - ${error.message}`,
        );
      throw error;
    }
  }

  public async updateDocumentContent(documentId: string, content: string) {
    try {
      const result = await this.run(
        `
      MATCH (d:Document) WHERE elementId(d) = $documentId
      SET d.content = $content
      RETURN d
      `,
        { documentId, content },
      );
      return result.records.length > 0
        ? result.records[0].get("d").properties
        : null;
    } catch (error: any) {
      if (error?.message)
        log(
          `ERROR | Neo4jRepository: updateDocumentContent - ${error.message}`,
        );
      throw error;
    }
  }
}

export default Neo4jRepository;
