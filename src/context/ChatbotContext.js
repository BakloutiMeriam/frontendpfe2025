import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { chatbotService } from "../services/chatbotService";
import { AuthContext } from "./AuthContext";

const ChatbotContext = createContext();

export const useChatbot = () => useContext(ChatbotContext);

export const ChatbotProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentUserRef = useRef(null);

  const resetState = useCallback(() => {
    setConversations([]);
    setCurrentConversation(null);
    setError(null);
    setLoading(false);
  }, []);

  const fetchUserConversations = useCallback(async (userId) => {
    if (!userId) return;

    currentUserRef.current = userId;

    try {
      setLoading(true);
      setError(null);

      const data = await chatbotService.getConversations(userId);

      if (currentUserRef.current === userId) {
        setConversations(data.conversations || []);
        setLoading(false);
      }
    } catch (err) {
      if (currentUserRef.current === userId) {
        console.error("Erreur lors du chargement des conversations:", err);
        setError(err.message);
        setConversations([]);
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    resetState();

    if (user && user._id) {
      fetchUserConversations(user._id);
    } else {
      currentUserRef.current = null;
    }

    return () => {
      currentUserRef.current = null;
    };
  }, [user, resetState, fetchUserConversations]);

  const startNewConversation = async (initialMessage) => {
    if (!user || !user._id) {
      throw new Error("Utilisateur non connecté");
    }

    try {
      setLoading(true);
      setError(null);

      const result = await chatbotService.createConversation(initialMessage);

      if (currentUserRef.current === user._id) {
        setConversations((prev) => [result.conversation, ...prev]);
        setCurrentConversation(result.conversation);
        setLoading(false);
        return result.conversation;
      }
    } catch (err) {
      if (currentUserRef.current === user._id) {
        setError(err.message);
        setLoading(false);
      }
      throw err;
    }
  };

  const sendMessage = async (conversationId, message) => {
    if (!user || !user._id) {
      throw new Error("Utilisateur non connecté");
    }

    try {
      setLoading(true);
      setError(null);

      const result = await chatbotService.sendMessage(conversationId, message);

      if (currentUserRef.current === user._id) {
        if (currentConversation?._id === conversationId) {
          setCurrentConversation(result.conversation);
        }

        setConversations((prev) =>
          prev.map((conv) =>
            conv._id === conversationId ? result.conversation : conv
          )
        );

        setLoading(false);
        return result.response;
      }
    } catch (err) {
      if (currentUserRef.current === user._id) {
        setError(err.message);
        setLoading(false);
      }
      throw err;
    }
  };

  const loadConversation = async (conversationId) => {
    if (!user || !user._id) {
      throw new Error("Utilisateur non connecté");
    }

    try {
      setLoading(true);
      setError(null);

      const result = await chatbotService.getConversation(conversationId);

      if (currentUserRef.current === user._id) {
        setCurrentConversation(result.conversation);
        setLoading(false);
      }
    } catch (err) {
      if (currentUserRef.current === user._id) {
        setError(err.message);
        setLoading(false);
      }
    }
  };

  const refreshConversations = useCallback(() => {
    if (user && user._id) {
      fetchUserConversations(user._id);
    }
  }, [user, fetchUserConversations]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    conversations,
    currentConversation,
    loading,
    error,
    startNewConversation,
    sendMessage,
    loadConversation,
    refreshConversations,
    clearError,
    resetState,
  };

  return (
    <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>
  );
};
