/*import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { reservationService } from "../services/reservationService";
import "../styles/reservationPourProp.css";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import ContactModal from "../components/ContactModal";

const MesReservationsProp = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("toutes");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useContext(AuthContext);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

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

  // Ouvrir le modal de contact avec un client spécifique
  const handleContactClient = (client) => {
    setSelectedClient(client);
    setShowContactModal(true);
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
        <h1 className="reservations-title">Liste demande des Réservations</h1>

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
                            : reservation.logement.photoprincipale.startsWith(
                                "http://localhost:3000/uploads/"
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

                <div className="reservation-actions">
                  {reservation.statut === "en attente" && (
                    <>
                      <button
                        className="action-button confirm"
                        onClick={() =>
                          handleReponseReservation(reservation._id, "confirmée")
                        }
                        title="Accepter"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button
                        className="action-button reject"
                        onClick={() =>
                          handleReponseReservation(reservation._id, "annulée")
                        }
                        title="Refuser"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </>
                  )}
                  {reservation.client && (
                    <button
                      className="action-button contact"
                      onClick={() => handleContactClient(reservation.client)}
                      title="Contacter le client"
                    >
                      <i className="fas fa-envelope"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedClient && (
        <ContactModal
          show={showContactModal}
          handleClose={() => {
            setShowContactModal(false);
            setSelectedClient(null);
          }}
          proprietaire={selectedClient}
          messageType="direct"
        />
      )}
    </Layout>
  );
};

export default MesReservationsProp;*/
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { reservationService } from "../services/reservationService";
import "../styles/reservationPourProp.css";
import { toast } from "react-toastify";
import Layout from "../components/Layout";
import ContactModal from "../components/ContactModal";
import ConfirmModal from "../components/ConfirmModal";

const MesReservationsProp = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("toutes");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useContext(AuthContext);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reservationToConfirm, setReservationToConfirm] = useState(null);
  const [conflictingReservations, setConflictingReservations] = useState([]);
  const [processing, setProcessing] = useState(false);

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

  // Vérifier les réservations en conflit
  const checkConflictingReservations = (reservation) => {
    // Trouver toutes les réservations en attente pour le même logement avec des dates qui se chevauchent
    const conflicts = reservations.filter((res) => {
      return (
        res._id !== reservation._id &&
        res.logement._id === reservation.logement._id &&
        res.statut === "en attente" &&
        ((new Date(res.dateDebut) >= new Date(reservation.dateDebut) &&
          new Date(res.dateDebut) <= new Date(reservation.dateFin)) ||
          (new Date(res.dateFin) >= new Date(reservation.dateDebut) &&
            new Date(res.dateFin) <= new Date(reservation.dateFin)) ||
          (new Date(res.dateDebut) <= new Date(reservation.dateDebut) &&
            new Date(res.dateFin) >= new Date(reservation.dateFin)))
      );
    });

    return conflicts;
  };

  const handleConfirmReservationClick = (reservation) => {
    const conflicts = checkConflictingReservations(reservation);

    if (conflicts.length > 0) {
      setReservationToConfirm(reservation);
      setConflictingReservations(conflicts);
      setShowConfirmModal(true);
    } else {
      // Si pas de conflit, confirmer directement
      handleReponseReservation(reservation._id, "confirmée");
    }
  };

  const handleReponseReservation = async (id, statut) => {
    // Empêcher les clics multiples
    if (processing) return;

    try {
      setProcessing(true); // Commencer le traitement

      const response = await reservationService.repondreReservation(id, statut);

      // Fermer le modal de confirmation s'il est ouvert
      setShowConfirmModal(false);

      let message = `Réservation ${
        statut === "confirmée" ? "acceptée" : "refusée"
      } avec succès`;

      // Ajouter des informations sur les réservations annulées automatiquement
      if (
        response.reservationsAnnuleesAuto &&
        response.reservationsAnnuleesAuto > 0
      ) {
        message += `. ${response.reservationsAnnuleesAuto} réservation(s) en conflit ont été automatiquement annulée(s).`;
      }

      toast.success(message);

      // Mettre à jour l'état local à la fois pour la réservation confirmée et les réservations en conflit
      // en une seule opération
      setReservations(
        reservations.map((res) => {
          // Mettre à jour la réservation confirmée/refusée
          if (res._id === id) {
            return { ...res, statut };
          }
          // Mettre à jour les réservations en conflit si une réservation est confirmée
          else if (
            statut === "confirmée" &&
            conflictingReservations.some((conflict) => conflict._id === res._id)
          ) {
            return { ...res, statut: "annulée" };
          }
          // Garder les autres réservations inchangées
          return res;
        })
      );
    } catch (error) {
      console.error("Erreur lors de la réponse à la réservation:", error);
      toast.error(
        "Erreur lors du traitement de votre réponse. Essayez de rafraîchir la page."
      );

      // Si l'erreur persiste après rafraîchissement, c'est probablement un problème plus grave
      if (error.response && error.response.status === 500) {
        // Rafraîchir la page comme solution de contournement
        setTimeout(() => {
          toast.info("Actualisation de la page...");
          window.location.reload();
        }, 2000);
      }
    } finally {
      setProcessing(false); // Fin du traitement
    }
  };

  // Ouvrir le modal de contact avec un client spécifique
  const handleContactClient = (client) => {
    setSelectedClient(client);
    setShowContactModal(true);
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

  // Vérifier si une réservation est expirée (date de départ passée)
  const isReservationExpired = (reservation) => {
    const today = new Date();
    const dateDebut = new Date(reservation.dateDebut);
    return today > dateDebut && reservation.statut === "en attente";
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setActiveTab("toutes");
    setSearchQuery("");
  };

  return (
    <Layout>
      <div className="reservations-container">
        <h1 className="reservations-title">Liste demande des Réservations</h1>

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
                )} ${isReservationExpired(reservation) ? "expired" : ""}`}
              >
                {isReservationExpired(reservation) && (
                  <div className="expired-banner">
                    <i className="fas fa-exclamation-circle"></i> Date d'arrivée
                    dépassée
                  </div>
                )}
                <div className="reservation-header">
                  <div className="reservation-logement">
                    {reservation.logement.photoprincipale && (
                      <img
                        src={
                          reservation.logement.photoprincipale.startsWith(
                            "data:"
                          )
                            ? reservation.logement.photoprincipale
                            : reservation.logement.photoprincipale.startsWith(
                                "http://localhost:3000/uploads/"
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

                <div className="reservation-actions">
                  {reservation.statut === "en attente" &&
                    !isReservationExpired(reservation) && (
                      <>
                        <button
                          className="action-button confirm"
                          onClick={() =>
                            handleConfirmReservationClick(reservation)
                          }
                          disabled={processing}
                          title="Accepter"
                        >
                          {processing ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-check"></i>
                          )}
                        </button>
                        <button
                          className="action-button reject"
                          onClick={() =>
                            handleReponseReservation(reservation._id, "annulée")
                          }
                          disabled={processing}
                          title="Refuser"
                        >
                          {processing ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-times"></i>
                          )}
                        </button>
                      </>
                    )}
                  {reservation.statut === "en attente" &&
                    isReservationExpired(reservation) && (
                      <div className="action-buttons-disabled">
                        <p>Réservation expirée</p>
                      </div>
                    )}
                  {reservation.client && (
                    <button
                      className="action-button contact"
                      onClick={() => handleContactClient(reservation.client)}
                      title="Contacter le client"
                    >
                      <i className="fas fa-envelope"></i>
                    </button>
                  )}
                </div>

                {reservation.statut === "en attente" &&
                  !isReservationExpired(reservation) &&
                  checkConflictingReservations(reservation).length > 0 && (
                    <div className="conflicting-warning">
                      <i className="fas fa-exclamation-triangle"></i>
                      <span>
                        {checkConflictingReservations(reservation).length === 1
                          ? "1 autre demande existe pour ces dates"
                          : `${
                              checkConflictingReservations(reservation).length
                            } autres demandes existent pour ces dates`}
                      </span>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de contact client */}
      {selectedClient && (
        <ContactModal
          show={showContactModal}
          handleClose={() => {
            setShowContactModal(false);
            setSelectedClient(null);
          }}
          proprietaire={selectedClient}
          messageType="direct"
        />
      )}

      <ConfirmModal
        show={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() =>
          handleReponseReservation(reservationToConfirm._id, "confirmée")
        }
        reservation={reservationToConfirm}
        conflictingReservations={conflictingReservations}
        formatDate={formatDate}
        processing={processing}
      />
    </Layout>
  );
};

export default MesReservationsProp;
