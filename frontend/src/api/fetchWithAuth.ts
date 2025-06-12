import { jwtDecode } from "jwt-decode";

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  try {
    const decoded: any = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp && decoded.exp < now) {
      console.warn("🔒 Token expirat");
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }
  } catch (e) {
    console.error("Token invalid:", e);
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 403) {
    console.warn("🔒 Acces interzis. Token posibil expirat.");
  }

  return response;
};
