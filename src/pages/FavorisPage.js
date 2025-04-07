import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { logementService } from "../services/LogementService";
import { FaHeart } from "react-icons/fa";
import "../styles/Home.css";
import "../styles/Favoris.css";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
const FavorisPage = () => {
  const [favoris, setFavoris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté en tant que client
    if (!user || user.role !== "client") {
      setError(
        "Vous devez être connecté en tant que client pour voir vos favoris"
      );
      setLoading(false);
      return;
    }

    fetchFavoris();
  }, [user]);

  const fetchFavoris = async () => {
    try {
      setLoading(true);
      const data = await logementService.getMesFavoris();
      if (Array.isArray(data)) {
        setFavoris(data);
      } else {
        setError("Format de données incorrect");
        console.error("Format de données incorrect:", data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors du chargement des favoris"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const supprimerDesFavoris = async (logementId) => {
    try {
      await logementService.supprimerDesFavoris(logementId);
      // Mettre à jour la liste des favoris après la suppression
      setFavoris(favoris.filter((logement) => logement._id !== logementId));
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors de la suppression du favori"
      );
      console.error(err);
    }
  };

  const renderErrorMessage = () =>
    error && (
      <div
        className="alert alert-danger"
        style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1000 }}
      >
        {error}
        <button
          onClick={() => setError("")}
          style={{
            marginLeft: "10px",
            border: "none",
            background: "transparent",
          }}
        >
          ×
        </button>
      </div>
    );

  const renderFavorisList = () => {
    if (loading)
      return <div className="loading">Chargement de vos favoris...</div>;

    if (!user || user.role !== "client") {
      return (
        <div className="favoris-require-login">
          <h3>Connectez-vous pour voir vos favoris</h3>
          <button className="btn-primary" onClick={() => navigate("/login")}>
            Se connecter
          </button>
        </div>
      );
    }

    if (!Array.isArray(favoris) || favoris.length === 0) {
      return (
        <div className="empty-favoris">
          <h3>Vous n'avez pas encore de favoris</h3>
          <p>Explorez nos logements et ajoutez-les à vos favoris</p>
          <button className="btn-primary" onClick={() => navigate("/")}>
            Découvrir des logements
          </button>
        </div>
      );
    }

    return (
      <div className="logements-grid">
        {favoris.map((logement) => (
          <div key={logement._id} className="logement-card">
            <div className="logement-image">
              <img
                src={logement.photoprincipale}
                alt={logement.titre}
                onError={(e) => {
                  e.target.src = "../images/image.png";
                }}
              />
              <button
                className="favoris-button"
                onClick={() => supprimerDesFavoris(logement._id)}
              >
                <FaHeart className="favoris-icon active" />
              </button>
            </div>
            <div className="logement-details">
              <h3>{logement.titre}</h3>
              <p className="logement-price">
                {logement.prix?.toLocaleString() || "Prix non disponible"} €
              </p>
              <p className="logement-address">
                {logement.adresse?.ville || "Ville non spécifiée"},
                {logement.adresse?.pays || "Pays non spécifié"}
              </p>
              <div className="logement-specs">
                <span>
                  {logement.description || "Pas de description disponible"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="favoris-container">
        <h1>Mes Logements Favoris</h1>
        {renderErrorMessage()}
        <div className="favoris-list-container">{renderFavorisList()}</div>
      </div>
    </Layout>
  );
};

export default FavorisPage;
