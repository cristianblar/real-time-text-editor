import axios from "axios";
import { API_URL } from "../../constants";

const DOCUMENTS_PATH = "documents";

export const getDocument = async (documentId: string) => {
  const response = await axios.get(
    `${API_URL}/${DOCUMENTS_PATH}/${documentId}`,
    { withCredentials: true },
  );
  return response.data;
};

export const getEditableDocuments = async () => {
  const response = await axios.get(`${API_URL}/${DOCUMENTS_PATH}/editable`, {
    withCredentials: true,
  });
  return response.data;
};

export const getOwnedDocuments = async () => {
  const response = await axios.get(`${API_URL}/${DOCUMENTS_PATH}/owned`, {
    withCredentials: true,
  });
  return response.data;
};

export const getViewableDocuments = async () => {
  const response = await axios.get(`${API_URL}/${DOCUMENTS_PATH}/viewable`, {
    withCredentials: true,
  });
  return response.data;
};

export const updateDocumentContent = async (
  documentId: string,
  content: string,
) => {
  const response = await axios.put(
    `${API_URL}/${DOCUMENTS_PATH}/${documentId}`,
    { content },
    { withCredentials: true },
  );
  return response.data;
};
