export interface Document {
  content?: string;
}

export interface DocumentIdWithOwnerEmail {
  documentId: string;
  ownerEmail: string;
}

export enum DocumentPermission {
  CAN_EDIT = "CAN_EDIT",
  CAN_VIEW = "CAN_VIEW",
  OWNS = "OWNS",
}
