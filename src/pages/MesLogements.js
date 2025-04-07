import React, { useState, useEffect } from "react";
import { logementService } from "../services/LogementService";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/MesLogements.css";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";

const MesLogements = () => {
  const [logements, setLogements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // État pour suivre les descriptions étendues
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  // États pour le modal de confirmation
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [logementToDelete, setLogementToDelete] = useState(null);

  useEffect(() => {
    const fetchMesLogements = async () => {
      try {
        const data = await logementService.getMesLogements();
        setLogements(data);
        setLoading(false);
      } catch (err) {
        setError("Impossible de charger vos logements");
        setLoading(false);
      }
    };

    fetchMesLogements();
  }, []);

  // Fonction pour basculer l'état d'expansion d'une description
  const toggleDescription = (logementId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [logementId]: !prev[logementId],
    }));
  };

  // Ouvre le modal de confirmation et stocke l'ID du logement à supprimer
  const openDeleteConfirmation = (logement) => {
    setLogementToDelete(logement);
    setShowConfirmModal(true);
  };

  // Ferme le modal de confirmation
  const closeDeleteConfirmation = () => {
    setShowConfirmModal(false);
    setLogementToDelete(null);
  };

  // Effectue la suppression après confirmation
  const confirmDeleteLogement = async () => {
    if (!logementToDelete) return;

    try {
      await logementService.deleteLogement(logementToDelete._id);
      setLogements(logements.filter((log) => log._id !== logementToDelete._id));
      closeDeleteConfirmation();
    } catch (err) {
      console.error("Erreur lors de la suppression du logement", err);
      alert("Impossible de supprimer le logement");
      closeDeleteConfirmation();
    }
  };

  const toggleDisponibilite = async (logement) => {
    try {
      const updatedLogement = await logementService.toggleDisponibilite(
        logement._id,
        logement.disponible
      );
      setLogements(
        logements.map((log) =>
          log._id === logement._id
            ? { ...log, disponible: updatedLogement.disponible }
            : log
        )
      );
    } catch (err) {
      console.error("Erreur lors du changement de disponibilité", err);
      alert(
        err.response?.data?.message ||
          "Impossible de modifier la disponibilité. Veuillez réessayer."
      );
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/logement-details/${id}`);
  };

  if (loading)
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status" className="loading-spinner">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
      </Container>
    );

  if (error)
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );

  return (
    <Layout>
      <div className="logements-container">
        <Container>
          <div className="d-flex justify-content-between align-items-center logements-header">
            <h1 className="logements-title">Mes Logements</h1>
            <Link to="/AddLogement">
              <Button className="add-logement-btn">
                <i className="bi bi-plus-lg"></i>
                Ajouter un logement
              </Button>
            </Link>
          </div>

          {logements.length === 0 ? (
            <div className="empty-state">
              <Alert variant="info" className="empty-state-message border-0">
                <i className="bi bi-house-add me-2"></i>
                Vous n'avez pas encore de logements. Commencez par en ajouter un
                !
              </Alert>
            </div>
          ) : (
            <Row xs={1} md={2} lg={3} className="g-4">
              {logements.map((logement) => (
                <Col key={logement._id}>
                  <Card className="logement-card">
                    <div className="logement-image-container">
                      <img
                        src={
                          logement.photoprincipale ||
                          "/images/placeholder-logement.jpg"
                        }
                        alt={logement.titre}
                        className="logement-image"
                      />
                      <Badge
                        className={`logement-badge ${
                          logement.disponible
                            ? "badge-disponible"
                            : "badge-indisponible"
                        }`}
                      >
                        {logement.disponible ? "DISPONIBLE" : "NON DISPONIBLE"}
                      </Badge>
                    </div>

                    <Card.Body className="logement-card-body">
                      <h5 className="logement-title">{logement.titre}</h5>

                      {/* Description avec toggle pour afficher plus/moins */}
                      <div
                        className={`logement-description ${
                          expandedDescriptions[logement._id] ? "expanded" : ""
                        }`}
                      >
                        {logement.description}
                      </div>

                      {/* Bouton pour afficher plus/moins */}
                      <button
                        className="description-toggle-btn"
                        onClick={() => toggleDescription(logement._id)}
                      >
                        {expandedDescriptions[logement._id] ? (
                          <>
                            Voir moins <i className="bi bi-chevron-up"></i>
                          </>
                        ) : (
                          <>
                            Voir plus <i className="bi bi-chevron-down"></i>
                          </>
                        )}
                      </button>

                      <div className="logement-info">
                        <div className="logement-price">{logement.prix} €</div>
                        <div className="logement-size">
                          <i className="bi bi-rulers me-1"></i>
                          {logement.superficie} m²
                        </div>
                      </div>

                      <div className="logement-actions">
                        <Button
                          variant={logement.disponible ? "success" : "danger"}
                          className={`action-btn ${
                            logement.disponible
                              ? "btn-disponible"
                              : "btn-indisponible"
                          }`}
                          onClick={() => toggleDisponibilite(logement)}
                        >
                          <i
                            className={`bi ${
                              logement.disponible
                                ? "bi-toggle-on"
                                : "bi-toggle-off"
                            }`}
                          ></i>
                          {logement.disponible ? "Dispo" : "Indispo"}
                        </Button>

                        <Button
                          className="action-btn btn-details"
                          onClick={() => handleViewDetails(logement._id)}
                        >
                          <i className="bi bi-eye"></i>
                          Détails
                        </Button>

                        <Button
                          className="action-btn btn-supprimer"
                          onClick={() => openDeleteConfirmation(logement)}
                        >
                          <i className="bi bi-trash"></i>
                          Supprimer
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {/* Modal de confirmation de suppression */}
          <Modal
            show={showConfirmModal}
            onHide={closeDeleteConfirmation}
            centered
            className="delete-confirmation-modal"
          >
            <Modal.Header closeButton>
              <Modal.Title>Confirmation de suppression</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {logementToDelete && (
                <div className="text-center">
                  <div className="mb-3">
                    <i className="bi bi-exclamation-triangle text-danger delete-icon"></i>
                  </div>
                  <h5>Êtes-vous sûr de vouloir supprimer ce logement ?</h5>
                  <p className="text-muted">{logementToDelete.titre}</p>
                  <p className="small text-danger">
                    Cette action est irréversible.
                  </p>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
              <Button variant="secondary" onClick={closeDeleteConfirmation}>
                Annuler
              </Button>
              <Button variant="danger" onClick={confirmDeleteLogement}>
                Supprimer
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </Layout>
  );
};

export default MesLogements;
