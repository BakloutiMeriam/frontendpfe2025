import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/ListUsers.css";
import Layout from "../components/Layout";
import ContactModal from "../components/ContactModal"; // Importez le nouveau composant

const ListProprietaire = () => {
  const [proprietaires, setProprietaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table"); // table or card
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedProprietaire, setSelectedProprietaire] = useState(null);

  useEffect(() => {
    const fetchProprietaires = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/user/proprietaires");
        setProprietaires(response.data);
        setLoading(false);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des propriétaires:",
          error
        );
        setError("Erreur de chargement des propriétaires");
        setLoading(false);
      }
    };

    fetchProprietaires();
  }, []);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  // Filter logic
  const filteredProprietaires = proprietaires.filter(
    (proprietaire) =>
      proprietaire.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proprietaire.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proprietaire.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proprietaire.tel
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      proprietaire.adresse?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentProprietaires = filteredProprietaires.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getDefaultAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${name}&background=2653a4&color=fff&size=50`;
  };

  // Fonction pour ouvrir le modal de contact
  const handleOpenContactModal = (proprietaire) => {
    setSelectedProprietaire(proprietaire);
    setShowContactModal(true);
  };

  // Fonction pour fermer le modal de contact
  const handleCloseContactModal = () => {
    setShowContactModal(false);
    setSelectedProprietaire(null);
  };

  if (loading)
    return (
      <Layout>
        <div className="admin-loading">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p>Chargement des données...</p>
        </div>
      </Layout>
    );

  if (error)
    return (
      <Layout>
        <div className="admin-error alert alert-danger">{error}</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1 className="admin-title">Liste des Propriétaires</h1>
          <div className="admin-actions">
            <div className="admin-search">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher un propriétaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearchTerm("")}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="admin-view-toggle btn-group">
              <button
                className={`btn ${
                  viewMode === "table" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setViewMode("table")}
              >
                <i className="bi bi-table"></i>
              </button>
              <button
                className={`btn ${
                  viewMode === "card" ? "btn-primary" : "btn-outline-primary"
                }`}
                onClick={() => setViewMode("card")}
              >
                <i className="bi bi-grid-3x3-gap"></i>
              </button>
            </div>
          </div>
        </div>

        <div className="admin-content">
          {filteredProprietaires.length === 0 ? (
            <div className="alert alert-info">Aucun propriétaire trouvé</div>
          ) : viewMode === "table" ? (
            <div className="admin-table-view">
              <div className="table-responsive">
                <table className="user-list-table table">
                  <thead>
                    <tr>
                      <th className="admin-th-photo">Photo</th>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Adresse</th>
                      <th className="admin-th-actions">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProprietaires.map((proprietaire) => (
                      <tr key={proprietaire._id} className="admin-table-row">
                        <td className="admin-user-photo">
                          <img
                            src={
                              proprietaire.url_img ||
                              getDefaultAvatar(
                                `${proprietaire.nom} ${proprietaire.prenom}`
                              )
                            }
                            alt={`${proprietaire.nom} ${proprietaire.prenom}`}
                            className="admin-user-avatar"
                          />
                        </td>
                        <td>{proprietaire.nom}</td>
                        <td>{proprietaire.prenom}</td>
                        <td>{proprietaire.email}</td>
                        <td>{proprietaire.tel}</td>
                        <td>{proprietaire.adresse}</td>
                        <td className="admin-action-buttons">
                          <button
                            className="btn btn-primary admin-btn"
                            title="Contacter"
                            onClick={() => handleOpenContactModal(proprietaire)}
                          >
                            <i className="bi bi-envelope"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="admin-card-view">
              <div className="row g-4">
                {currentProprietaires.map((proprietaire) => (
                  <div key={proprietaire._id} className="col-md-6 col-lg-4">
                    <div className="admin-user-card">
                      <div className="admin-user-card-header">
                        <img
                          src={
                            proprietaire.url_img ||
                            getDefaultAvatar(
                              `${proprietaire.nom} ${proprietaire.prenom}`
                            )
                          }
                          alt={`${proprietaire.nom} ${proprietaire.prenom}`}
                          className="admin-user-card-avatar"
                        />
                        <h5 className="admin-user-card-name">
                          {proprietaire.prenom} {proprietaire.nom}
                        </h5>
                        <span className="admin-badge admin-badge-proprietaire">
                          Propriétaire
                        </span>
                      </div>
                      <div className="admin-user-card-body">
                        <div className="admin-user-card-info">
                          <p>
                            <i className="bi bi-envelope"></i>{" "}
                            {proprietaire.email}
                          </p>
                          <p>
                            <i className="bi bi-telephone"></i>{" "}
                            {proprietaire.tel}
                          </p>
                          <p>
                            <i className="bi bi-geo-alt"></i>{" "}
                            {proprietaire.adresse}
                          </p>
                        </div>
                        <div className="admin-user-card-actions">
                          <button
                            className="btn btn-primary admin-btn"
                            title="Contacter"
                            onClick={() => handleOpenContactModal(proprietaire)}
                          >
                            <i className="bi bi-envelope"></i> Contacter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="admin-pagination">
            <nav aria-label="Navigation des pages propriétaires">
              <ul className="pagination justify-content-center">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage - 1)}
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                </li>
                {Array.from({
                  length: Math.ceil(
                    filteredProprietaires.length / usersPerPage
                  ),
                }).map((_, index) => (
                  <li
                    key={index}
                    className={`page-item ${
                      currentPage === index + 1 ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => paginate(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li
                  className={`page-item ${
                    currentPage ===
                    Math.ceil(filteredProprietaires.length / usersPerPage)
                      ? "disabled"
                      : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => paginate(currentPage + 1)}
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Modal de contact */}
      {selectedProprietaire && (
        <ContactModal
          show={showContactModal}
          handleClose={handleCloseContactModal}
          proprietaire={selectedProprietaire}
        />
      )}
    </Layout>
  );
};

export default ListProprietaire;
//hnee
