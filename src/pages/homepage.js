import React, { useState, useEffect, useContext } from "react";
import { logementService } from "../services/LogementService";
import { AuthContext } from "../context/AuthContext";
import "../styles/Home.css";
import Navbar from "../components/Navbar";
import CategoryMenu from "../components/CategoryMenu";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const HomePage = () => {
  const [logements, setLogements] = useState([]);
  const [filteredLogements, setFilteredLogements] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const [favoris, setFavoris] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchLogements();
    if (user && user.role === "client") {
      fetchFavoris();
    }
  }, [user]);

  // Appliquer le filtre de catégorie quand les logements ou la catégorie sélectionnée changent
  useEffect(() => {
    if (selectedCategory) {
      setFilteredLogements(
        logements.filter((logement) => logement.categorie === selectedCategory)
      );
    } else {
      setFilteredLogements(logements);
    }
  }, [logements, selectedCategory]);

  const fetchLogements = async () => {
    try {
      setLoading(true);
      const data = await logementService.getLogementsService();
      if (Array.isArray(data)) {
        setLogements(data);
        setFilteredLogements(data); // Initialiser les logements filtrés
        setError("");
      } else {
        setError("Format de données incorrect");
        console.error("Format de données incorrect:", data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors du chargement des logements"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoris = async () => {
    try {
      const response = await logementService.getMesFavoris();
      const favorisIds = response.map((favori) => favori._id);
      setFavoris(favorisIds);
    } catch (err) {
      console.error("Erreur lors du chargement des favoris:", err);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const toggleFavori = async (logementId) => {
    if (!user || user.role !== "client") {
      setAlertType("warning");
      setAlertMessage(
        "❗️ Action non autorisée | Veuillez vous connecter en tant que client pour ajouter ce logement à vos favoris"
      );
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    try {
      const isFavori = favoris.includes(logementId);

      if (isFavori) {
        setAlertType("confirm");
        setAlertMessage(
          "Êtes-vous sûr de vouloir retirer ce logement de vos favoris?"
        );
        setShowAlert(true);

        document.getElementById("confirmButton").onclick = async () => {
          try {
            await logementService.supprimerDesFavoris(logementId);
            setFavoris(favoris.filter((id) => id !== logementId));
            setAlertType("success");
            setAlertMessage("💔 Logement retiré de vos favoris avec succès");
            setTimeout(() => setShowAlert(false), 10000);
          } catch (err) {
            setAlertType("error");
            setAlertMessage(
              `❌ Erreur | ${
                err.response?.data?.message ||
                "Impossible de mettre à jour vos favoris."
              }`
            );
            setTimeout(() => setShowAlert(false), 10000);
          }
        };

        document.getElementById("cancelButton").onclick = () => {
          setShowAlert(false);
        };
      } else {
        await logementService.ajouterAuxFavoris(logementId);
        setFavoris([...favoris, logementId]);
        setAlertType("success");
        setAlertMessage("❤️ Logement ajouté à vos favoris avec succès");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 10000);
      }
    } catch (err) {
      setAlertType("error");
      setAlertMessage(
        `❌ Erreur | ${
          err.response?.data?.message ||
          "Impossible de mettre à jour vos favoris."
        }`
      );
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 10000);
      console.error(err);
    }
  };

  const renderAlert = () => {
    if (!showAlert) return null;

    return (
      <div className={`custom-alert alert-${alertType}`}>
        <div className="alert-content">
          <p>{alertMessage}</p>
        </div>
        {alertType === "confirm" ? (
          <div className="alert-actions">
            <button id="cancelButton" className="alert-btn alert-btn-secondary">
              Non
            </button>
            <button id="confirmButton" className="alert-btn alert-btn-primary">
              Oui
            </button>
          </div>
        ) : (
          <button
            className="alert-close-btn"
            onClick={() => setShowAlert(false)}
          >
            ×
          </button>
        )}
      </div>
    );
  };

  const renderLogementsList = () => {
    if (loading) return <div className="loading">Chargement...</div>;

    if (!Array.isArray(filteredLogements) || filteredLogements.length === 0) {
      return (
        <div className="empty-message">
          {selectedCategory
            ? "Aucun logement dans cette catégorie"
            : "Aucun logement disponible"}
        </div>
      );
    }

    return (
      <div className="logements-grid">
        {filteredLogements.map((logement) => (
          <div key={logement._id} className="logement-card">
            <div className="logement-image">
              <img
                src={`/uploads/${logement.photoprincipale}`}
                alt={logement.titre}
                onError={(e) => {
                  e.target.src = "/uploads/default-logement.png";
                }}
              />
              <button
                className="favoris-button"
                onClick={() => toggleFavori(logement._id)}
              >
                {user &&
                user.role === "client" &&
                favoris.includes(logement._id) ? (
                  <FaHeart className="favoris-icon active" />
                ) : (
                  <FaRegHeart className="favoris-icon" />
                )}
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
    <>
      <Navbar />
      <div className="home-container">
        <h1>Nos Logements</h1>

        {/* Assurez-vous de passer la fonction handleCategorySelect ici */}
        <CategoryMenu onCategorySelect={handleCategorySelect} />

        {renderAlert()}
        <div className="logements-list-container">{renderLogementsList()}</div>
      </div>
    </>
  );
};

export default HomePage;
