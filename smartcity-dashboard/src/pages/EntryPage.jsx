import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_URL = "http://localhost:3001";

export default function EntryPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
 
    const token = params.get("token");

    if (!token) {
      setErrorMsg("Paramètres manquants (token).");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/sso/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          setErrorMsg("Token invalide ou erreur serveur.");
          return;
        }

        const data = await res.json(); // { ok, userId, email }
        sessionStorage.setItem("B_TOKEN", token);
        sessionStorage.setItem("B_USER", JSON.stringify(data));

        setUserInfo({ ...data}); // ✅ pour afficher
        

        // ✅ OPTIONNEL : si tu veux rediriger après 1-2 sec
        // setTimeout(() => navigate(`/services/${service}`, { replace: true }), 1200);

      } catch (e) {

        setErrorMsg("Erreur réseau (backend non accessible).");
        setLoading(false);
        return errorMsg;
      }
    })();
  }, [params, navigate]);

  return userInfo;
}
