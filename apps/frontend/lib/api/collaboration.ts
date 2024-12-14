import axios from "axios";
import { DocumentPermission } from "@repo/types";
import { API_URL } from "../../constants";

const COLLABORATION_PATH = "collaboration";

export const inviteUser = async ({
  documentId,
  email,
  permission,
}: {
  documentId: string;
  email: string;
  permission: DocumentPermission;
}) => {
  const response = await axios.post(
    `${API_URL}/${COLLABORATION_PATH}/${documentId}/invite`,
    { email, permission },
    { withCredentials: true },
  );
  return response.data;
};

export const removeUser = async ({
  documentId,
  email,
}: {
  documentId: string;
  email: string;
}) => {
  const response = await axios.post(
    `${API_URL}/${COLLABORATION_PATH}/${documentId}/remove`,
    { email },
    { withCredentials: true },
  );
  return response.data;
};
