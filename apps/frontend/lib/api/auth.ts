import axios from "axios";
import type { User } from "@repo/types";
import { API_URL } from "../../constants";

const AUTH_PATH = "auth";

export const checkSession = async () => {
  const response = await axios.get(`${API_URL}/${AUTH_PATH}/check-session`, {
    withCredentials: true,
  });
  return response.data;
};

export const signin = async ({ email, password }: User) => {
  const response = await axios.post(
    `${API_URL}/${AUTH_PATH}/signin`,
    {
      email,
      password,
    },
    { withCredentials: true },
  );
  return response.data;
};

export const signup = async ({ email, password }: User) => {
  const response = await axios.post(`${API_URL}/${AUTH_PATH}/signup`, {
    email,
    password,
  });
  return response.data;
};

export const logout = async () => {
  const response = await axios.post(
    `${API_URL}/${AUTH_PATH}/logout`,
    undefined,
    { withCredentials: true },
  );
  return response.data;
};
