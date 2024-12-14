import { DocumentIdWithOwnerEmail } from "@repo/types";
import { DocumentLink } from "./document-link";

interface DocumentListProps {
  documents: DocumentIdWithOwnerEmail[] | DocumentIdWithOwnerEmail;
}

export function DocumentList({ documents }: DocumentListProps) {
  if (Array.isArray(documents) && documents.length === 0) {
    return <div>No documents found</div>;
  }

  return (
    <ul className="space-y-2">
      {Array.isArray(documents) ? (
        documents.map((doc) => (
          <li key={doc.documentId}>
            <DocumentLink document={doc} />
          </li>
        ))
      ) : (
        <li>
          <DocumentLink document={documents} />
        </li>
      )}
    </ul>
  );
}
