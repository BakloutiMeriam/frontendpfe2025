import React, { useState, useEffect } from "react";
import { reservationService } from "../services/ReservationService";
import { format, differenceInHours } from "date-fns";
import { fr } from "date-fns/locale";
import {
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaHome,
  FaUsers,
  FaEuroSign,
  FaEye,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaSortAmountDown,
  FaSortAmountUp,
  FaExclamationTriangle,
  FaEdit,
  FaCheck,
  FaTimes,
  FaClock,
} from "react-icons/fa";
import "../styles/MesReservations.css";
import Layout from "../components/Layout";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

const MesReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // État pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({
    dateDebut: "",
    dateFin: "",
  });
  const [statutFilter, setStatutFilter] = useState("tous");
  const [showFilters, setShowFilters] = useState(false);

  // États pour le tri
  const [sortField, setSortField] = useState("dateDebut");
  const [sortDirection, setSortDirection] = useState("desc");

  // États pour la modification
  const [editMode, setEditMode] = useState(false);
  const [currentReservation, setCurrentReservation] = useState(null);
  const [editFormData, setEditFormData] = useState({
    dateDebut: "",
    dateFin: "",
    nombrePersonnes: 1,
    messageDemande: "",
  });

  // États pour la fenêtre modale
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    message: "",
    type: "info", // info, warning, error, success
  });

  // Chargement des réservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const data = await reservationService.getUserReservations();
        setReservations(data);
        setFilteredReservations(data);
        setLoading(false);
      } catch (err) {
        setError("Erreur lors du chargement des réservations");
        setLoading(false);
        console.error(err);
      }
    };

    fetchReservations();
  }, []);

  // Appliquer les filtres et le tri
  useEffect(() => {
    let results = [...reservations];

    // Filtre par terme de recherche (nom du logement ou ville)
    if (searchTerm) {
      results = results.filter(
        (reservation) =>
          reservation.logement.titre
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          reservation.logement.adresse?.ville
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par date de début
    if (dateFilter.dateDebut) {
      const dateDebutFilter = new Date(dateFilter.dateDebut);
      results = results.filter(
        (reservation) => new Date(reservation.dateDebut) >= dateDebutFilter
      );
    }

    // Filtre par date de fin
    if (dateFilter.dateFin) {
      const dateFinFilter = new Date(dateFilter.dateFin);
      results = results.filter(
        (reservation) => new Date(reservation.dateFin) <= dateFinFilter
      );
    }

    // Filtre par statut
    if (statutFilter !== "tous") {
      results = results.filter(
        (reservation) => reservation.statut === statutFilter
      );
    }

    // Trier les résultats
    results.sort((a, b) => {
      let fieldA, fieldB;

      // Déterminer les champs à comparer selon le critère de tri
      switch (sortField) {
        case "dateDebut":
          fieldA = new Date(a.dateDebut);
          fieldB = new Date(b.dateDebut);
          break;
        case "dateFin":
          fieldA = new Date(a.dateFin);
          fieldB = new Date(b.dateFin);
          break;
        case "prixTotal":
          fieldA = a.prixTotal;
          fieldB = b.prixTotal;
          break;
        case "titre":
          fieldA = a.logement.titre.toLowerCase();
          fieldB = b.logement.titre.toLowerCase();
          break;
        case "ville":
          fieldA = (a.logement.adresse?.ville || "").toLowerCase();
          fieldB = (b.logement.adresse?.ville || "").toLowerCase();
          break;
        default:
          fieldA = new Date(a.dateDebut);
          fieldB = new Date(b.dateDebut);
      }

      // Appliquer le tri ascendant ou descendant
      if (sortDirection === "asc") {
        return fieldA > fieldB ? 1 : -1;
      } else {
        return fieldA < fieldB ? 1 : -1;
      }
    });

    setFilteredReservations(results);
  }, [
    searchTerm,
    dateFilter,
    statutFilter,
    sortField,
    sortDirection,
    reservations,
  ]);

  // Gestion du tri
  const handleSort = (field) => {
    if (sortField === field) {
      // Inverser la direction si on clique sur le même champ
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Nouveau champ, réinitialiser à descendant
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Fonction pour vérifier si la modification/annulation est possible (48h avant)
  const checkModificationAllowed = (reservation) => {
    const now = new Date();
    const arrivalDate = new Date(reservation.dateDebut);
    const hoursRemaining = differenceInHours(arrivalDate, now);
    return hoursRemaining >= 48;
  };

  // Afficher la fenêtre modale
  const showMessageModal = (title, message, type = "info") => {
    setModalContent({
      title,
      message,
      type,
    });
    setShowModal(true);
  };

  // Annuler une réservation
  const handleAnnulerReservation = async (id) => {
    const reservation = reservations.find((res) => res._id === id);

    if (!reservation) {
      showMessageModal("Erreur", "Cette réservation n'existe pas.", "error");
      return;
    }

    // Vérifier le délai de 48h
    if (!checkModificationAllowed(reservation)) {
      showMessageModal(
        "Annulation impossible",
        "Votre réservation ne peut pas être annulée car elle débute dans moins de 48 heures votre annulation ser payé si elle est approuver. Veuillez contacter le service client pour plus d'informations.",
        "warning"
      );
      return;
    }

    if (
      window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")
    ) {
      try {
        await reservationService.cancelReservation(id);
        // Mettre à jour la liste
        const updatedReservations = reservations.map((reservation) =>
          reservation._id === id
            ? { ...reservation, statut: "annulée" }
            : reservation
        );
        setReservations(updatedReservations);
        showMessageModal(
          "Annulation réussie",
          "Votre réservation a été annulée avec succès.",
          "success"
        );
      } catch (error) {
        console.error("Erreur lors de l'annulation:", error);
        showMessageModal(
          "Erreur d'annulation",
          "Une erreur est survenue lors de l'annulation de votre réservation. Veuillez réessayer plus tard.",
          "error"
        );
      }
    }
  };

  // Commencer la modification d'une réservation
  const handleStartEdit = (id) => {
    const reservation = reservations.find((res) => res._id === id);

    if (!reservation) {
      showMessageModal("Erreur", "Cette réservation n'existe pas.", "error");
      return;
    }

    // Vérifier le délai de 48h
    if (!checkModificationAllowed(reservation)) {
      showMessageModal(
        "Modification impossible",
        "Votre réservation ne peut pas être modifiée car elle débute dans moins de 48 heures votre modification sera payé si tu veux le faire. Veuillez contacter le service client pour plus d'informations.",
        "warning"
      );
      return;
    }

    setCurrentReservation(reservation);
    setEditFormData({
      dateDebut: reservation.dateDebut.split("T")[0], // Format YYYY-MM-DD pour input
      dateFin: reservation.dateFin.split("T")[0], // Format YYYY-MM-DD pour input
      nombrePersonnes: reservation.nombrePersonnes,
      messageDemande: reservation.messageDemande || "", // Ajout du messageDemande
    });
    setEditMode(true);
  };

  // Annuler la modification
  const handleCancelEdit = () => {
    setEditMode(false);
    setCurrentReservation(null);
    setEditFormData({
      dateDebut: "",
      dateFin: "",
      nombrePersonnes: 1,
    });
  };

  // Gérer les changements dans le formulaire
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name === "nombrePersonnes" ? parseInt(value, 10) : value,
    });
  };
  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };
  // Sauvegarder les modifications
  // Sauvegarder les modifications
  const handleSaveEdit = async () => {
    try {
      // Vérifier que les dates sont valides
      const dateDebut = new Date(editFormData.dateDebut);
      const dateFin = new Date(editFormData.dateFin);

      // Créer une date pour aujourd'hui et ajouter un jour
      const aujourdhui = new Date();
      aujourdhui.setHours(0, 0, 0, 0); // Réinitialiser les heures pour comparer uniquement les dates

      // Créer une date minimale (aujourd'hui + 1 jour)
      const dateMinimale = new Date(aujourdhui);
      dateMinimale.setDate(dateMinimale.getDate() + 1);

      // Validation de la date de début (au moins 1 jour après aujourd'hui)
      if (dateDebut < dateMinimale) {
        showMessageModal(
          "Dates invalides",
          "La date de début doit être au minimum un jour après la date d'aujourd'hui.",
          "warning"
        );
        return;
      }

      // Validation de la date de fin
      if (dateFin <= dateDebut) {
        showMessageModal(
          "Dates invalides",
          "La date de fin doit être postérieure à la date de début.",
          "warning"
        );
        return;
      }

      // Vérifier la durée minimale du séjour (au moins 1 nuit)
      const dureeSejour = Math.floor(
        (dateFin - dateDebut) / (1000 * 60 * 60 * 24)
      );
      if (dureeSejour < 1) {
        showMessageModal(
          "Durée de séjour invalide",
          "La durée du séjour doit être d'au moins une nuit.",
          "warning"
        );
        return;
      }

      // Validation du nombre de personnes
      if (editFormData.nombrePersonnes <= 0) {
        showMessageModal(
          "Nombre de voyageurs invalide",
          "Le nombre de voyageurs doit être supérieur à 0.",
          "warning"
        );
        return;
      }

      // Vérifier la capacité du logement
      if (
        currentReservation.logement.capacite &&
        editFormData.nombrePersonnes > currentReservation.logement.capacite
      ) {
        showMessageModal(
          "Capacité dépassée",
          `Ce logement ne peut accueillir que ${currentReservation.logement.capacite} personnes maximum.`,
          "warning"
        );
        return;
      }

      // Préparer les données à envoyer
      const reservationData = {
        dateDebut: editFormData.dateDebut,
        dateFin: editFormData.dateFin,
        nombrePersonnes: editFormData.nombrePersonnes,
        messageDemande: editFormData.messageDemande,
      };

      // Envoyer les modifications au serveur
      await reservationService.updateReservation(
        currentReservation._id,
        reservationData
      );

      // Mettre à jour la liste des réservations
      const updatedReservations = reservations.map((reservation) =>
        reservation._id === currentReservation._id
          ? {
              ...reservation,
              dateDebut: editFormData.dateDebut,
              dateFin: editFormData.dateFin,
              nombrePersonnes: editFormData.nombrePersonnes,
              messageDemande: editFormData.messageDemande,
            }
          : reservation
      );

      setReservations(updatedReservations);
      handleCancelEdit();
      showMessageModal(
        "Modification réussie",
        "Votre réservation a été modifiée avec succès.",
        "success"
      );
    } catch (error) {
      console.error("Erreur lors de la modification:", error);

      // Afficher un message d'erreur approprié en fonction de la réponse du serveur
      const errorMessage =
        error.response?.data?.message ||
        "Une erreur est survenue lors de la modification de votre réservation. Veuillez réessayer plus tard.";

      showMessageModal("Erreur de modification", errorMessage, "error");
    }
  };
  // Fonction pour formater la date
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
    } catch {
      return "Date invalide";
    }
  };

  // Fonction pour déterminer la classe du badge de statut
  const getStatusBadgeClass = (statut) => {
    switch (statut) {
      case "confirmée":
        return "status-badge status-confirmed";
      case "en attente":
        return "status-badge status-pending";
      case "annulée":
        return "status-badge status-cancelled";
      case "terminée":
        return "status-badge status-completed";
      default:
        return "status-badge bg-secondary";
    }
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setSearchTerm("");
    setDateFilter({ dateDebut: "", dateFin: "" });
    setStatutFilter("tous");
  };

  // Rendu du composant de tête de colonne triable
  const renderSortableHeader = (field, label, icon = null) => {
    return (
      <th
        onClick={() => handleSort(field)}
        className={`sortable-header ${
          sortField === field ? "active-sort" : ""
        }`}
      >
        <div className="d-flex align-items-center">
          {icon && <span className="me-2">{icon}</span>}
          {label}
          {sortField === field && (
            <span className="ms-2">
              {sortDirection === "asc" ? (
                <FaSortAmountUp size={14} />
              ) : (
                <FaSortAmountDown size={14} />
              )}
            </span>
          )}
        </div>
      </th>
    );
  };

  // Rendu des cartes de réservation pour la vue mobile
  const renderReservationCards = () => {
    return filteredReservations.map((reservation) => (
      <div key={reservation._id} className="reservation-card">
        {editMode && currentReservation?._id === reservation._id ? (
          // Formulaire d'édition en mode mobile
          <div className="edit-form-mobile">
            <h5 className="edit-form-title">
              Modifier la réservation - {reservation.logement.titre}
            </h5>
            <div className="edit-form-body">
              <div className="form-group mb-3">
                <label className="form-label">
                  <FaCalendarAlt className="me-2" /> Date d'arrivée
                </label>
                <input
                  type="date"
                  name="dateDebut"
                  className="form-control"
                  value={editFormData.dateDebut}
                  onChange={handleEditFormChange}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">
                  <FaCalendarAlt className="me-2" /> Date de départ
                </label>
                <input
                  type="date"
                  name="dateFin"
                  className="form-control"
                  value={editFormData.dateFin}
                  onChange={handleEditFormChange}
                  min={editFormData.dateDebut}
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">
                  <FaUsers className="me-2" /> Nombre de voyageurs
                </label>
                <input
                  type="number"
                  name="nombrePersonnes"
                  className="form-control"
                  value={editFormData.nombrePersonnes}
                  onChange={handleEditFormChange}
                  min="1"
                  max={reservation.logement.capacite || 10}
                />
              </div>
            </div>
            <div className="edit-form-footer">
              <button className="btn btn-success" onClick={handleSaveEdit}>
                <FaCheck className="me-1" /> Enregistrer
              </button>
              <button
                className="btn btn-secondary ms-2"
                onClick={handleCancelEdit}
              >
                <FaTimes className="me-1" /> Annuler
              </button>
            </div>
          </div>
        ) : (
          // Affichage normal
          <>
            <div className="reservation-card-header">
              <div className="d-flex align-items-center">
                {reservation.logement.photoprincipale ? (
                  <img
                    src={reservation.logement.photoprincipale}
                    alt={reservation.logement.titre}
                    className="reservation-card-img"
                  />
                ) : (
                  <div className="reservation-card-img-placeholder">
                    <FaHome />
                  </div>
                )}
                <div className="ms-3">
                  <h5 className="reservation-card-title">
                    {reservation.logement.titre}
                  </h5>
                  <p className="reservation-card-location">
                    <FaMapMarkerAlt className="me-1" />
                    {reservation.logement.adresse?.ville ||
                      "Adresse non disponible"}
                  </p>
                </div>
              </div>
              <span className={getStatusBadgeClass(reservation.statut)}>
                {reservation.statut.charAt(0).toUpperCase() +
                  reservation.statut.slice(1)}
              </span>
            </div>

            <div className="reservation-card-body">
              <div className="reservation-card-info">
                <div className="info-label">
                  <FaCalendarAlt className="me-2" /> Dates
                </div>
                <div className="info-value">
                  {formatDate(reservation.dateDebut)} -{" "}
                  {formatDate(reservation.dateFin)}
                </div>
              </div>

              <div className="reservation-card-info">
                <div className="info-label">
                  <FaUsers className="me-2" /> Voyageurs
                </div>
                <div className="info-value">
                  {reservation.nombrePersonnes}{" "}
                  {reservation.nombrePersonnes > 1 ? "personnes" : "personne"}
                </div>
              </div>

              <div className="reservation-card-info">
                <div className="info-label">
                  <FaEuroSign className="me-2" /> Prix total
                </div>
                <div className="info-value prix-total">
                  {reservation.prixTotal.toFixed(2)} €
                </div>
              </div>
            </div>

            <div className="reservation-card-footer">
              <button
                onClick={() =>
                  (window.location.href = `/DetailReservation/${reservation._id}`)
                }
                className="btn btn-details"
              >
                <FaEye className="me-2" /> Détails
              </button>

              {(reservation.statut === "confirmée" ||
                reservation.statut === "en attente") && (
                <>
                  <button
                    onClick={() => handleStartEdit(reservation._id)}
                    className="btn btn-edit ms-2"
                  >
                    <FaEdit className="me-2" /> Modifier
                  </button>

                  <button
                    onClick={() => handleAnnulerReservation(reservation._id)}
                    className="btn btn-cancel ms-2"
                  >
                    <FaTimesCircle className="me-2" /> Annuler
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    ));
  };

  return (
    <Layout>
      <div className="reservations-container">
        <div className="container">
          <div className="reservations-header">
            <h1 className="reservations-title">Mes Réservations</h1>

            {/* Indicateur de nombre de réservations */}
            {!loading && !error && (
              <div className="reservations-count">
                {filteredReservations.length} réservation
                {filteredReservations.length > 1 ? "s" : ""}
                {filteredReservations.length !== reservations.length &&
                  ` sur ${reservations.length}`}
              </div>
            )}
          </div>

          {/* Nouveau panneau de recherche et filtres */}
          <div className="filters-panel">
            <div className="search-bar">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher par logement ou ville..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-clear"
                    onClick={() => setSearchTerm("")}
                  >
                    <FaTimesCircle />
                  </button>
                )}
              </div>

              <button
                className={`btn btn-filter ${showFilters ? "active" : ""}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter className="me-1" />
                Filtres
              </button>
            </div>

            {/* Panneau de filtres avancés */}
            {showFilters && (
              <div className="advanced-filters">
                <div className="filter-group">
                  <div className="filter-grid">
                    <div className="filter-item">
                      <label className="filter-label">
                        <FaCalendarAlt className="me-2" />
                        Du
                      </label>
                      <input
                        type="date"
                        className="form-control filter-input"
                        value={dateFilter.dateDebut}
                        onChange={(e) =>
                          setDateFilter({
                            ...dateFilter,
                            dateDebut: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="filter-item">
                      <label className="filter-label">
                        <FaCalendarAlt className="me-2" />
                        Au
                      </label>
                      <input
                        type="date"
                        className="form-control filter-input"
                        value={dateFilter.dateFin}
                        onChange={(e) =>
                          setDateFilter({
                            ...dateFilter,
                            dateFin: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="filter-item">
                      <label className="filter-label">Statut</label>
                      <select
                        className="form-select filter-select"
                        value={statutFilter}
                        onChange={(e) => setStatutFilter(e.target.value)}
                      >
                        <option value="tous">Tous les statuts</option>
                        <option value="en attente">En attente</option>
                        <option value="confirmée">Confirmée</option>
                        <option value="annulée">Annulée</option>
                        <option value="terminée">Terminée</option>
                      </select>
                    </div>
                  </div>

                  <div className="filter-actions">
                    <button onClick={resetFilters} className="btn btn-reset">
                      Réinitialiser
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contenu principal */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="loading-text">Chargement de vos réservations...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <FaExclamationTriangle className="error-icon" />
              <h3 className="error-title">Une erreur est survenue</h3>
              <p className="error-message">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn btn-retry"
              >
                Réessayer
              </button>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="empty-state">
              <FaHome className="empty-icon" />
              <h3 className="empty-title">Aucune réservation trouvée</h3>
              <p className="empty-description">
                {reservations.length > 0
                  ? "Aucune réservation ne correspond à vos critères de recherche."
                  : "Vous n'avez pas encore effectué de réservation."}
              </p>
              {reservations.length > 0 && (
                <button onClick={resetFilters} className="btn btn-primary">
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Vue tableau pour desktop */}
              <div className="table-responsive reservation-table-container d-none d-lg-block">
                <table className="table reservation-table">
                  <thead>
                    <tr>
                      {renderSortableHeader("titre", "Logement")}
                      {renderSortableHeader(
                        "ville",
                        "Ville",
                        <FaMapMarkerAlt />
                      )}
                      {renderSortableHeader(
                        "dateDebut",
                        "Dates",
                        <FaCalendarAlt />
                      )}
                      {renderSortableHeader(
                        "prixTotal",
                        "Prix",
                        <FaEuroSign />
                      )}
                      <th>Voyageurs</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.map((reservation) => (
                      <tr key={reservation._id} className="reservation-row">
                        {editMode &&
                        currentReservation?._id === reservation._id ? (
                          // Formulaire d'édition en mode mobile
                          <div className="edit-form-mobile">
                            <h5 className="edit-form-title">
                              Modifier la réservation -{" "}
                              {reservation.logement.titre}
                            </h5>
                            <div className="edit-form-body">
                              <div className="form-group mb-3">
                                <label className="form-label">
                                  <FaCalendarAlt className="me-2" /> Date
                                  d'arrivée
                                </label>
                                <input
                                  type="date"
                                  name="dateDebut"
                                  className="form-control"
                                  value={editFormData.dateDebut}
                                  onChange={handleEditFormChange}
                                  min={getTomorrowDateString()}
                                />
                                <small className="text-muted">
                                  La date d'arrivée doit être au minimum un jour
                                  après aujourd'hui
                                </small>
                              </div>
                              <div className="form-group mb-3">
                                <label className="form-label">
                                  <FaCalendarAlt className="me-2" /> Date de
                                  départ
                                </label>
                                <input
                                  type="date"
                                  name="dateFin"
                                  className="form-control"
                                  value={editFormData.dateFin}
                                  onChange={handleEditFormChange}
                                  min={editFormData.dateDebut}
                                />
                                <small className="text-muted">
                                  La date de départ doit être ultérieure à la
                                  date d'arrivée
                                </small>
                              </div>
                              <div className="form-group mb-3">
                                <label className="form-label">
                                  <FaUsers className="me-2" /> Nombre de
                                  voyageurs
                                </label>
                                <input
                                  type="number"
                                  name="nombrePersonnes"
                                  className="form-control"
                                  value={editFormData.nombrePersonnes}
                                  onChange={handleEditFormChange}
                                  min="1"
                                  max={reservation.logement.capacite || 10}
                                />
                                <small className="text-muted">
                                  Maximum {reservation.logement.capacite || 10}{" "}
                                  personnes
                                </small>
                              </div>
                              <div className="form-group mb-3">
                                <label className="form-label">
                                  <FaEdit className="me-2" /> Message de demande
                                </label>
                                <textarea
                                  name="messageDemande"
                                  className="form-control"
                                  value={editFormData.messageDemande}
                                  onChange={handleEditFormChange}
                                  rows="3"
                                  placeholder="Informations supplémentaires pour l'hôte..."
                                ></textarea>
                              </div>
                            </div>
                            <div className="edit-form-footer">
                              <button
                                className="btn btn-success"
                                onClick={handleSaveEdit}
                              >
                                <FaCheck className="me-1" /> Enregistrer
                              </button>
                              <button
                                className="btn btn-secondary ms-2"
                                onClick={handleCancelEdit}
                              >
                                <FaTimes className="me-1" /> Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          // Affichage normal
                          <>
                            <td className="reservation-title-cell">
                              <div className="d-flex align-items-center">
                                {reservation.logement.photoprincipale ? (
                                  <img
                                    src={reservation.logement.photoprincipale}
                                    alt={reservation.logement.titre}
                                    className="reservation-thumbnail me-2"
                                  />
                                ) : (
                                  <div className="reservation-thumbnail-placeholder me-2">
                                    <FaHome />
                                  </div>
                                )}
                                <span>{reservation.logement.titre}</span>
                              </div>
                            </td>
                            <td>
                              {reservation.logement.adresse?.ville ||
                                "Non disponible"}
                            </td>
                            <td>
                              <div className="dates-cell">
                                <div>{formatDate(reservation.dateDebut)}</div>
                                <div className="text-muted">au</div>
                                <div>{formatDate(reservation.dateFin)}</div>
                              </div>
                            </td>
                            <td className="price-cell">
                              <span className="reservation-price">
                                {reservation.prixTotal.toFixed(2)} €
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <FaUsers className="me-1" />
                                <span>
                                  {reservation.nombrePersonnes}{" "}
                                  {reservation.nombrePersonnes > 1
                                    ? "personnes"
                                    : "personne"}
                                </span>
                              </div>
                            </td>
                            <td>
                              <span
                                className={getStatusBadgeClass(
                                  reservation.statut
                                )}
                              >
                                {reservation.statut.charAt(0).toUpperCase() +
                                  reservation.statut.slice(1)}
                              </span>
                            </td>
                            <td className="actions-cell">
                              <button
                                onClick={() =>
                                  (window.location.href = `/DetailReservation/${reservation._id}`)
                                }
                                className="btn btn-sm btn-details me-2"
                                title="Voir les détails"
                              >
                                <FaEye />
                              </button>

                              {(reservation.statut === "confirmée" ||
                                reservation.statut === "en attente") && (
                                <>
                                  <button
                                    onClick={() =>
                                      handleStartEdit(reservation._id)
                                    }
                                    className="btn btn-sm btn-edit me-2"
                                    title="Modifier la réservation"
                                  >
                                    <FaEdit />
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleAnnulerReservation(reservation._id)
                                    }
                                    className="btn btn-sm btn-cancel"
                                    title="Annuler la réservation"
                                  >
                                    <FaTimesCircle />
                                  </button>
                                </>
                              )}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vue carte pour mobile et tablette */}
              <div className="reservation-cards-container d-lg-none">
                {renderReservationCards()}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Fenêtre modale pour les messages */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
        className="reservation-modal"
      >
        <Modal.Header
          closeButton
          className={`modal-header-${modalContent.type}`}
        >
          <Modal.Title>
            {modalContent.type === "warning" && (
              <FaExclamationTriangle className="me-2" />
            )}
            {modalContent.type === "error" && (
              <FaTimesCircle className="me-2" />
            )}
            {modalContent.type === "success" && <FaCheck className="me-2" />}
            {modalContent.type === "info" && <FaCalendarAlt className="me-2" />}
            {modalContent.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalContent.type === "warning" && (
            <div className="d-flex align-items-center mb-3 text-warning">
              <FaClock size={24} className="me-3" />
              <p className="mb-0 fw-bold">Délai de 48 heures</p>
            </div>
          )}
          <p>{modalContent.message}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Fermer
          </Button>
        </Modal.Footer>
      </Modal>
    </Layout>
  );
};

export default MesReservations;
