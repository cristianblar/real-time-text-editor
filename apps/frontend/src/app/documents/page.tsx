"use client";

import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { DocumentList } from "@/web/components/document-list";
import { Navbar } from "@/web/components/navbar";
import { Skeleton } from "@/web/components/ui/skeleton";
import { useCheckSession } from "@/web/hooks/useCheckSession";
import { useUserDocuments } from "@/web/hooks/documents";

export default function Documents() {
  const router = useRouter();
  const {
    isLoading: isCheckingSession,
    isError: isCheckSessionError,
    error: checkSessionError,
    isSuccess: isAuthenticated,
  } = useCheckSession();
  const isUnauthorized =
    isCheckSessionError &&
    checkSessionError instanceof AxiosError &&
    checkSessionError?.response?.status === 401;

  const {
    editableDocuments,
    ownedDocuments,
    viewableDocuments,
    isError,
    isLoading,
  } = useUserDocuments(isAuthenticated);

  if (isUnauthorized) {
    return router.push("/");
  }

  if (isError) {
    return (
      <div className="container mx-auto p-4">
        Something went wrong, please try again.
      </div>
    );
  }

  if (isCheckingSession) {
    return (
      <div className="container flex items-center justify-center h-screen w-screen">
        <Skeleton className="h-390 w-350" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-8">
        <Skeleton className="h-8 w-64 mb-4" />
        {["owned", "viewable", "editable"].map((type) => (
          <div key={type}>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-40 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <Navbar mode="documents" />
      <div className="bg-[#ffffff] h-20 p-4"></div>
      <div className="container mx-auto p-4 space-y-8">
        <h1 className="text-2xl font-bold mb-4">Your Documents</h1>

        <section>
          <h2 className="text-xl font-semibold mb-2">Owned Document</h2>
          <DocumentList documents={ownedDocuments} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Viewable Documents</h2>
          <DocumentList documents={viewableDocuments} />
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">Editable Documents</h2>
          <DocumentList documents={editableDocuments} />
        </section>
      </div>
    </div>
  );
}
