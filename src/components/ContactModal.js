import React, { useState } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import * as messageService from "../services/messageService";

const ContactModal = ({
  show,
  handleClose,
  proprietaire,
  messageType = "info",
}) => {
  const [messageData, setMessageData] = useState({
    subject: "",
    content: "",
    attachments: [],
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMessageData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setMessageData((prev) => ({
      ...prev,
      attachments: Array.from(e.target.files),
    }));
  };

  /*const handleSubmit = async (e) => {
    e.preventDefault();

    if (!messageData.subject.trim() || !messageData.content.trim()) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setSending(true);
      setError(null);

      // Utiliser la nouvelle fonction sendInfoMessage
      await messageService.sendInfoMessage({
        ...messageData,
        recipientId: proprietaire._id,
      });

      setSuccess(true);
      setMessageData({
        subject: "",
        content: "",
        attachments: [],
      });

      // Fermer le modal après 2 secondes
      setTimeout(() => {
        handleClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
      setError(
        "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer."
      );
    } finally {
      setSending(false);
    }
  };*/
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!messageData.subject.trim() || !messageData.content.trim()) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setSending(true);
      setError(null);

      // Choisir la fonction appropriée selon le type de message
      if (messageType === "direct") {
        await messageService.sendDirectMessage({
          ...messageData,
          recipientId: proprietaire._id,
        });
      } else {
        // Par défaut, utiliser sendInfoMessage
        await messageService.sendInfoMessage({
          ...messageData,
          recipientId: proprietaire._id,
        });
      }

      setSuccess(true);
      setMessageData({
        subject: "",
        content: "",
        attachments: [],
      });

      // Fermer le modal après 2 secondes
      setTimeout(() => {
        handleClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
      setError(
        "Une erreur s'est produite lors de l'envoi du message. Veuillez réessayer."
      );
    } finally {
      setSending(false);
    }
  };
  return (
    <Modal show={show} onHide={handleClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          Contacter {proprietaire?.prenom} {proprietaire?.nom}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && (
          <Alert variant="success">Message envoyé avec succès!</Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Sujet</Form.Label>
            <Form.Control
              type="text"
              name="subject"
              value={messageData.subject}
              onChange={handleInputChange}
              placeholder="Entrez le sujet du message"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              name="content"
              value={messageData.content}
              onChange={handleInputChange}
              rows={5}
              placeholder="Rédigez votre message informatif ici..."
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Pièces jointes (optionnel)</Form.Label>
            <Form.Control type="file" onChange={handleFileChange} multiple />
            <Form.Text className="text-muted">
              Vous pouvez joindre plusieurs fichiers (max 3).
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={sending}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={sending}>
          {sending ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Envoi en cours...
            </>
          ) : (
            "Envoyer"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ContactModal;
