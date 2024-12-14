"use client";

import { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { useEditor } from "@tiptap/react";
import { useParams, useRouter } from "next/navigation";
import type { Socket } from "socket.io-client";
import StarterKit from "@tiptap/starter-kit";
import { DocumentPermission } from "@repo/types";
import { DocumentNotFound } from "@/web/components/document-not-found";
import { getSocket } from "@/web-lib/socket";
import { Navbar } from "@/web/components/navbar";
import { SaveStatus, useDebouncedSave } from "@/web/hooks/useDebouncedSave";
import { Skeleton } from "@/web/components/ui/skeleton";
import { useCheckSession } from "@/web/hooks/useCheckSession";
import { useDocument } from "@/web/hooks/documents";
import TextEditor from "./components/text-editor";
import TextEditorToolbar from "./components/toolbar/toolbar";

const extensions = [StarterKit];

type DocumentParams = {
  documentId: string;
};

export default function Document() {
  const [localSocket, setLocalSocket] = useState<Socket | null>(null);
  const [documentLoaded, setDocumentLoaded] = useState(false);

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

  const { documentId } = useParams<DocumentParams>();
  const { isLoading, isError, error, data, refetch } = useDocument(
    documentId,
    isAuthenticated,
  );
  const canEdit =
    data?.permission === DocumentPermission.CAN_EDIT ||
    data?.permission === DocumentPermission.OWNS;

  const isNotFound =
    isError &&
    error instanceof AxiosError &&
    (error?.response?.status === 403 || error?.response?.status === 404);

  const editor = useEditor({
    content: "Loading...",
    editable: false,
    editorProps: {
      attributes: {
        class:
          "bg-white border border-[#c7c7c7] max-w-full mx-auto p-12 w-full focus:outline-none print:border-0 print:h-full print:p-0 print:w-full",
      },
    },
    extensions,
    immediatelyRender: false,
  });

  const saveCallback = useCallback(
    (content: string) => {
      localSocket?.emit("document:save-content", content);
    },
    [localSocket],
  );

  const { saveStatus, triggerSave } = useDebouncedSave(saveCallback);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (saveStatus === SaveStatus.UNSAVED) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [saveStatus]);

  useEffect(() => {
    if (isAuthenticated && !isUnauthorized) {
      if (!localSocket) {
        setLocalSocket(getSocket(documentId));
      }

      if (localSocket) {
        localSocket.connect();
      }

      return () => {
        const editorContent = editor?.getJSON();
        if (editorContent) {
          saveCallback(JSON.stringify(editorContent));
        }
        localSocket?.disconnect();
      };
    }
  }, [
    documentId,
    editor,
    isAuthenticated,
    isUnauthorized,
    localSocket,
    saveCallback,
  ]);

  useEffect(() => {
    if (editor && localSocket) {
      localSocket.once("document:load-content", (jsonContent: string) => {
        if (!jsonContent) {
          editor.commands.clearContent();
        } else {
          editor.commands.setContent(JSON.parse(jsonContent));
        }
        editor.setEditable(canEdit);
        setDocumentLoaded(true);
      });

      localSocket.emit("document:get-content", documentId);
    }
  }, [canEdit, documentId, editor, localSocket]);

  useEffect(() => {
    if (editor && localSocket && canEdit && documentLoaded) {
      const handler = ({ editor }: { editor: { getJSON: () => object } }) => {
        triggerSave(JSON.stringify(editor.getJSON()));
      };

      editor.on("update", handler);

      return () => {
        editor.off("update", handler);
      };
    }
  }, [canEdit, documentLoaded, editor, localSocket, triggerSave]);

  useEffect(() => {
    if (editor && localSocket) {
      const handler = ({ editor }: { editor: { getJSON: () => object } }) => {
        localSocket.emit("document:change", JSON.stringify(editor.getJSON()));
      };

      editor.on("update", handler);

      return () => {
        editor.off("update", handler);
      };
    }
  }, [editor, localSocket]);

  useEffect(() => {
    if (editor && localSocket) {
      const handler = (jsonContent: string) => {
        editor.commands.setContent(JSON.parse(jsonContent));
      };

      localSocket.on("document:update", handler);

      return () => {
        localSocket.off("update", handler);
      };
    }
  }, [editor, localSocket]);

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

  if (isNotFound) {
    return <DocumentNotFound />;
  }

  if (isLoading || !editor) {
    return (
      <div className="box-border h-screen w-screen p-4">
        <Skeleton className="h-1/6 w-full px-2 py-4" />
        <div className="h-1/6"></div>
        <Skeleton className="h-4/6 w-full px-12" />
      </div>
    );
  }

  return (
    <div>
      <Navbar
        documentId={documentId}
        invitedUsers={data.invitedUsers}
        mode="document"
        ownerEmail={data.document.ownerEmail}
        saveStatus={saveStatus}
        refetchDocument={refetch}
      />
      <TextEditorToolbar editor={editor} />
      <div className="bg-[#f9fbfd] h-[72px] print:hidden"></div>
      <div className="bg-[#f9fbfd] h-20 p-4 print:hidden"></div>
      <TextEditor editor={editor} />
    </div>
  );
}
