// components/messages/NewHelpMessage.js
import React, { useState } from "react";
import { sendHelpMessage } from "../services/messageService";
import { toast } from "react-toastify";

const NewHelpMessage = ({ onMessageSent }) => {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      await sendHelpMessage({ subject, content, attachments });
      toast.success("Votre message a été envoyé avec succès");

      // Réinitialiser le formulaire
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
    <div className="new-message-form">
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
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
            placeholder="Sujet de votre demande"
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
            placeholder="Décrivez votre problème ou posez votre question..."
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

export default NewHelpMessage;
