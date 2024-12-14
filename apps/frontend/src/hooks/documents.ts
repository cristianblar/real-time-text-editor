import { useQuery } from "@tanstack/react-query";
import {
  getDocument,
  getEditableDocuments,
  getOwnedDocuments,
  getViewableDocuments,
} from "@/web-lib/api/documents";

export const useDocument = (documentId: string, enabled = true) => {
  return useQuery({
    queryKey: ["document", documentId],
    queryFn: () => getDocument(documentId),
    enabled,
    retry: false,
  });
};

const useEditableDocuments = (enabled = true) => {
  return useQuery({
    queryKey: ["editable-documents"],
    queryFn: getEditableDocuments,
    enabled,
    retry: false,
  });
};

const useOwnedDocuments = (enabled = true) => {
  return useQuery({
    queryKey: ["owned-documents"],
    queryFn: getOwnedDocuments,
    enabled,
    retry: false,
  });
};

const useViewableDocuments = (enabled = true) => {
  return useQuery({
    queryKey: ["viewable-documents"],
    queryFn: getViewableDocuments,
    enabled,
    retry: false,
  });
};

export const useUserDocuments = (enabled = true) => {
  const {
    data: editableDocuments,
    isError: isErrorEditableDocuments,
    error: errorEditableDocuments,
    isLoading: isLoadingEditableDocuments,
  } = useEditableDocuments(enabled);
  const {
    data: ownedDocuments,
    isError: isErrorOwnedDocuments,
    error: errorOwnedDocuments,
    isLoading: isLoadingOwnedDocuments,
  } = useOwnedDocuments(enabled);
  const {
    data: viewableDocuments,
    isError: isErrorViewableDocuments,
    error: errorViewableDocuments,
    isLoading: isLoadingViewableDocuments,
  } = useViewableDocuments(enabled);

  const isLoading =
    isLoadingEditableDocuments ||
    isLoadingOwnedDocuments ||
    isLoadingViewableDocuments;
  const isError =
    isErrorEditableDocuments ||
    isErrorOwnedDocuments ||
    isErrorViewableDocuments;
  const error =
    errorEditableDocuments || errorOwnedDocuments || errorViewableDocuments;

  return {
    isLoading,
    isError,
    error,
    editableDocuments,
    ownedDocuments,
    viewableDocuments,
  };
};
