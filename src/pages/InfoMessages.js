import React, { useState, useEffect, useContext } from "react";
import { Container, Card } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import Layout from "../components/Layout";
import * as messageService from "../services/messageService";
import "../styles/InfoMessages.css";

const InfoMessages = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await messageService.getInfoMessages();
        setMessages(response.messages);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des messages:", error);
        setError(
          "Impossible de charger les messages. Veuillez réessayer plus tard."
        );
        setLoading(false);
      }
    };

    if (user && user.role === "proprietaire") {
      fetchMessages();
    }
  }, [user]);
  const handleDownload = async (messageId, attachmentId) => {
    try {
      await messageService.downloadAttachment(messageId, attachmentId);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      // Ajouter une notification d'erreur si nécessaire
    }
  };
  // Marquer un message comme lu lorsqu'il est ouvert
  const handleAccordionToggle = async (messageId, isRead) => {
    if (!isRead) {
      try {
        // Mise à jour optimiste de l'UI
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === messageId ? { ...msg, status: "read" } : msg
          )
        );

        // Appel API pour marquer le message comme lu
        await messageService.markMessageAsRead(messageId);
      } catch (error) {
        console.error("Erreur lors du marquage du message:", error);
      }
    }
  };

  // Formatage de la date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  if (loading) {
    return (
      <Layout>
        <Container fluid className="my-4">
          <div className="help-loading">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="ms-3 mb-0">Chargement des messages...</p>
          </div>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container fluid className="my-4">
          <div className="help-error-message">{error}</div>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="help-center-container">
        {/* En-tête bannière style Airbnb */}
        <div className="help-header-banner">
          <div className="help-header-content">
            <h1 className="help-title">Messages informatifs</h1>
            <p className="help-subtitle">
              Consultez les messages importants concernant votre compte et vos
              propriétés
            </p>
          </div>
        </div>

        {/* Container en pleine largeur pour maximiser l'espace */}
        <div className="info-messages-container">
          <Card.Body className="info-messages-body">
            {messages.length === 0 ? (
              <div className="help-empty-state">
                <i className="fas fa-inbox help-empty-icon"></i>
                <h5 className="help-empty-title">Aucun message</h5>
                <p className="help-empty-text">
                  Vous n'avez pas encore reçu de messages informatifs.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Sujet</th>
                      <th>Expéditeur</th>
                      <th>Date</th>
                      <th>Statut</th>
                      <th>Contenu</th>
                      <th>Pièces jointes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((message) => (
                      <tr
                        key={message._id}
                        className={
                          message.status === "unread" ? "table-warning" : ""
                        }
                        onClick={() =>
                          handleAccordionToggle(
                            message._id,
                            message.status !== "unread"
                          )
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <td>{message.subject}</td>
                        <td>
                          {message.sender?.nom} {message.sender?.prenom}
                        </td>
                        <td>{formatDate(message.createdAt)}</td>
                        <td>
                          <span
                            className={`badge ${
                              message.status === "unread"
                                ? "bg-danger"
                                : "bg-success"
                            }`}
                          >
                            {message.status === "unread" ? "Nouveau" : "Lu"}
                          </span>
                        </td>
                        <td>
                          {message.content.length > 80
                            ? message.content.substring(0, 80) + "..."
                            : message.content}
                        </td>
                        <td>
                          {message.attachments && message.attachments.length > 0
                            ? message.attachments.map((attachment, i) => (
                                <div key={i}>
                                  <i
                                    className={`fas ${getFileIcon(
                                      attachment.mimetype
                                    )} me-1`}
                                  ></i>
                                  <a
                                    href="/"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation(); // Empêche la propagation au tr parent
                                      handleDownload(
                                        message._id,
                                        attachment._id
                                      );
                                    }}
                                  >
                                    {attachment.filename}
                                  </a>
                                </div>
                              ))
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card.Body>
        </div>
      </div>
    </Layout>
  );
};

// Fonction utilitaire pour obtenir l'icône appropriée selon le type de fichier
const getFileIcon = (mimetype) => {
  if (mimetype.includes("image")) return "fa-file-image";
  if (mimetype.includes("pdf")) return "fa-file-pdf";
  if (mimetype.includes("text")) return "fa-file-alt";
  if (mimetype.includes("word")) return "fa-file-word";
  if (mimetype.includes("excel") || mimetype.includes("spreadsheet"))
    return "fa-file-excel";
  if (mimetype.includes("zip") || mimetype.includes("archive"))
    return "fa-file-archive";
  return "fa-file";
};

export default InfoMessages;
