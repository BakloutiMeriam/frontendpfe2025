import React, { useState, useEffect, useContext } from "react";
import { logementService } from "../services/LogementService";
import { AuthContext } from "../context/AuthContext";
import "../styles/Home.css"; // Conservez votre CSS existant
import NavbarHome from "../components/NavbarHome.js";
import CategoryMenu from "../components/CategoryMenu";
import SearchBar from "../components/SearchBar";
import Footer from "../components/Footer"; // Importation du nouveau composant Footer
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

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
  const [searchParams, setSearchParams] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchLogements();
    if (user && user.role === "client") {
      fetchFavoris();
    }
  }, [user]);

  useEffect(() => {
    // Filtre par catégorie et recherche
    let filtered = logements;

    // Filtre par catégorie
    if (selectedCategory) {
      filtered = filtered.filter((logement) => {
        const categorieId = logement.categorie._id
          ? logement.categorie._id
          : logement.categorie;
        return categorieId === selectedCategory;
      });
    }

    // Filtre par critères de recherche
    if (searchParams) {
      // Filtre par destination (ville ou pays)
      if (searchParams.destination) {
        const searchTerm = searchParams.destination.toLowerCase();
        filtered = filtered.filter(
          (logement) =>
            (logement.adresse?.ville || "")
              .toLowerCase()
              .includes(searchTerm) ||
            (logement.adresse?.pays || "").toLowerCase().includes(searchTerm)
        );
      }

      // Filtre par prix min et max
      if (searchParams.prixMin) {
        filtered = filtered.filter(
          (logement) => logement.prix >= parseFloat(searchParams.prixMin)
        );
      }

      if (searchParams.prixMax) {
        filtered = filtered.filter(
          (logement) => logement.prix <= parseFloat(searchParams.prixMax)
        );
      }

      // Note: Pour les dates, vous devrez implémenter une logique avec vos données
      // Ceci est un exemple de base, à adapter selon votre modèle de données
      if (searchParams.dateDebut && searchParams.dateFin) {
        // Exemple: Supposons que vous avez un tableau de disponibilités dans logement
        // À adapter selon votre structure de données réelle
        filtered = filtered.filter((logement) => {
          // Logique de vérification des disponibilités
          return true; // Remplacer par votre logique de filtrage des dates
        });
      }
    }

    setFilteredLogements(filtered);
  }, [logements, selectedCategory, searchParams]);

  const fetchLogements = async () => {
    try {
      setLoading(true);
      const data = await logementService.getLogementsDisponibles();
      if (Array.isArray(data.logements)) {
        setLogements(data.logements);
        setFilteredLogements(data.logements);
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

  const handleSearch = (params) => {
    setSearchParams(params);
    // Vous pouvez aussi réinitialiser la catégorie si vous le souhaitez
    // setSelectedCategory(null);
  };

  const navigateToLogementDetails = (logementId) => {
    navigate(`/Public-logement-details/${logementId}`);
  };

  const toggleFavori = async (logementId, event) => {
    event.stopPropagation();

    if (!user || user.role !== "client") {
      setAlertType("warning");
      setAlertMessage(
        "Veuillez vous connecter en tant que client pour ajouter ce logement à vos favoris"
      );
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      return;
    }

    try {
      const isFavori = favoris.includes(logementId);

      if (isFavori) {
        await logementService.supprimerDesFavoris(logementId);
        setFavoris(favoris.filter((id) => id !== logementId));
        setAlertType("success");
        setAlertMessage("Logement retiré de vos favoris");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      } else {
        await logementService.ajouterAuxFavoris(logementId);
        setFavoris([...favoris, logementId]);
        setAlertType("success");
        setAlertMessage("Logement ajouté à vos favoris");
        setShowAlert(true);
        setTimeout(() => setShowAlert(false), 3000);
      }
    } catch (err) {
      setAlertType("error");
      setAlertMessage(
        `Erreur : ${
          err.response?.data?.message ||
          error ||
          "Impossible de mettre à jour vos favoris."
        }`
      );
      setShowAlert(true);
      setTimeout(() => setShowAlert(false), 3000);
      console.error(err);
    }
  };

  const renderAlert = () => {
    if (!showAlert) return null;

    return (
      <div className={`airbnb-alert airbnb-alert-${alertType}`}>
        <div className="airbnb-alert-content">
          <p>{alertMessage}</p>
        </div>
        <button
          className="airbnb-alert-close-btn"
          onClick={() => setShowAlert(false)}
        >
          ×
        </button>
      </div>
    );
  };

  const renderLogementsList = () => {
    if (loading) {
      return (
        <div className="airbnb-loading">
          <div className="airbnb-loading-spinner"></div>
        </div>
      );
    }

    if (!Array.isArray(filteredLogements) || filteredLogements.length === 0) {
      return (
        <div className="airbnb-empty-message">
          {selectedCategory || searchParams
            ? "Aucun logement ne correspond à vos critères"
            : "Aucun logement disponible"}
        </div>
      );
    }

    return (
      <div className="airbnb-logements-grid">
        {filteredLogements.map((logement) => {
          // Troncation du titre et description pour l'affichage
          const shortTitle = logement.titre
            ? logement.titre.length > 26
              ? logement.titre.substring(0, 26) + "..."
              : logement.titre
            : "Sans titre";

          const shortDesc = logement.description
            ? logement.description.length > 65
              ? logement.description.substring(0, 65) + "..."
              : logement.description
            : "Pas de description disponible";

          return (
            <div
              key={logement._id}
              className="airbnb-logement-card"
              onClick={() => navigateToLogementDetails(logement._id)}
            >
              <div className="airbnb-logement-image">
                <img
                  src={logement.photoprincipale}
                  alt={logement.titre}
                  onError={(e) => {
                    e.target.src = "../images/image.png";
                  }}
                />
                <button
                  className="airbnb-favoris-button"
                  onClick={(e) => toggleFavori(logement._id, e)}
                >
                  {user &&
                  user.role === "client" &&
                  favoris.includes(logement._id) ? (
                    <FaHeart className="airbnb-favoris-icon active" />
                  ) : (
                    <FaRegHeart className="airbnb-favoris-icon" />
                  )}
                </button>
              </div>
              <div className="airbnb-logement-details">
                <div className="airbnb-logement-location">
                  <span>
                    {logement.adresse?.ville || "Ville"},{" "}
                    {logement.adresse?.pays || "Pays"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <FaStar style={{ marginRight: "4px", fontSize: "14px" }} />{" "}
                    4.9
                  </span>
                </div>
                <h3 className="airbnb-logement-title">{shortTitle}</h3>
                <div className="airbnb-logement-description">{shortDesc}</div>
                <div className="airbnb-logement-price">
                  <span>{logement.prix?.toLocaleString() || "-"} € </span>
                  <span>par nuit</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <NavbarHome />
      <div className="airbnb-navbar-separator"></div>
      <div className="airbnb-home-container">
        <SearchBar onSearch={handleSearch} />
        <div className="airbnb-search-category-separator"></div>
        <CategoryMenu onCategorySelect={handleCategorySelect} />

        {renderAlert()}
        <div className="airbnb-logements-list-container">
          {renderLogementsList()}
        </div>
      </div>

      {/* Remplacé l'ancien footer minimaliste par notre nouveau composant Footer */}
      <Footer />
    </>
  );
};

export default HomePage;
