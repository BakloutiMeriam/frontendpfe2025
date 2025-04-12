import React, { useState, useEffect, useContext } from "react";
import { reservationService } from "../services/reservationService";
import { logementService } from "../services/LogementService";
import UserService from "../services/UserService";
import { AuthContext } from "../context/AuthContext";
import { FaSearch, FaRegCalendarAlt, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Layout from "../components/Layout";
import "../styles/AdminReservations.css";

const AdminReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [clients, setClients] = useState([]);
  const [logements, setLogements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedLogement, setSelectedLogement] = useState("");
  const [selectedStatut, setSelectedStatut] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

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
    fetchReservations();
    fetchClients();
    fetchLogements();
  }, [user, navigate]);

  // Appliquer les filtres quand ils changent
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchTerm,
    selectedClient,
    selectedLogement,
    selectedStatut,
    dateRange,
    reservations,
  ]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      // Ajoutez une méthode à votre service de réservation pour obtenir toutes les réservations (côté admin)
      const data = await reservationService.getAllReservations();
      setReservations(data);
      setFilteredReservations(data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors du chargement des réservations"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await UserService.getClients();
      setClients(data);
    } catch (err) {
      console.error("Erreur lors du chargement des clients:", err);
    }
  };

  const fetchLogements = async () => {
    try {
      const data = await logementService.getLogementsService();
      setLogements(data.logements || []);
    } catch (err) {
      console.error("Erreur lors du chargement des logements:", err);
    }
  };

  const applyFilters = () => {
    let filtered = [...reservations];

    // Filtre par terme de recherche (référence, montant, etc.)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (reservation) =>
          (reservation._id && reservation._id.toLowerCase().includes(term)) ||
          (reservation.prixTotal &&
            reservation.prixTotal.toString().includes(term)) ||
          (reservation.logement.titre &&
            reservation.logement.titre.toLowerCase().includes(term)) ||
          (reservation.client.nom &&
            reservation.client.nom.toLowerCase().includes(term)) ||
          (reservation.client.prenom &&
            reservation.client.prenom.toLowerCase().includes(term))
      );
    }

    // Filtre par client
    if (selectedClient) {
      filtered = filtered.filter(
        (reservation) => reservation.client._id === selectedClient
      );
    }

    // Filtre par logement
    if (selectedLogement) {
      filtered = filtered.filter(
        (reservation) => reservation.logement._id === selectedLogement
      );
    }

    // Filtre par statut
    if (selectedStatut) {
      filtered = filtered.filter(
        (reservation) => reservation.statut === selectedStatut
      );
    }

    // Filtre par plage de dates
    if (dateRange.start) {
      filtered = filtered.filter(
        (reservation) =>
          new Date(reservation.dateDebut) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(
        (reservation) =>
          new Date(reservation.dateFin) <= new Date(dateRange.end)
      );
    }

    setFilteredReservations(filtered);
    setCurrentPage(1); // Réinitialiser à la première page après filtrage
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedClient("");
    setSelectedLogement("");
    setSelectedStatut("");
    setDateRange({ start: "", end: "" });
    setFilteredReservations(reservations);
  };

  // Formatage de la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReservations.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPagination = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="res-pagination">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="res-pagination-button"
        >
          &laquo;
        </button>
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`res-pagination-button ${
              currentPage === number ? "active" : ""
            }`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="res-pagination-button"
        >
          &raquo;
        </button>
      </div>
    );
  };

  // Obtenir le badge de statut avec la couleur appropriée
  const getStatusBadge = (status) => {
    const statusClasses = {
      "en attente": "res-badge-warning",
      confirmée: "res-badge-success",
      annulée: "res-badge-danger",
      terminée: "res-badge-info",
      refusée: "res-badge-secondary",
    };

    return (
      <span
        className={`res-status-badge ${
          statusClasses[status] || "res-badge-light"
        }`}
      >
        {status}
      </span>
    );
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <Layout>
      <div className="admin-layout">
        <Sidebar />
        <div className="admin-content">
          <div className="res-admin-reservations-page">
            <h1>Gestion des Réservations</h1>

            <div className="res-compact-filter-bar">
              <div className="res-search-box">
                <FaSearch className="res-filter-icon" />
                <input
                  type="text"
                  placeholder="Rechercher une réservation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="res-filter-divider"></div>

              <div className="res-client-filter">
                <FaUser className="res-filter-icon" />
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                >
                  <option value="">Tous les clients</option>
                  {clients.map((client) => (
                    <option key={client._id} value={client._id}>
                      {client.nom} {client.prenom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="res-filter-divider"></div>

              <div className="res-logement-filter">
                <select
                  value={selectedLogement}
                  onChange={(e) => setSelectedLogement(e.target.value)}
                >
                  <option value="">Tous les logements</option>
                  {logements.map((logement) => (
                    <option key={logement._id} value={logement._id}>
                      {logement.titre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="res-filter-divider"></div>

              <div className="res-statut-filter">
                <select
                  value={selectedStatut}
                  onChange={(e) => setSelectedStatut(e.target.value)}
                >
                  <option value="">Tous les statuts</option>
                  <option value="en attente">En attente</option>
                  <option value="confirmée">Confirmée</option>
                  <option value="annulée">Annulée</option>
                  <option value="terminée">Terminée</option>
                  <option value="refusée">Refusée</option>
                </select>
              </div>

              <div className="res-filter-divider"></div>

              <div className="res-date-filter">
                <FaRegCalendarAlt className="res-filter-icon" />
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, start: e.target.value })
                  }
                  placeholder="Date début"
                  className="res-date-input"
                />
                <span className="res-date-separator">-</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, end: e.target.value })
                  }
                  placeholder="Date fin"
                  className="res-date-input"
                />
              </div>

              <button
                onClick={resetFilters}
                className="res-reset-filter-button"
              >
                Réinitialiser
              </button>
            </div>

            {loading ? (
              <div className="res-loading">Chargement...</div>
            ) : error ? (
              <div className="res-error-message">{error}</div>
            ) : (
              <>
                <div className="res-reservations-stats">
                  <div className="res-stat-card">
                    <h3>Total</h3>
                    <p>{reservations.length}</p>
                  </div>
                  <div className="res-stat-card">
                    <h3>En attente</h3>
                    <p>
                      {
                        reservations.filter((r) => r.statut === "en attente")
                          .length
                      }
                    </p>
                  </div>
                  <div className="res-stat-card">
                    <h3>Confirmées</h3>
                    <p>
                      {
                        reservations.filter((r) => r.statut === "confirmée")
                          .length
                      }
                    </p>
                  </div>
                  <div className="res-stat-card">
                    <h3>Terminées</h3>
                    <p>
                      {
                        reservations.filter((r) => r.statut === "terminée")
                          .length
                      }
                    </p>
                  </div>
                  <div className="res-stat-card">
                    <h3>Annulées/Refusées</h3>
                    <p>
                      {
                        reservations.filter((r) =>
                          ["annulée", "refusée"].includes(r.statut)
                        ).length
                      }
                    </p>
                  </div>
                </div>

                <div className="res-reservations-table-container">
                  <table className="res-reservations-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>Logement</th>
                        <th>Période</th>
                        <th>Prix total</th>
                        <th>Statut</th>
                        <th>Date de création</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="res-no-data">
                            Aucune réservation trouvée
                          </td>
                        </tr>
                      ) : (
                        currentItems.map((reservation) => (
                          <tr key={reservation._id}>
                            <td className="res-reservation-id">
                              {reservation._id.substring(
                                reservation._id.length - 8
                              )}
                            </td>
                            <td className="res-client-info">
                              <div className="res-client-details">
                                <img
                                  src={
                                    reservation.client.url_img ||
                                    "/images/avatar.png"
                                  }
                                  alt="Avatar"
                                  className="res-client-avatar"
                                  onError={(e) => {
                                    e.target.src = "/images/avatar.png";
                                  }}
                                />
                                <div>
                                  <div className="res-client-name">
                                    {reservation.client.nom}{" "}
                                    {reservation.client.prenom}
                                  </div>
                                  <div className="res-client-email">
                                    {reservation.client.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="res-logement-info">
                              <div className="res-logement-details">
                                <img
                                  src={
                                    reservation.logement.photoprincipale ||
                                    "/images/image.png"
                                  }
                                  alt={reservation.logement.titre}
                                  className="res-logement-image"
                                  onError={(e) => {
                                    e.target.src = "/images/image.png";
                                  }}
                                />
                                <div className="res-logement-title">
                                  {reservation.logement.titre}
                                </div>
                              </div>
                            </td>
                            <td className="res-period-cell">
                              <div className="res-period-dates">
                                <div className="res-date res-start-date">
                                  {formatDate(reservation.dateDebut)}
                                </div>
                                <div className="res-date-separator">→</div>
                                <div className="res-date res-end-date">
                                  {formatDate(reservation.dateFin)}
                                </div>
                              </div>
                              <div className="res-duration">
                                {Math.ceil(
                                  (new Date(reservation.dateFin) -
                                    new Date(reservation.dateDebut)) /
                                    (1000 * 60 * 60 * 24)
                                )}{" "}
                                nuits
                              </div>
                            </td>
                            <td className="res-price-cell">
                              {reservation.prixTotal} €
                            </td>
                            <td className="res-status-cell">
                              {getStatusBadge(reservation.statut)}
                            </td>
                            <td className="res-creation-date">
                              {formatDate(reservation.createdAt)}
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
  );
};

export default AdminReservationsPage;
