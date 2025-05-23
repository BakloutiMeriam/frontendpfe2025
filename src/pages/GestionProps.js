import React, { useEffect, useState } from "react";
import "../styles/PropsList.css";
import UserService from "../services/UserService";
import Layout from "../components/Layout";
import {
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiAlertTriangle,
  FiInfo,
  FiChevronLeft,
  FiChevronRight,
  FiUser,
  FiMail,
  FiPhone,
  FiHome,
  FiRefreshCw,
} from "react-icons/fi";

const GestionProps = () => {
  const [proprietaires, setProprietaires] = useState([]);
  const [filteredProprietaires, setFilteredProprietaires] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Chargement initial des données
  useEffect(() => {
    loadProprietaires();
  }, []);

  const loadProprietaires = async () => {
    try {
      setLoading(true);
      const data = await UserService.getPendingProprietaires();
      setProprietaires(data);
      setFilteredProprietaires(data);
      setLoading(false);
    } catch (error) {
      handleError("Erreur lors du chargement", error);
    }
  };

  const handleError = (context, error) => {
    console.error(`${context}:`, error);
    setMessage({
      type: "error",
      text: `${context}: ${error.message || "Erreur inconnue"}`,
    });
    setLoading(false);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredProprietaires(proprietaires);
      return;
    }
    const filtered = proprietaires.filter((prop) =>
      `${prop.prenom} ${prop.nom} ${prop.email}`
        .toLowerCase()
        .includes(term.toLowerCase())
    );
    setFilteredProprietaires(filtered);
    setCurrentPage(1);
  };

  const handleApprove = async (userId) => {
    try {
      await UserService.approveProprietaire(userId);
      setMessage({
        type: "success",
        text: "Propriétaire approuvé avec succès",
      });
      loadProprietaires();
    } catch (error) {
      handleError("Erreur lors de l'approbation", error);
    }
  };

  const handleReject = async () => {
    if (!selectedUser) return;

    try {
      await UserService.rejectProprietaire(selectedUser._id, rejectReason);
      setMessage({ type: "success", text: "Propriétaire rejeté avec succès" });
      closeModal();
      loadProprietaires();
    } catch (error) {
      handleError("Erreur lors du rejet", error);
    }
  };

  const openRejectModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setRejectReason("");
  };

  // Pagination
  const totalPages = Math.ceil(filteredProprietaires.length / itemsPerPage);
  const paginatedData = filteredProprietaires.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <div className="gestion-props-container">
        {/* En-tête */}
        <header className="gp-header">
          <div className="gp-title-section">
            <h1>Validation des Propriétaires</h1>
            <p className="gp-subtitle">Gestion des demandes en attente</p>
          </div>

          <div className="gp-actions">
            <div className="gp-search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Rechercher un propriétaire..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <button
              className="gp-refresh-btn"
              onClick={loadProprietaires}
              disabled={loading}
            >
              <FiRefreshCw className={loading ? "spin" : ""} />
              Actualiser
            </button>
          </div>
        </header>

        {/* Message d'état */}
        {message.text && (
          <div className={`gp-message gp-${message.type}`}>
            <div className="message-content">
              {message.type === "success" ? (
                <FiCheckCircle />
              ) : (
                <FiAlertTriangle />
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage({ type: "", text: "" })}
              className="message-close"
            >
              <FiXCircle />
            </button>
          </div>
        )}

        {/* Contenu principal */}
        <main className="gp-main-content">
          {/* Statistiques */}
          <div className="gp-stats">
            <div className="stat-card">
              <span className="stat-value">{proprietaires.length}</span>
              <span className="stat-label">Demandes totales</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{filteredProprietaires.length}</span>
              <span className="stat-label">Résultats filtrés</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{totalPages}</span>
              <span className="stat-label">Pages</span>
            </div>
          </div>

          {/* Liste des propriétaires */}
          {loading ? (
            <div className="gp-loading">
              <div className="loading-spinner"></div>
              <p>Chargement en cours...</p>
            </div>
          ) : filteredProprietaires.length === 0 ? (
            <div className="gp-empty">
              <FiInfo size={48} />
              <h3>Aucune demande trouvée</h3>
              <p>Aucun propriétaire ne correspond à votre recherche</p>
            </div>
          ) : (
            <>
              <div className="gp-proprietaires-list">
                {paginatedData.map((prop) => (
                  <div key={prop._id} className="proprietaire-card">
                    <div className="pc-header">
                      <div className="pc-avatar">
                        <FiUser size={24} />
                      </div>
                      <div className="pc-identity">
                        <h3>
                          {prop.prenom} {prop.nom}
                        </h3>
                        <div className="pc-email">
                          <FiMail size={16} />
                          <span>{prop.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pc-details">
                      <div className="pc-detail-item">
                        <FiPhone size={16} />
                        <span>{prop.tel || "Non renseigné"}</span>
                      </div>
                      <div className="pc-detail-item">
                        <FiHome size={16} />
                        <span>{prop.adresse || "Non renseignée"}</span>
                      </div>
                    </div>

                    <div className="pc-actions">
                      <button
                        onClick={() => handleApprove(prop._id)}
                        className="pc-approve"
                      >
                        <FiCheckCircle /> Approuver
                      </button>
                      <button
                        onClick={() => openRejectModal(prop)}
                        className="pc-reject"
                      >
                        <FiXCircle /> Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="gp-pagination">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <FiChevronLeft /> Précédent
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={currentPage === i + 1 ? "active" : ""}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Suivant <FiChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {/* Modal de rejet */}
        {showModal && (
          <div className="gp-modal-overlay">
            <div className="gp-modal">
              <div className="gp-modal-header">
                <h3>Confirmer le rejet</h3>
                <button onClick={closeModal} className="gp-modal-close">
                  <FiXCircle />
                </button>
              </div>

              <div className="gp-modal-body">
                <div className="modal-user-info">
                  <div className="modal-avatar">
                    <FiUser size={32} />
                  </div>
                  <div>
                    <h4>
                      {selectedUser?.prenom} {selectedUser?.nom}
                    </h4>
                    <p>{selectedUser?.email}</p>
                  </div>
                </div>

                <div className="modal-reason">
                  <label>Motif du rejet (optionnel)</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Décrivez la raison du rejet..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="gp-modal-footer">
                <button onClick={closeModal} className="modal-cancel">
                  Annuler
                </button>
                <button onClick={handleReject} className="modal-confirm">
                  Confirmer le rejet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GestionProps;
