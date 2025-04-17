// pages/HelpPage.js
import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import NewHelpMessage from "../components/NewHelpMessage";
import HelpConversations from "../components/HelpConversations";
import ConversationMessages from "../components/ConversationMessages";
import { getUnreadStats } from "../services/messageService";
import "../styles/messages.css";
import NavbarHome from "../components/NavbarHome";
import Footer from "../components/Footer";

const HelpPage = () => {
  const { user } = useContext(AuthContext);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [unreadStats, setUnreadStats] = useState({ helpUnread: 0 });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Déclencher un rafraîchissement des conversations
  const refreshConversations = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Récupérer les statistiques des messages non lus
  useEffect(() => {
    const fetchUnreadStats = async () => {
      try {
        const stats = await getUnreadStats();
        setUnreadStats(stats);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des statistiques:",
          error
        );
      }
    };

    fetchUnreadStats();
  }, [refreshTrigger]);

  // Gérer la visibilité du sidebar sur mobile
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <>
      <NavbarHome />
      <div className="help-center-container">
        {/* Header avec bannière inspirée d'Airbnb */}
        <div className="help-header-banner">
          <div className="help-header-content">
            <h1 className="help-title">
              <i className="fas fa-life-ring me-2"></i>
              Centre d'aide
            </h1>
            <p className="help-subtitle">
              {user?.role === "admin"
                ? "Accompagnez nos utilisateurs en répondant à leurs questions"
                : "Nous sommes là pour vous aider avec toutes vos questions"}
            </p>
          </div>
        </div>

        <div className="help-content-container container-fluid">
          <div className="help-main-content">
            {/* Bouton pour afficher/masquer la sidebar sur mobile */}
            <button
              className="help-sidebar-toggle d-md-none"
              onClick={toggleSidebar}
            >
              {sidebarVisible ? (
                <>
                  <i className="fas fa-times"></i> Masquer
                </>
              ) : (
                <>
                  <i className="fas fa-list"></i> Conversations
                </>
              )}
            </button>

            <div className="row g-4">
              {/* Colonne de gauche: Liste des conversations */}
              <div
                className={`col-md-4 help-sidebar ${
                  sidebarVisible ? "sidebar-visible" : "sidebar-hidden"
                }`}
              >
                <div className="help-card">
                  <div className="help-card-header">
                    <h5 className="help-section-title">
                      {user?.role === "admin"
                        ? "Demandes d'aide"
                        : "Mes conversations"}
                    </h5>
                    {user?.role !== "admin" && (
                      <button
                        className="help-new-btn"
                        onClick={() => setSelectedConversation(null)}
                      >
                        <i className="fas fa-plus me-1"></i> Nouvelle demande
                      </button>
                    )}
                  </div>
                  <div className="help-card-body p-0">
                    <HelpConversations
                      selectedConversation={selectedConversation}
                      setSelectedConversation={(conv) => {
                        setSelectedConversation(conv);
                        // Fermer la sidebar sur mobile après la sélection
                        if (window.innerWidth < 768) {
                          setSidebarVisible(false);
                        }
                      }}
                      refreshTrigger={refreshTrigger}
                      isAdmin={user?.role === "admin"}
                    />
                  </div>
                </div>
              </div>

              {/* Colonne de droite: Conversation ou formulaire */}
              <div className="col-md-8 help-main">
                <div className="help-card">
                  <div className="help-card-header">
                    <h5 className="help-section-title">
                      {selectedConversation
                        ? selectedConversation.lastMessage.subject
                        : user?.role === "admin"
                        ? "Sélectionnez une conversation"
                        : "Nouvelle demande d'aide"}
                    </h5>
                    {selectedConversation && (
                      <span
                        className={`help-status-badge ${selectedConversation.status}`}
                      >
                        {selectedConversation.status === "unread"
                          ? "Non lu"
                          : selectedConversation.status === "read"
                          ? "En cours"
                          : "Résolu"}
                      </span>
                    )}
                  </div>
                  <div className="help-card-body">
                    {selectedConversation ? (
                      <ConversationMessages
                        conversationId={selectedConversation.conversationId}
                        onSend={refreshConversations}
                        isHelpMessage={true}
                        isAdmin={user?.role === "admin"}
                      />
                    ) : user?.role !== "admin" ? (
                      <NewHelpMessage
                        onMessageSent={() => {
                          refreshConversations();
                        }}
                      />
                    ) : (
                      <div className="help-empty-state">
                        <div className="help-empty-icon">
                          <i className="fas fa-inbox"></i>
                        </div>
                        <h3 className="help-empty-title">
                          Aucune conversation sélectionnée
                        </h3>
                        <p className="help-empty-text">
                          Sélectionnez une conversation dans la liste pour
                          afficher les messages
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default HelpPage;
