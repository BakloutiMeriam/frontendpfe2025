import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import UserService from "../services/UserService";

const PropsList = () => {
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
      await UserService.rejectProprietaire(selectedUser._id, rejectReason);
      setMessage({
        type: "success",
        text: "Propriétaire rejeté avec succès!",
      });
      closeModal();
      fetchPendingProprietaires();
    } catch (error) {
      console.error("Erreur lors du rejet:", error);
      setMessage({
        type: "danger",
        text: `Erreur lors du rejet: ${
          error.response?.status || error.message
        }`,
      });
    }
  };

  const checkApiRoutes = async () => {
    try {
      const routes = await UserService.getApiRoutes();
      console.log("Routes API disponibles:", routes);
    } catch (error) {
      console.log("Impossible de vérifier les routes API");
    }
  };

  const openRejectModal = (user) => {
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
      <Navbar />
      <div className="user-list-card">
        <h3 className="h3">Liste des Propriétaires en Attente</h3>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
            <button
              className="close-btn"
              onClick={() => setMessage({ type: "", text: "" })}
            >
              &times;
            </button>
          </div>
        )}

        <div className="filter-bar">
          <input
            type="text"
            placeholder="Rechercher un propriétaire..."
            value={searchTerm}
            onChange={handleSearch}
          />
          <button onClick={checkApiRoutes} className="debug-btn">
            Vérifier API
          </button>
        </div>

        {loading ? (
          <div className="loading">Chargement en cours...</div>
        ) : filteredProprietaires.length === 0 ? (
          <div className="no-results">Aucun propriétaire en attente trouvé</div>
        ) : (
          <>
            <table className="user-list-table">
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
                    <td>{proprietaire.nom}</td>
                    <td>{proprietaire.prenom}</td>
                    <td>{proprietaire.email}</td>
                    <td>{proprietaire.tel}</td>
                    <td>{proprietaire.adresse}</td>
                    <td className="actions">
                      <button
                        className="approve-btn"
                        onClick={() => handleApprove(proprietaire._id)}
                      >
                        Approuver
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => openRejectModal(proprietaire)}
                      >
                        Rejeter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                {[...Array(totalPages).keys()].map((number) => (
                  <button
                    key={number + 1}
                    className={`page-link ${
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
          <div className="modal">
            <div className="modal-content">
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
              <div className="modal-buttons">
                <button className="cancel-btn" onClick={closeModal}>
                  Annuler
                </button>
                <button className="confirm-btn" onClick={handleReject}>
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PropsList;
