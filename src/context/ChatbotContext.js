// context/ChatbotContext.js
/*import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { chatbotService } from "../services/chatbotService";
import { AuthContext } from "./AuthContext";

const ChatbotContext = createContext();

export const useChatbot = () => useContext(ChatbotContext);

export const ChatbotProvider = ({ children }) => {
  // Correction ici: utiliser useContext avec AuthContext
  const { user } = useContext(AuthContext);

  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Utilisation de useCallback pour mémoriser la fonction fetchUserConversations
  const fetchUserConversations = useCallback(async () => {
    if (!user || !user._id) return;

    try {
      setLoading(true);
      const data = await chatbotService.getConversations(user._id);
      setConversations(data.conversations);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [user]);

  // Charger les conversations de l'utilisateur
  useEffect(() => {
    if (user && user._id) {
      fetchUserConversations();
    }
  }, [user, fetchUserConversations]);

  const startNewConversation = async (initialMessage) => {
    try {
      setLoading(true);
      const result = await chatbotService.createConversation(initialMessage);
      setConversations((prev) => [result.conversation, ...prev]);
      setCurrentConversation(result.conversation);
      setLoading(false);
      return result.conversation;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const sendMessage = async (conversationId, message) => {
    try {
      setLoading(true);
      const result = await chatbotService.sendMessage(conversationId, message);

      // Mettre à jour la conversation actuelle
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(result.conversation);
      }

      // Mettre à jour la liste des conversations
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId ? result.conversation : conv
        )
      );

      setLoading(false);
      return result.response;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      setLoading(true);
      const result = await chatbotService.getConversation(conversationId);
      setCurrentConversation(result.conversation);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const value = {
    conversations,
    currentConversation,
    loading,
    error,
    startNewConversation,
    sendMessage,
    loadConversation,
    refreshConversations: fetchUserConversations,
  };

  return (
    <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>
  );
};*/
// context/ChatbotContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { chatbotService } from "../services/chatbotService";
import { AuthContext } from "./AuthContext";

const ChatbotContext = createContext();

export const useChatbot = () => useContext(ChatbotContext);

export const ChatbotProvider = ({ children }) => {
  // Correction ici: utiliser useContext avec AuthContext
  const { user } = useContext(AuthContext);

  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Utilisation de useCallback pour mémoriser la fonction fetchUserConversations
  const fetchUserConversations = useCallback(async () => {
    if (!user || !user._id) return;

    try {
      setLoading(true);
      const data = await chatbotService.getConversations(user._id);
      setConversations(data.conversations);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [user]);

  // Réinitialiser l'état lors du changement d'utilisateur
  useEffect(() => {
    // Réinitialiser les états lors du changement d'utilisateur
    setCurrentConversation(null);
    setConversations([]);

    // Charger les conversations du nouvel utilisateur
    if (user && user._id) {
      fetchUserConversations();
    }
  }, [user, fetchUserConversations]);

  const startNewConversation = async (initialMessage) => {
    try {
      setLoading(true);
      const result = await chatbotService.createConversation(initialMessage);
      setConversations((prev) => [result.conversation, ...prev]);
      setCurrentConversation(result.conversation);
      setLoading(false);
      return result.conversation;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const sendMessage = async (conversationId, message) => {
    try {
      setLoading(true);
      const result = await chatbotService.sendMessage(conversationId, message);

      // Mettre à jour la conversation actuelle
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(result.conversation);
      }

      // Mettre à jour la liste des conversations
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === conversationId ? result.conversation : conv
        )
      );

      setLoading(false);
      return result.response;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      setLoading(true);
      const result = await chatbotService.getConversation(conversationId);
      setCurrentConversation(result.conversation);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const value = {
    conversations,
    currentConversation,
    loading,
    error,
    startNewConversation,
    sendMessage,
    loadConversation,
    refreshConversations: fetchUserConversations,
  };

  return (
    <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>
  );
};
