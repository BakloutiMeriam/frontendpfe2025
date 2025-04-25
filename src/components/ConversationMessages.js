// components/messages/ConversationMessages.js
import React, { useState, useEffect, useRef, useContext } from "react";
import {
  getConversationMessages,
  respondToHelpMessage,
  downloadAttachment,
  sendDirectMessage,
} from "../services/messageService";
import { AuthContext } from "../context/AuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "react-toastify";

const ConversationMessages = ({
  conversationId,
  onSend,
  isHelpMessage = false,
  isAdmin = false,
}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [sendingReply, setSendingReply] = useState(false);
  const [markAsResolved, setMarkAsResolved] = useState(false);
  const messageEndRef = useRef(null);
  const { user } = useContext(AuthContext);

  // Charger les messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await getConversationMessages(conversationId);
        setMessages(response.messages || []);
        setError("");
      } catch (err) {
        console.error("Erreur lors du chargement des messages:", err);
        setError("Impossible de charger les messages");
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  // Faire défiler vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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

  // Fonction pour déterminer le destinataire en fonction des messages précédents
  const getRecipientIdFromConversation = (messages) => {
    if (messages.length === 0) return null;

    const lastMessage = messages[messages.length - 1];
    if (isCurrentUserMessage(lastMessage)) {
      // Si vous êtes l'expéditeur du dernier message, trouvez le message précédent
      for (let i = messages.length - 2; i >= 0; i--) {
        if (!isCurrentUserMessage(messages[i])) {
          return messages[i].sender._id;
        }
      }
    } else {
      // Si vous n'êtes pas l'expéditeur, le destinataire est l'expéditeur du dernier message
      return lastMessage.sender._id;
    }

    return null;
  };

  const handleSendReply = async (e) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      toast.error("Veuillez entrer un message");
      return;
    }

    setSendingReply(true);

    try {
      if (isHelpMessage) {
        // Cas des messages d'aide
        if (isAdmin) {
          // Admin répondant à un message d'aide
          await respondToHelpMessage({
            conversationId,
            content: replyContent,
            attachments,
            markAsResolved,
          });
        } else {
          // Utilisateur envoyant un message d'aide
          await respondToHelpMessage({
            conversationId,
            content: replyContent,
            attachments,
          });
        }
      } else {
        // Cas des messages directs entre client et propriétaire
        const recipientId = getRecipientIdFromConversation(messages);

        if (!recipientId) {
          throw new Error("Impossible de déterminer le destinataire");
        }

        await sendDirectMessage({
          recipientId,
          subject:
            messages.length > 0 && messages[0].subject
              ? `RE: ${messages[0].subject}`
              : "Sans objet",
          content: replyContent,
          attachments,
          conversationId, // Si nécessaire pour votre API
        });
      }

      // Réinitialiser le formulaire
      setReplyContent("");
      setAttachments([]);
      setMarkAsResolved(false);

      // Rafraîchir les messages et notifier le parent
      const response = await getConversationMessages(conversationId);
      setMessages(response.messages || []);

      if (onSend) onSend();

      toast.success("Réponse envoyée avec succès");
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse:", error);
      toast.error("Erreur lors de l'envoi de la réponse");
    } finally {
      setSendingReply(false);
    }
  };

  // Fonction pour formater la date
  const formatMessageDate = (dateString) => {
    return format(new Date(dateString), "dd MMMM yyyy à HH:mm", { locale: fr });
  };

  // Fonction pour déterminer si un message est de l'utilisateur courant
  const isCurrentUserMessage = (message) => {
    return message.sender._id === user?._id;
  };

  // Rendu d'une pièce jointe
  const renderAttachment = (attachment, messageId) => {
    const isImage = attachment.mimetype.startsWith("image/");
    const isPdf = attachment.mimetype === "application/pdf";
    const isText = attachment.mimetype === "text/plain";
    const handleDownload = async () => {
      try {
        await downloadAttachment(messageId, attachment._id);
      } catch (error) {
        toast.error("Erreur lors du téléchargement du fichier");
        console.error("Erreur de téléchargement:", error);
      }
    };
    return (
      <div
        className="message-attachment mb-2 p-2 border rounded"
        key={attachment.path}
      >
        <div className="d-flex align-items-center">
          <i
            className={`fas ${
              isImage
                ? "fa-image"
                : isPdf
                ? "fa-file-pdf"
                : isText
                ? "fa-file-alt"
                : "fa-paperclip"
            } me-2 text-primary`}
          ></i>

          <div className="attachment-info">
            <div>{attachment.filename}</div>
            <button
              onClick={handleDownload}
              className="btn btn-sm btn-outline-primary mt-1"
            >
              {isImage ? "Télécharger l'image" : "Télécharger"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div className="conversation-messages">
      {/* Messages */}
      <div
        className="messages-container mb-4"
        style={{ maxHeight: "60vh", overflowY: "auto" }}
      >
        {messages.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="fas fa-comments fa-3x mb-3"></i>
            <p>Aucun message dans cette conversation</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = isCurrentUserMessage(message);
            return (
              <div
                key={message._id}
                className={`message-bubble mb-3 ${isMine ? "text-end" : ""}`}
              >
                <div
                  className={`message-header small ${isMine ? "text-end" : ""}`}
                >
                  <strong>
                    {isMine
                      ? "Vous"
                      : `${message.sender.prenom} ${message.sender.nom}`}
                  </strong>
                  {message.sender.role && (
                    <span className="badge bg-secondary ms-2">
                      {message.sender.role === "admin"
                        ? "Admin"
                        : message.sender.role === "proprietaire"
                        ? "Propriétaire"
                        : "Client"}
                    </span>
                  )}
                  <span className="text-muted ms-2">
                    {formatMessageDate(message.createdAt)}
                  </span>
                </div>

                <div
                  className={`message-content p-3 rounded mb-2 ${
                    isMine ? "bg-primary text-white ms-auto" : "bg-light"
                  }`}
                  style={{ maxWidth: "80%", display: "inline-block" }}
                >
                  {message.content}

                  {/* Pièces jointes */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div
                      className={`message-attachments mt-2 p-2 rounded ${
                        isMine ? "bg-primary-light" : "bg-white"
                      }`}
                    >
                      {message.attachments.map((attachment) =>
                        renderAttachment(attachment, message._id)
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messageEndRef} />
        {/* Élément pour faire défiler vers le bas */}
      </div>

      {/* Formulaire de réponse */}
      <form onSubmit={handleSendReply}>
        <div className="mb-3">
          <label htmlFor="replyContent" className="form-label">
            Votre réponse
          </label>
          <textarea
            className="form-control"
            id="replyContent"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows="3"
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
              <p className="mb-1 small text-muted">Fichiers sélectionnés:</p>
              <ul className="list-group list-group-flush">
                {attachments.map((file, index) => (
                  <li
                    key={index}
                    className="list-group-item py-1 px-2 d-flex justify-content-between align-items-center"
                  >
                    <div className="small">
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
                    <span className="badge bg-primary rounded-pill small">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Option pour marquer comme résolu (admin uniquement) */}
        {isHelpMessage && isAdmin && (
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="markAsResolved"
              checked={markAsResolved}
              onChange={(e) => setMarkAsResolved(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="markAsResolved">
              Marquer cette conversation comme résolue
            </label>
          </div>
        )}

        <div className="text-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={sendingReply}
          >
            {sendingReply ? (
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

export default ConversationMessages;
