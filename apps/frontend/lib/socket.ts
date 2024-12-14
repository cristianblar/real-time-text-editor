import { io, type Socket } from "socket.io-client";
import { API_URL } from "../constants";

export const getSocket = (documentId: string): Socket =>
  io(API_URL, {
    autoConnect: false,
    withCredentials: true,
    query: {
      documentId,
    },
  });
