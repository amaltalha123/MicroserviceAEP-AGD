import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const API_URL = "http://localhost:3001";

export default function EntryPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
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
          setLoading(false);
          return;
        }

        const data = await res.json(); // { ok, userId, email }
        sessionStorage.setItem("B_TOKEN", token);
        sessionStorage.setItem("B_USER", JSON.stringify(data));

        setUserInfo({ ...data}); // ✅ pour afficher
        setLoading(false);

        // ✅ OPTIONNEL : si tu veux rediriger après 1-2 sec
        // setTimeout(() => navigate(`/services/${service}`, { replace: true }), 1200);

      } catch (e) {
        setErrorMsg("Erreur réseau (backend non accessible).");
        setLoading(false);
      }
    })();
  }, [params, navigate]);

  // ✅ Affichage
  if (loading) return <div>Connexion au service…</div>;

  if (errorMsg) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Erreur</h2>
        <p>{errorMsg}</p>
        <button onClick={() => navigate("/error", { replace: true })}>
          Aller à /error
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Accès autorisé ✅</h2>
      <p><b>UserId:</b> {userInfo?.userId}</p>
      <p><b>Email:</b> {userInfo?.email}</p>

      <hr />

      <h3>Données complètes</h3>
      <pre>{JSON.stringify(userInfo, null, 2)}</pre>

      {/* ✅ Si tu veux un bouton pour continuer vers la page du service */}
     
    </div>
  );
}
