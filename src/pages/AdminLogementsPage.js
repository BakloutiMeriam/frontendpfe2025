import React, { useState, useEffect, useContext } from "react";
import { logementService } from "../services/LogementService";
import UserService from "../services/UserService";
import { AuthContext } from "../context/AuthContext";
import "../styles/AdminLogements.css";
import { FaSearch, FaUser, FaCheck, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Layout from "../components/Layout";

const AdminLogementsPage = () => {
  const [logements, setLogements] = useState([]);
  const [filteredLogements, setFilteredLogements] = useState([]);
  const [proprietaires, setProprietaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProprietaire, setSelectedProprietaire] = useState("");
  const [disponibiliteFilter, setDisponibiliteFilter] = useState(""); // "" = tous, "true" = disponible, "false" = non disponible
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    // Vérifier si l'utilisateur est admin
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    // Charger les données
    fetchLogements();
    fetchProprietaires();
  }, [user, navigate]);

  // Appliquer les filtres quand ils changent
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchTerm,
    selectedProprietaire,
    disponibiliteFilter,
    priceRange,
    logements,
  ]);

  const fetchLogements = async () => {
    try {
      setLoading(true);
      const data = await logementService.getLogementsService();

      // Extract the logements array from the response data
      const logementsArray = data.logements || [];

      setLogements(logementsArray);
      setFilteredLogements(logementsArray);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message || "Erreur lors du chargement des logements"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProprietaires = async () => {
    try {
      const data = await UserService.getProprietaires();
      setProprietaires(data);
    } catch (err) {
      console.error("Erreur lors du chargement des propriétaires:", err);
    }
  };

  const applyFilters = () => {
    let filtered = [...logements];

    // Filtre par terme de recherche (titre, ville, description)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (logement) =>
          logement.titre.toLowerCase().includes(term) ||
          (logement.adresse?.ville || "").toLowerCase().includes(term) ||
          (logement.description || "").toLowerCase().includes(term)
      );
    }

    // Filtre par propriétaire
    if (selectedProprietaire) {
      filtered = filtered.filter(
        (logement) => logement.proprietaire._id === selectedProprietaire
      );
    }

    // Filtre par disponibilité (disponible ou non disponible)
    if (disponibiliteFilter === "true") {
      filtered = filtered.filter((logement) => logement.disponible === true);
    } else if (disponibiliteFilter === "false") {
      filtered = filtered.filter((logement) => logement.disponible === false);
    }

    // Filtre par fourchette de prix
    if (priceRange.min) {
      filtered = filtered.filter(
        (logement) => logement.prix >= parseInt(priceRange.min)
      );
    }
    if (priceRange.max) {
      filtered = filtered.filter(
        (logement) => logement.prix <= parseInt(priceRange.max)
      );
    }

    setFilteredLogements(filtered);
    setCurrentPage(1); // Réinitialiser à la première page après filtrage
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedProprietaire("");
    setDisponibiliteFilter("");
    setPriceRange({ min: "", max: "" });
    setFilteredLogements(logements);
  };

  const handleToggleDisponibilite = async (logementId, isAvailable) => {
    const confirmMessage = isAvailable
      ? "Êtes-vous sûr de vouloir désactiver cette annonce ? Elle ne sera plus visible sur le site."
      : "Êtes-vous sûr de vouloir activer cette annonce ? Elle sera visible sur le site.";

    if (window.confirm(confirmMessage)) {
      try {
        await logementService.toggleDisponibilite(logementId);
        fetchLogements();
      } catch (err) {
        setError("Erreur lors du changement de statut de l'annonce");
        console.error(err);
      }
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Array.isArray(filteredLogements)
    ? filteredLogements.slice(indexOfFirstItem, indexOfLastItem)
    : [];
  const totalPages = Math.ceil(filteredLogements.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          &laquo;
        </button>
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`pagination-button ${
              currentPage === number ? "active" : ""
            }`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          &raquo;
        </button>
      </div>
    );
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <>
      <Layout>
        <div className="admin-layout">
          <Sidebar />
          <div className="admin-content">
            <div className="admin-logements-page">
              <h1>Gestion des Logements</h1>

              <div className="compact-filter-bar">
                <div className="search-box">
                  <FaSearch className="filter-icon" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="filter-divider"></div>

                <div className="proprietaire-filter">
                  <FaUser className="filter-icon" />
                  <select
                    value={selectedProprietaire}
                    onChange={(e) => setSelectedProprietaire(e.target.value)}
                  >
                    <option value="">Tous les propriétaires</option>
                    {proprietaires.map((prop) => (
                      <option key={prop._id} value={prop._id}>
                        {prop.nom} {prop.prenom}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="filter-divider"></div>

                <div className="disponibilite-filter">
                  <div className="radio-group">
                    <label
                      className={`radio-label ${
                        disponibiliteFilter === "" ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="disponibilite"
                        checked={disponibiliteFilter === ""}
                        onChange={() => setDisponibiliteFilter("")}
                      />
                      <span>Tous</span>
                    </label>
                    <label
                      className={`radio-label ${
                        disponibiliteFilter === "true" ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="disponibilite"
                        checked={disponibiliteFilter === "true"}
                        onChange={() => setDisponibiliteFilter("true")}
                      />
                      <FaCheck className="dispo-icon available" />
                      <span>Disponible</span>
                    </label>
                    <label
                      className={`radio-label ${
                        disponibiliteFilter === "false" ? "active" : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="disponibilite"
                        checked={disponibiliteFilter === "false"}
                        onChange={() => setDisponibiliteFilter("false")}
                      />
                      <FaTimes className="dispo-icon unavailable" />
                      <span>Non disponible</span>
                    </label>
                  </div>
                </div>

                <button onClick={resetFilters} className="reset-filter-button">
                  Réinitialiser
                </button>
              </div>

              {loading ? (
                <div className="loading">Chargement...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : (
                <>
                  <div className="logements-stats">
                    <div className="stat-card">
                      <h3>Total</h3>
                      <p>{logements.length}</p>
                    </div>
                    <div className="stat-card">
                      <h3>Disponibles</h3>
                      <p>
                        {logements.filter((l) => l.disponible === true).length}
                      </p>
                    </div>
                    <div className="stat-card">
                      <h3>Non disponibles</h3>
                      <p>
                        {logements.filter((l) => l.disponible === false).length}
                      </p>
                    </div>
                    <div className="stat-card">
                      <h3>Prix moyen</h3>
                      <p>
                        {logements.length > 0
                          ? (
                              logements.reduce(
                                (acc, curr) => acc + curr.prix,
                                0
                              ) / logements.length
                            ).toFixed(0) + " €"
                          : "0 €"}
                      </p>
                    </div>
                  </div>

                  <div className="logements-table-container">
                    <table className="logements-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Titre</th>
                          <th>Propriétaire</th>
                          <th>Localisation</th>
                          <th>Prix</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="no-data">
                              Aucun logement trouvé
                            </td>
                          </tr>
                        ) : (
                          currentItems.map((logement) => (
                            <tr key={logement._id}>
                              <td className="logement-image-cell">
                                <img
                                  src={
                                    logement.photoprincipale ||
                                    "/images/image.png"
                                  }
                                  alt={logement.titre}
                                  onError={(e) => {
                                    e.target.src = "/images/image.png";
                                  }}
                                />
                              </td>
                              <td>{logement.titre}</td>
                              <td className="proprietaire-cell">
                                <div className="proprietaire-info">
                                  <img
                                    src={
                                      logement.proprietaire.url_img ||
                                      "/images/avatar.png"
                                    }
                                    alt="Avatar"
                                    className="proprietaire-avatar"
                                    onError={(e) => {
                                      e.target.src = "/images/avatar.png";
                                    }}
                                  />
                                  <div>
                                    <div className="proprietaire-name">
                                      {logement.proprietaire.nom}{" "}
                                      {logement.proprietaire.prenom}
                                    </div>
                                    <div className="proprietaire-email">
                                      {logement.proprietaire.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                {logement.adresse?.ville},{" "}
                                {logement.adresse?.pays}
                              </td>
                              <td className="price-cell">{logement.prix} €</td>

                              <td className="actions-cell">
                                <button
                                  onClick={() =>
                                    handleToggleDisponibilite(
                                      logement._id,
                                      logement.disponible
                                    )
                                  }
                                  className={`toggle-button ${
                                    logement.disponible
                                      ? "button-available"
                                      : "button-unavailable"
                                  }`}
                                >
                                  {logement.disponible
                                    ? "Désactiver"
                                    : "Activer"}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {renderPagination()}
                </>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AdminLogementsPage;
