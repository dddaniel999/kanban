import toast from "react-hot-toast";

export const isTokenValid = (): boolean => {
  const token = localStorage.getItem("token");
  return token !== null && token !== "undefined" && token.trim() !== "";
};

const checkAuthAndRedirect = (): boolean => {
  const valid = isTokenValid();

  if (!valid) {
    toast.error(
      "Token invalid sau expirat. Te rugăm să te autentifici din nou."
    );
    // adăugăm un mic delay ca să oprească complet execuția locală
    setTimeout(() => {
      window.location.href = "/login";
    }, 100); // mic delay ca să permită toast-ul

    return false;
  }

  return true;
};

export default checkAuthAndRedirect;
