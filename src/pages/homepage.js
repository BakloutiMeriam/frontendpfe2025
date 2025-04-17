import React, { useState, useEffect, useContext } from "react";
import { logementService } from "../services/LogementService";
import { reservationService } from "../services/reservationService"; // Ajoutez cette importation
import { AuthContext } from "../context/AuthContext";
import "../styles/Home.css";
import NavbarHome from "../components/NavbarHome.js";
import CategoryMenu from "../components/CategoryMenu";
import SearchBar from "../components/SearchBar";
import Footer from "../components/Footer";
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
  // Pour stocker les réservations par logement
  const [reservationsMap, setReservationsMap] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    fetchLogements();
    if (user && user.role === "client") {
      fetchFavoris();
    }
  }, [user]);

  // Filtrage de base (tout sauf les dates)
  useEffect(() => {
    if (!logements.length) return;

    // Appliquer les filtres de base (catégorie, destination, prix)
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
    }

    // Si une recherche par date est en cours, on va charger les réservations pour chaque logement
    if (searchParams && searchParams.dateDebut && searchParams.dateFin) {
      loadReservationsForLogements(filtered);
    } else {
      // Si pas de recherche par date, on applique directement les filtres
      setFilteredLogements(filtered);
    }
  }, [logements, selectedCategory, searchParams]);

  // Cette fonction charge les réservations pour chaque logement filtré
  const loadReservationsForLogements = async (logementsToCheck) => {
    setLoading(true);

    try {
      // Créer un nouvel objet pour stocker les réservations
      const newReservationsMap = {};

      // Pour chaque logement, charger ses réservations confirmées
      for (const logement of logementsToCheck) {
        try {
          const reservations =
            await reservationService.getAllReservationsConfirmee(logement._id);
          newReservationsMap[logement._id] = reservations;
        } catch (error) {
          console.error(
            `Erreur lors du chargement des réservations pour ${logement._id}:`,
            error
          );
          newReservationsMap[logement._id] = []; // En cas d'erreur, considérer qu'il n'y a pas de réservation
        }
      }

      // Mettre à jour l'état des réservations
      setReservationsMap(newReservationsMap);

      // Une fois toutes les réservations chargées, filtrer les logements par disponibilité
      filterLogementsByAvailability(logementsToCheck, newReservationsMap);
    } catch (error) {
      console.error("Erreur lors du chargement des réservations:", error);
      setFilteredLogements(logementsToCheck); // En cas d'erreur globale, afficher tous les logements filtrés
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour vérifier si un logement est disponible aux dates demandées
  const filterLogementsByAvailability = (logements, reservationsMap) => {
    if (!searchParams || !searchParams.dateDebut || !searchParams.dateFin) {
      setFilteredLogements(logements);
      return;
    }

    const dateDebutRecherche = new Date(searchParams.dateDebut);
    const dateFinRecherche = new Date(searchParams.dateFin);

    // Filtrer les logements qui n'ont pas de réservation confirmée dans cette période
    const availableLogements = logements.filter((logement) => {
      const reservations = reservationsMap[logement._id] || [];

      // Vérifier si aucune des réservations ne chevauche la période demandée
      return !reservations.some((reservation) => {
        const dateDebutRes = new Date(reservation.dateDebut);
        const dateFinRes = new Date(reservation.dateFin);

        // Vérifier le chevauchement des dates
        return (
          (dateDebutRecherche <= dateFinRes &&
            dateDebutRecherche >= dateDebutRes) ||
          (dateFinRecherche >= dateDebutRes &&
            dateFinRecherche <= dateFinRes) ||
          (dateDebutRecherche <= dateDebutRes && dateFinRecherche >= dateFinRes)
        );
      });
    });

    setFilteredLogements(availableLogements);
  };

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
    // Si les dates ont changé, on réinitialise les réservations pour forcer un rechargement
    if (params.dateDebut && params.dateFin) {
      setReservationsMap({});
    }
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

      <Footer />
    </>
  );
};

export default HomePage;
