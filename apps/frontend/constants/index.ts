export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PASSWORD_REGEX =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&`~*\-_+=;:,¿/(){}[\]|"'<>]).{8,}$/;
