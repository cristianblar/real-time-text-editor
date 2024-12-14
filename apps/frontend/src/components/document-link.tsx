import Link from "next/link";
import { Button } from "@/web/components/ui/button";
import { DocumentIdWithOwnerEmail } from "@repo/types";

interface DocumentLinkProps {
  document: DocumentIdWithOwnerEmail;
}

export function DocumentLink({ document }: DocumentLinkProps) {
  return (
    <Button asChild variant="outline" className="w-full justify-start">
      <Link href={`/documents/${document.documentId}`}>
        {document.ownerEmail} document
      </Link>
    </Button>
  );
}
