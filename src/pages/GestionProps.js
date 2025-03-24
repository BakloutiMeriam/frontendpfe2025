import React, { useEffect, useState } from "react";
import "../styles/PropsList.css";
import UserService from "../services/UserService";
import Layout from "../components/Layout";

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
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPendingProprietaires();
  }, []);

  const fetchPendingProprietaires = async () => {
    try {
      setLoading(true);
      const response = await UserService.getPendingProprietaires();
      setProprietaires(response);
      setFilteredProprietaires(response);
      setLoading(false);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des propriétaires en attente:",
        error
      );
      setLoading(false);
      setMessage({
        type: "danger",
        text: `Erreur lors du chargement des données: ${
          error.response?.status || error.message
        }`,
      });
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value) {
      const filtered = proprietaires.filter(
        (prop) =>
          prop.nom.toLowerCase().includes(value.toLowerCase()) ||
          prop.prenom.toLowerCase().includes(value.toLowerCase()) ||
          prop.email.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProprietaires(filtered);
    } else {
      setFilteredProprietaires(proprietaires);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await UserService.approveProprietaire(userId);
      setMessage({
        type: "success",
        text: "Propriétaire approuvé avec succès!",
      });
      fetchPendingProprietaires();
    } catch (error) {
      console.error("Erreur lors de l'approbation:", error);
      setMessage({
        type: "danger",
        text: `Erreur lors de l'approbation: ${
          error.response?.status || error.message
        }`,
      });
    }
  };

  const handleReject = async () => {
    if (!selectedUser) return;

    try {
      const response = await UserService.rejectProprietaire(
        selectedUser._id,
        rejectReason
      );
      console.log("Réponse du serveur:", response);
      setMessage({
        type: "success",
        text: "Propriétaire rejeté avec succès!",
      });
      closeModal();
      fetchPendingProprietaires();
    } catch (error) {
      console.error("Erreur détaillée:", error);
      console.error("Statut:", error.response?.status);
      console.error("Message d'erreur:", error.response?.data);
      console.error("Erreur lors du rejet:", error);
      setMessage({
        type: "danger",
        text: `Erreur lors du rejet: ${
          error.response?.status || error.message
        }`,
      });
    }
  };

  const openRejectModal = (user) => {
    console.log("openRejectModal appelé avec:", user);
    setSelectedUser(user);
    setRejectReason("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setRejectReason("");
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProprietaires.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProprietaires.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Layout>
        <div className="proprietaire-list-card">
          <h3 className="proprietaire-title">
            Liste des Propriétaires en Attente
          </h3>

          {message.text && (
            <div
              className={`proprietaire-alert proprietaire-alert-${message.type}`}
            >
              {message.text}
              <button
                className="proprietaire-close-btn"
                onClick={() => setMessage({ type: "", text: "" })}
              >
                &times;
              </button>
            </div>
          )}

          <div className="proprietaire-filter-bar">
            <input
              type="text"
              placeholder="Rechercher un propriétaire..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          {loading ? (
            <div className="proprietaire-loading">Chargement en cours...</div>
          ) : filteredProprietaires.length === 0 ? (
            <div className="proprietaire-no-results">
              Aucun propriétaire en attente trouvé
            </div>
          ) : (
            <>
              <div className="proprietaire-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Adresse</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((proprietaire) => (
                    <tr key={proprietaire._id}>
                      <td data-label="Nom">{proprietaire.nom}</td>
                      <td data-label="Prénom">{proprietaire.prenom}</td>
                      <td data-label="Email">{proprietaire.email}</td>
                      <td data-label="Téléphone">{proprietaire.tel}</td>
                      <td data-label="Adresse">{proprietaire.adresse}</td>
                      <td className="proprietaire-actions">
                        <button
                          className="proprietaire-approve-btn"
                          onClick={() => handleApprove(proprietaire._id)}
                        >
                          Approuver
                        </button>
                        <button
                          className="proprietaire-reject-btn"
                          onClick={() => openRejectModal(proprietaire)}
                        >
                          Rejeter
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </div>

              {totalPages > 1 && (
                <div className="proprietaire-pagination">
                  {[...Array(totalPages).keys()].map((number) => (
                    <button
                      key={number + 1}
                      className={`proprietaire-page-link ${
                        currentPage === number + 1 ? "active" : ""
                      }`}
                      onClick={() => paginate(number + 1)}
                    >
                      {number + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {showModal && (
            <div className="proprietaire-modal">
              <div className="proprietaire-modal-content">
                <h4>Rejeter le propriétaire</h4>
                <p>
                  Êtes-vous sûr de vouloir rejeter {selectedUser.prenom}{" "}
                  {selectedUser.nom}?
                </p>
                <textarea
                  placeholder="Raison du rejet (optionnel)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows="4"
                />
                <div className="proprietaire-modal-buttons">
                  <button
                    className="proprietaire-cancel-btn"
                    onClick={closeModal}
                  >
                    Annuler
                  </button>
                  <button
                    className="proprietaire-confirm-btn"
                    onClick={handleReject}
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
};

export default GestionProps;
