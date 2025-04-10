import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CommandeService from "../services/commandeService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import "../styles/mesCommandes.css";
import Layout from "../components/Layout";

const MesCommandesPage = () => {
  const [commandes, setCommandes] = useState([]);
  const [filteredCommandes, setFilteredCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("toutes");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        setLoading(true);
        const data = await CommandeService.getUserCommandes();
        setCommandes(data);
        setFilteredCommandes(data);
      } catch (err) {
        setError(
          "Impossible de charger vos commandes. Veuillez réessayer plus tard."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommandes();
  }, []);

  const handleFilterChange = (status) => {
    setActiveFilter(status);
    if (status === "toutes") {
      setFilteredCommandes(commandes);
    } else {
      const filtered = CommandeService.filterCommandesByStatus(
        commandes,
        status
      );
      setFilteredCommandes(filtered);
    }
  };

  /*const handleCancelCommande = async (id) => {
    try {
      await CommandeService.annulerCommande(id);
      // Mettre à jour l'état local après l'annulation
      const updatedCommandes = commandes.map((commande) =>
        commande._id === id ? { ...commande, statut: "annulée" } : commande
      );
      setCommandes(updatedCommandes);
      setFilteredCommandes(
        CommandeService.filterCommandesByStatus(updatedCommandes, activeFilter)
      );
    } catch (err) {
      setError(
        "Impossible d'annuler la commande. Veuillez réessayer plus tard."
      );
    }
  };*/

  const handlePayment = (commandeId) => {
    navigate(`/paiement/${commandeId}`);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "en attente":
        return "status-pending";
      case "confirmée":
        return "status-confirmed";
      case "non payé":
        return "status-pending";
      case "terminée":
        return "status-completed";
      case "annulée":
        return "status-canceled";
      default:
        return "status-pending";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "en attente":
        return "En attente";
      case "confirmée":
        return "Confirmée";
      case "non payé":
        return "Non payé";
      case "terminée":
        return "Terminée";
      case "annulée":
        return "Annulée";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd MMMM yyyy", { locale: fr });
  };

  if (loading) {
    return (
      <div className="commandes-container loading-container">
        <div className="loader"></div>
        <p>Chargement de vos commandes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="commandes-container error-container">
        <div className="alert alert-danger">{error}</div>
        <button
          className="btn btn-outline-primary"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <Layout>
      <div className="commandes-container">
        <div className="commandes-header">
          <h1>Mes Commandes</h1>
          <div className="commandes-filters">
            <button
              className={`filter-btn ${
                activeFilter === "toutes" ? "active" : ""
              }`}
              onClick={() => handleFilterChange("toutes")}
            >
              Toutes
            </button>
            <button
              className={`filter-btn ${
                activeFilter === "non payé" ? "active" : ""
              }`}
              onClick={() => handleFilterChange("non payé")}
            >
              Non payées
            </button>
            <button
              className={`filter-btn ${
                activeFilter === "terminée" ? "active" : ""
              }`}
              onClick={() => handleFilterChange("terminée")}
            >
              Terminées
            </button>
            <button
              className={`filter-btn ${
                activeFilter === "annulée" ? "active" : ""
              }`}
              onClick={() => handleFilterChange("annulée")}
            >
              Annulées
            </button>
          </div>
        </div>

        {filteredCommandes.length === 0 ? (
          <div className="no-commandes">
            <i className="fas fa-shopping-bag empty-icon"></i>
            <p>
              Vous n'avez pas encore de commandes{" "}
              {activeFilter !== "toutes"
                ? `avec le statut "${getStatusLabel(activeFilter)}"`
                : ""}
              .
            </p>
            <Link to="/" className="btn btn-primary">
              Découvrir des logements
            </Link>
          </div>
        ) : (
          <div className="commandes-list">
            {filteredCommandes.map((commande) => (
              <div className="commande-card" key={commande._id}>
                <div className="commande-header">
                  <div className="commande-info">
                    <span className="commande-id">
                      Commande #{commande._id.substring(0, 8)}
                    </span>
                    <span
                      className={`commande-status ${getStatusBadgeClass(
                        commande.statut
                      )}`}
                    >
                      {getStatusLabel(commande.statut)}
                    </span>
                  </div>
                  <div className="commande-date">
                    {commande.createdAt && formatDate(commande.createdAt)}
                  </div>
                </div>

                <div className="commande-content">
                  <div className="commande-property">
                    {commande.logement && (
                      <>
                        <img
                          src={`/uploads/${commande.logement.photoprincipale}`}
                          alt={commande.logement.titre}
                          className="property-img"
                        />
                        <div className="property-details">
                          <h3>{commande.logement.titre}</h3>

                          <p className="property-address">
                            {commande.logement.adresse.rue},{" "}
                            {commande.logement.adresse.codePostal}{" "}
                            {commande.logement.adresse.ville},{" "}
                            {commande.logement.adresse.pays}
                          </p>
                          <div className="reservation-dates">
                            <div>
                              <span className="date-label">Arrivée:</span>
                              <span className="date-value">
                                {formatDate(commande.dateDebut)}
                              </span>
                            </div>
                            <div>
                              <span className="date-label">Départ:</span>
                              <span className="date-value">
                                {formatDate(commande.dateFin)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="commande-actions">
                    <div className="commande-price">
                      <span className="price-label">Prix total</span>
                      <span className="price-value">
                        {commande.prixTotal?.toFixed(2) || 0} €
                      </span>
                    </div>
                    <div className="action-buttons">
                      {commande.statut === "non payé" ? (
                        <button
                          className="btn btn-primary"
                          onClick={() => handlePayment(commande._id)}
                        >
                          Paiement
                        </button>
                      ) : commande.statut === "terminée" ? (
                        <button className="btn btn-success" disabled>
                          Terminée
                        </button>
                      ) : null}
                      {/*{commande.statut === "non payé" && (
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleCancelCommande(commande._id)}
                      >
                        Annuler
                      </button>
                    )}*/}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MesCommandesPage;
