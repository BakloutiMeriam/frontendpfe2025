import axios from "axios";
const API_URL = "http://localhost:3000/api/commande";

const CommandeService = {
  // Récupérer toutes les commandes de l'utilisateur connecté
  getUserCommandes: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/mes-commandes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error);
      throw error;
    }
  },

  // Récupérer une commande spécifique
  getCommande: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/commandes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de la commande:", error);
      throw error;
    }
  },

  // Mettre à jour le statut d'une commande
  updateCommandeStatus: async (id, statut) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/api/commandes/${id}/status`,
        { statut },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      throw error;
    }
  },

  // Annuler une commande
  annulerCommande: async (id) => {
    return CommandeService.updateCommandeStatus(id, "annulée");
  },

  // Filtrer les commandes par statut
  filterCommandesByStatus: (commandes, status) => {
    if (!status || status === "toutes") return commandes;
    return commandes.filter((commande) => commande.statut === status);
  },
  // Récupérer une commande par son ID
  getCommandeById: async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la commande par ID:",
        error
      );
      throw error;
    }
  },
};

export default CommandeService;
