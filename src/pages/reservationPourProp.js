import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { reservationService } from "../services/reservationService";
import "../styles/reservationPourProp.css";
import { toast } from "react-toastify";
import Layout from "../components/Layout";

const MesReservationsProp = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("toutes");
  const [searchQuery, setSearchQuery] = useState(""); // Barre de recherche pour le nom du logement
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const data = await reservationService.getProprietaireReservations();
        setReservations(data.reservations || data);
      } catch (error) {
        console.error("Erreur lors du chargement des réservations:", error);
        toast.error("Impossible de charger vos réservations");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const handleReponseReservation = async (id, statut) => {
    try {
      await reservationService.repondreReservation(id, statut);
      toast.success(
        `Réservation ${
          statut === "confirmée" ? "acceptée" : "refusée"
        } avec succès`
      );

      // Mettre à jour l'état local
      setReservations(
        reservations.map((res) => (res._id === id ? { ...res, statut } : res))
      );
    } catch (error) {
      console.error("Erreur lors de la réponse à la réservation:", error);
      toast.error("Erreur lors du traitement de votre réponse");
    }
  };

  // Filtrer les réservations selon l'onglet actif et la recherche par nom de logement
  const filteredReservations = reservations.filter((reservation) => {
    // Filtre par statut
    const statusMatch =
      activeTab === "toutes" ||
      (activeTab === "en-attente" && reservation.statut === "en attente") ||
      (activeTab === "confirmees" && reservation.statut === "confirmée") ||
      (activeTab === "terminees" && reservation.statut === "terminée") ||
      (activeTab === "annulees" && reservation.statut === "annulée");

    // Filtre par nom de logement (recherche)
    const logementMatch =
      searchQuery === "" ||
      reservation.logement.titre
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return statusMatch && logementMatch;
  });

  // Formater la date
  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setActiveTab("toutes");
    setSearchQuery("");
  };

  return (
    <Layout>
      <div className="reservations-container">
        <h1 className="reservations-title">Mes Réservations</h1>

        <div className="filters-container">
          <div className="reservations-tabs">
            <button
              className={`tab-button ${activeTab === "toutes" ? "active" : ""}`}
              onClick={() => setActiveTab("toutes")}
            >
              Toutes
            </button>
            <button
              className={`tab-button ${
                activeTab === "en-attente" ? "active" : ""
              }`}
              onClick={() => setActiveTab("en-attente")}
            >
              En attente
            </button>
            <button
              className={`tab-button ${
                activeTab === "confirmees" ? "active" : ""
              }`}
              onClick={() => setActiveTab("confirmees")}
            >
              Confirmées
            </button>
            <button
              className={`tab-button ${
                activeTab === "terminees" ? "active" : ""
              }`}
              onClick={() => setActiveTab("terminees")}
            >
              Terminées
            </button>
            <button
              className={`tab-button ${
                activeTab === "annulees" ? "active" : ""
              }`}
              onClick={() => setActiveTab("annulees")}
            >
              Annulées
            </button>
          </div>

          <div className="search-container">
            <div className="search-input-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Rechercher par nom de logement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  className="clear-search-button"
                  onClick={() => setSearchQuery("")}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            {(activeTab !== "toutes" || searchQuery !== "") && (
              <button className="reset-filters-button" onClick={resetFilters}>
                <i className="fas fa-times"></i> Réinitialiser les filtres
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Chargement des réservations...</p>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="empty-reservations">
            <i className="fas fa-calendar-times"></i>
            <p>
              Aucune réservation{" "}
              {activeTab !== "toutes" || searchQuery !== ""
                ? "correspondant aux critères"
                : ""}
            </p>
          </div>
        ) : (
          <div className="reservations-list">
            {filteredReservations.map((reservation) => (
              <div
                key={reservation._id}
                className={`reservation-card status-${reservation.statut.replace(
                  " ",
                  "-"
                )}`}
              >
                <div className="reservation-header">
                  <div className="reservation-logement">
                    {reservation.logement.photoprincipale && (
                      <img
                        src={
                          reservation.logement.photoprincipale.startsWith(
                            "data:"
                          )
                            ? reservation.logement.photoprincipale
                            : `/uploads/${reservation.logement.photoprincipale}`
                        }
                        alt={reservation.logement.titre}
                        className="logement-imagee"
                      />
                    )}
                    <div className="logement-details">
                      <h3>{reservation.logement.titre}</h3>
                      <p className="logement-address">
                        <i className="fas fa-map-marker-alt"></i>{" "}
                        {reservation.logement.adresse.rue},{" "}
                        {reservation.logement.adresse.codePostal}{" "}
                        {reservation.logement.adresse.ville},{" "}
                        {reservation.logement.adresse.pays}
                      </p>
                    </div>
                  </div>
                  <div className="reservation-status">
                    <span
                      className={`status-badge status-${reservation.statut.replace(
                        " ",
                        "-"
                      )}`}
                    >
                      {reservation.statut}
                    </span>
                  </div>
                </div>

                <div className="reservation-details">
                  <div className="detail-item">
                    <i className="fas fa-user"></i>
                    <span>
                      {reservation.client
                        ? `${reservation.client.prenom} ${reservation.client.nom}`
                        : "Client inconnu"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-envelope"></i>
                    <span>
                      {reservation.client?.email || "Email non disponible"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-phone"></i>
                    <span>{reservation.client?.tel || "Non renseigné"}</span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-calendar-day"></i>
                    <span>
                      Du {formatDate(reservation.dateDebut)} au{" "}
                      {formatDate(reservation.dateFin)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-users"></i>
                    <span>
                      {reservation.nombrePersonnes} personne
                      {reservation.nombrePersonnes > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="detail-item">
                    <i className="fas fa-euro-sign"></i>
                    <span>{reservation.prixTotal.toFixed(2)} €</span>
                  </div>
                </div>

                {reservation.messageDemande && (
                  <div className="reservation-message">
                    <strong>Message du client :</strong>
                    <p>{reservation.messageDemande}</p>
                  </div>
                )}

                {reservation.statut === "en attente" && (
                  <div className="reservation-actions">
                    <button
                      className="action-button confirm"
                      onClick={() =>
                        handleReponseReservation(reservation._id, "confirmée")
                      }
                    >
                      <i className="fas fa-check"></i> Accepter
                    </button>
                    <button
                      className="action-button reject"
                      onClick={() =>
                        handleReponseReservation(reservation._id, "annulée")
                      }
                    >
                      <i className="fas fa-times"></i> Refuser
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MesReservationsProp;
