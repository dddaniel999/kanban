import { jwtDecode } from "jwt-decode"; // funcție care decodează tokenul JWT

// Funcție reutilizabilă pentru fetch cu verificare de autentificare
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token"); // Ia tokenul JWT din localStorage

  // Dacă tokenul nu există, redirecționează utilizatorul spre pagina de login
  if (!token) {
    window.location.href = "/login";
    return;
  }

  try {
    // Decodează tokenul pentru a verifica data de expirare
    const decoded: any = jwtDecode(token);
    const now = Date.now() / 1000; // Timpul actual în secunde

    // Dacă tokenul a expirat, îl șterge și redirecționează spre login
    if (decoded.exp && decoded.exp < now) {
      console.warn("Token expirat!!");
      localStorage.removeItem("token");
      window.location.href = "/login";
      return;
    }
  } catch (e) {
    // Dacă tokenul nu poate fi decodat (e invalid), îl șterge și redirecționează
    console.error("Token invalid:", e);
    localStorage.removeItem("token");
    window.location.href = "/login";
    return;
  }

  // Setează antetele pentru cererea HTTP, incluzând tokenul în Authorization
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Efectuează cererea HTTP către URL-ul specificat
  const response = await fetch(url, { ...options, headers });

  // Dacă serverul răspunde cu 403, tokenul e probabil expirat sau nevalid
  if (response.status === 403) {
    console.warn("!! Acces interzis. Token posibil expirat.");
  }

  return response; // Returnează răspunsul (pentru prelucrare ulterioară)
};
