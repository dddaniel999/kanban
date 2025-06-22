import { jwtDecode } from "jwt-decode"; // funcție care decodează tokenul JWT

// Funcție reutilizabilă pentru fetch cu verificare de autentificare și expirare JWT
export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = localStorage.getItem("token"); // Ia tokenul JWT din localStorage

  // Dacă tokenul nu există, redirecționează utilizatorul spre pagina de login
  if (!token) {
    window.location.href = "/login";
    throw new Error("Token lipsă. Redirecționare spre login.");
  }

  try {
    // Decodează tokenul pentru a verifica data de expirare
    const decoded: any = jwtDecode(token);
    const now = Date.now() / 1000; // Timpul actual în secunde

    // Dacă tokenul a expirat, îl șterge și redirecționează spre login
    if (decoded.exp && decoded.exp < now) {
      console.warn("Token expirat!");
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Token expirat. Redirecționare spre login.");
    }
  } catch (e) {
    // Dacă tokenul nu poate fi decodat (e invalid), îl șterge și redirecționează
    console.error("Token invalid:", e);
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Token invalid. Redirecționare spre login.");
  }

  // Setează antetele pentru cererea HTTP, incluzând tokenul în Authorization
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  // Efectuează cererea HTTP către URL-ul specificat, cu antetele incluse
  const response = await fetch(url, { ...options, headers });

  // Dacă serverul răspunde cu o eroare (ex. 403, 500), o tratează și o afișează
  if (!response.ok) {
    const errorText = await response.text(); // Citește mesajul de eroare din răspuns
    console.warn(`Eroare HTTP ${response.status}:`, errorText);
    throw new Error(`Request eșuat: ${response.status}`);
  }

  return response; // Returnează răspunsul (pentru prelucrare ulterioară)
};
