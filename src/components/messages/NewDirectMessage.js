// components/messages/NewDirectMessage.js
import React, { useState, useEffect } from "react";
import { sendDirectMessage } from "../../services/messageService";
import { toast } from "react-toastify";
import axios from "axios";
import { authHeader } from "../../services/messageService";

const NewDirectMessage = ({ onMessageSent }) => {
  const [recipientId, setRecipientId] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [error, setError] = useState("");

  // Charger la liste des destinataires possibles
  useEffect(() => {
    const fetchRecipients = async () => {
      setLoadingRecipients(true);
      try {
        // Ajustez l'URL selon votre API
        const response = await axios.get(
          "http://localhost:3000/api/messages/direct/contacts",
          {
            headers: {
              ...authHeader(),
            },
            withCredentials: true,
          }
        );

        setRecipients(response.data.users || []);
      } catch (err) {
        console.error("Erreur lors du chargement des destinataires:", err);
        toast.error("Impossible de charger la liste des destinataires");
      } finally {
        setLoadingRecipients(false);
      }
    };

    fetchRecipients();
  }, []);

  const handleFileChange = (e) => {
    // Vérifier si l'utilisateur a sélectionné plus de 3 fichiers
    if (e.target.files.length > 3) {
      toast.error("Vous ne pouvez pas télécharger plus de 3 fichiers");
      return;
    }

    // Vérifier la taille de chaque fichier (max 5MB)
    const oversizedFiles = Array.from(e.target.files).filter(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (oversizedFiles.length > 0) {
      toast.error("Certains fichiers dépassent la taille maximale de 5MB");
      return;
    }

    setAttachments(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!recipientId) {
      setError("Veuillez sélectionner un destinataire");
      return;
    }

    if (!subject.trim()) {
      setError("Le sujet est requis");
      return;
    }

    if (!content.trim()) {
      setError("Le message est requis");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await sendDirectMessage({
        recipientId,
        subject,
        content,
        attachments,
      });

      toast.success("Votre message a été envoyé avec succès");

      // Réinitialiser le formulaire
      setRecipientId("");
      setSubject("");
      setContent("");
      setAttachments([]);

      // Notifier le composant parent
      if (onMessageSent) onMessageSent();
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      setError(error.response?.data?.message || "Une erreur est survenue");
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-direct-message-form">
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="recipient" className="form-label">
            Destinataire
          </label>
          <select
            className="form-select"
            id="recipient"
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            disabled={loadingRecipients}
            required
          >
            <option value="">Sélectionner un destinataire</option>
            {recipients.map((user) => (
              <option key={user._id} value={user._id}>
                {user.prenom} {user.nom}{" "}
                {user.role
                  ? `(${
                      user.role === "admin"
                        ? "Admin"
                        : user.role === "proprietaire"
                        ? "Propriétaire"
                        : "Client"
                    })`
                  : ""}
              </option>
            ))}
          </select>
          {loadingRecipients && (
            <div className="text-center mt-2">
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              >
                <span className="visually-hidden">Chargement...</span>
              </div>
              <span className="ms-2 small">
                Chargement des destinataires...
              </span>
            </div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="subject" className="form-label">
            Sujet
          </label>
          <input
            type="text"
            className="form-control"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Sujet de votre message"
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="content" className="form-label">
            Message
          </label>
          <textarea
            className="form-control"
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="6"
            placeholder="Écrivez votre message..."
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label htmlFor="attachments" className="form-label">
            Pièces jointes (facultatif, max 3 fichiers, 5MB chacun)
          </label>
          <input
            type="file"
            className="form-control"
            id="attachments"
            onChange={handleFileChange}
            multiple
            accept=".jpg,.jpeg,.png,.pdf,.txt"
          />

          {attachments.length > 0 && (
            <div className="mt-2">
              <p className="mb-1 text-muted">Fichiers sélectionnés:</p>
              <ul className="list-group">
                {attachments.map((file, index) => (
                  <li
                    key={index}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <i
                        className={`fas ${
                          file.type.includes("image")
                            ? "fa-image"
                            : file.type === "application/pdf"
                            ? "fa-file-pdf"
                            : "fa-file-alt"
                        } me-2`}
                      ></i>
                      {file.name}
                    </div>
                    <span className="badge bg-primary rounded-pill">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="text-end">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Envoi en cours...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane me-2"></i>
                Envoyer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewDirectMessage;
