// services/messageService.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/messages"; // Ajustez selon votre configuration
// Fonction pour récupérer le token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Fonction pour construire l'en-tête Authorization
export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
// Messages d'aide
export const sendHelpMessage = async (messageData) => {
  // Pour l'envoi de fichiers, nous devons utiliser FormData
  const formData = new FormData();
  formData.append("subject", messageData.subject);
  formData.append("content", messageData.content);

  // Ajout des pièces jointes si présentes
  if (messageData.attachments) {
    messageData.attachments.forEach((file) => {
      formData.append("attachments", file);
    });
  }

  const response = await axios.post(`${API_URL}/help`, formData, {
    headers: {
      ...authHeader(),
    },
    withCredentials: true,
  });
  return response.data;
};

export const getHelpConversations = async () => {
  const response = await axios.get(`${API_URL}/help/conversations`, {
    headers: {
      ...authHeader(),
    },
    withCredentials: true,
  });
  return response.data;
};

export const respondToHelpMessage = async (messageData) => {
  const formData = new FormData();
  formData.append("conversationId", messageData.conversationId);
  formData.append("content", messageData.content);
  if (messageData.subject) formData.append("subject", messageData.subject);
  if (messageData.markAsResolved)
    formData.append("markAsResolved", messageData.markAsResolved);

  // Ajout des pièces jointes si présentes
  if (messageData.attachments) {
    messageData.attachments.forEach((file) => {
      formData.append("attachments", file);
    });
  }

  const response = await axios.post(`${API_URL}/help/respond`, formData, {
    headers: {
      ...authHeader(),
    },
    withCredentials: true,
  });
  return response.data;
};

// Commun
export const getConversationMessages = async (conversationId) => {
  const response = await axios.get(
    `${API_URL}/conversations/${conversationId}`,
    {
      headers: {
        ...authHeader(),
      },
      withCredentials: true,
    }
  );
  return response.data;
};

export const deleteMessage = async (messageId) => {
  const response = await axios.delete(`${API_URL}/messages/${messageId}`, {
    headers: {
      ...authHeader(),
    },
    withCredentials: true,
  });
  return response.data;
};

export const getUnreadStats = async () => {
  const response = await axios.get(`${API_URL}/messages/stats/unread`, {
    headers: {
      ...authHeader(),
    },
    withCredentials: true,
  });
  return response.data;
};
// Nouvelle fonction pour envoyer un message informatif
export const sendInfoMessage = async (messageData) => {
  // Pour l'envoi de fichiers, nous devons utiliser FormData
  const formData = new FormData();
  formData.append("recipientId", messageData.recipientId);
  formData.append("subject", messageData.subject);
  formData.append("content", messageData.content);

  // Ajout des pièces jointes si présentes
  if (messageData.attachments) {
    messageData.attachments.forEach((file) => {
      formData.append("attachments", file);
    });
  }

  const response = await axios.post(`${API_URL}/info`, formData, {
    headers: {
      ...authHeader(),
    },
    withCredentials: true,
  });
  return response.data;
};

// Fonction pour récupérer les messages informatifs pour les propriétaires
export const getInfoMessages = async () => {
  const response = await axios.get(`${API_URL}/info/messages`, {
    headers: {
      ...authHeader(),
    },
    withCredentials: true,
  });
  return response.data;
};
// Marquer un message comme lu
export const markMessageAsRead = async (messageId) => {
  const response = await axios.put(
    `${API_URL}/${messageId}/read`,
    {},
    {
      headers: {
        ...authHeader(),
      },
      withCredentials: true,
    }
  );
  return response.data;
};
export const downloadAttachment = async (messageId, attachmentId) => {
  try {
    const response = await axios.get(
      `${API_URL}/download/${messageId}/${attachmentId}`,
      {
        headers: {
          ...authHeader(),
        },
        responseType: "blob", // Important pour les fichiers binaires
        withCredentials: true,
      }
    );

    // Vérifier que le blob est valide
    if (response.data.size === 0) {
      throw new Error("Le fichier téléchargé est vide");
    }

    // Créer un URL d'objet pour le téléchargement
    const contentType =
      response.headers["content-type"] || "application/octet-stream";
    const blob = new Blob([response.data], { type: contentType });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    // Extraire le nom du fichier depuis les headers
    const contentDisposition = response.headers["content-disposition"];
    let filename = "fichier_téléchargé";

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch && filenameMatch[1]) {
        filename = decodeURIComponent(filenameMatch[1]);
      }
    }

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();

    // Nettoyage
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);

    return true;
  } catch (error) {
    console.error("Erreur lors du téléchargement:", error);
    throw error;
  }
};
