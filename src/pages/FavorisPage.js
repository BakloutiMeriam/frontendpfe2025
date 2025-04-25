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
        className="fav-alert fav-alert-danger"
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
      return <div className="fav-loading">Chargement de vos favoris...</div>;

    if (!user || user.role !== "client") {
      return (
        <div className="fav-require-login">
          <h3>Connectez-vous pour voir vos favoris</h3>
          <button
            className="fav-btn-primary"
            onClick={() => navigate("/login")}
          >
            Se connecter
          </button>
        </div>
      );
    }

    if (!Array.isArray(favoris) || favoris.length === 0) {
      return (
        <div className="fav-empty-state">
          <h3>Vous n'avez pas encore de favoris</h3>
          <p>Explorez nos logements et ajoutez-les à vos favoris</p>
          <button className="fav-btn-primary" onClick={() => navigate("/")}>
            Découvrir des logements
          </button>
        </div>
      );
    }

    return (
      <div className="fav-logements-grid">
        {favoris.map((logement) => (
          <div key={logement._id} className="fav-logement-card">
            <div className="fav-logement-image">
              <img
                src={
                  logement.photoprincipale.startsWith("data:")
                    ? logement.photoprincipale
                    : `/uploads/${logement.photoprincipale}`
                }
                alt={logement.titre}
                onError={(e) => {
                  e.target.src = "../images/image.png";
                }}
              />
              <button
                className="fav-heart-button"
                onClick={() => supprimerDesFavoris(logement._id)}
              >
                <FaHeart className="fav-heart-icon active" />
              </button>
            </div>
            <div className="fav-logement-details">
              <h3 className="fav-logement-title">{logement.titre}</h3>
              <p className="fav-logement-price">
                {logement.prix?.toLocaleString() || "Prix non disponible"} €
              </p>
              <p className="fav-logement-address">
                {logement.adresse?.ville || "Ville non spécifiée"},
                {logement.adresse?.pays || "Pays non spécifié"}
              </p>
              <div className="fav-logement-specs">
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
      <div className="fav-page-container">
        <h1 className="fav-page-title">Mes Logements Favoris</h1>
        {renderErrorMessage()}
        <div className="fav-list-container">{renderFavorisList()}</div>
      </div>
    </Layout>
  );
};

export default FavorisPage;
