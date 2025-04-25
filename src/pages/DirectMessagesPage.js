import React, { useState, useEffect } from "react";
import DirectMessageConversations from "../components/messages/DirectMessageConversations";
import ConversationMessages from "../components/ConversationMessages";
import NewDirectMessage from "../components/messages/NewDirectMessage";
import { getUnreadStats } from "../services/messageService";
import "../styles/messages.css"; // Utiliser le même fichier CSS que la page d'aide
import NavbarHome from "../components/NavbarHome";
import Footer from "../components/Footer";

const DirectMessagesPage = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [activeTab, setActiveTab] = useState("inbox");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [unreadStats, setUnreadStats] = useState({ directMessages: 0 });
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Charger les statistiques de messages non lus
  useEffect(() => {
    const fetchUnreadStats = async () => {
      try {
        const stats = await getUnreadStats();
        setUnreadStats(stats);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      }
    };

    fetchUnreadStats();
  }, [refreshTrigger]);

  // Fonction pour rafraîchir les données
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Fonction appelée après l'envoi d'un nouveau message
  const handleMessageSent = () => {
    setActiveTab("inbox");
    handleRefresh();
  };

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
              <i className="fas fa-envelope me-2"></i>
              Messagerie stayzy
            </h1>
            <p className="help-subtitle">
              Communiquez directement avec d'autres utilisateurs de la
              plateforme
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
                      {activeTab === "inbox"
                        ? "Boîte de réception"
                        : "Nouveau Message"}
                    </h5>
                    <div>
                      {activeTab === "inbox" ? (
                        <button
                          className="help-new-btn"
                          onClick={() => setActiveTab("new")}
                        >
                          <i className="fas fa-plus me-1"></i> Nouveau Message
                        </button>
                      ) : (
                        <button
                          className="help-new-btn"
                          onClick={() => setActiveTab("inbox")}
                        >
                          <i className="fas fa-inbox me-1"></i> Boîte de
                          réception
                          {unreadStats.directMessages > 0 && (
                            <span className="conversation-badge ms-2">
                              {unreadStats.directMessages}
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="help-card-body p-0">
                    {activeTab === "inbox" && (
                      <div className="help-conversations">
                        <DirectMessageConversations
                          selectedConversation={selectedConversation}
                          setSelectedConversation={(conv) => {
                            setSelectedConversation(conv);
                            // Fermer la sidebar sur mobile après la sélection
                            if (window.innerWidth < 768) {
                              setSidebarVisible(false);
                            }
                          }}
                          refreshTrigger={refreshTrigger}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Colonne de droite: Conversation ou formulaire */}
              <div className="col-md-8 help-main">
                <div className="help-card">
                  <div className="help-card-header">
                    <h5 className="help-section-title">
                      {activeTab === "new"
                        ? "Nouveau Message"
                        : selectedConversation
                        ? `Conversation avec ${selectedConversation.recipient}`
                        : "Sélectionnez une conversation"}
                    </h5>
                    {selectedConversation && (
                      <button className="btn-refresh" onClick={handleRefresh}>
                        <i className="fas fa-sync-alt"></i> Actualiser
                      </button>
                    )}
                  </div>
                  <div className="help-card-body">
                    {activeTab === "inbox" ? (
                      selectedConversation ? (
                        <ConversationMessages
                          conversationId={selectedConversation.conversationId}
                          onSend={handleRefresh}
                        />
                      ) : (
                        <div className="help-empty-state">
                          <div className="help-empty-icon">
                            <i className="fas fa-comments"></i>
                          </div>
                          <h3 className="help-empty-title">
                            Aucune conversation sélectionnée
                          </h3>
                          <p className="help-empty-text">
                            Sélectionnez une conversation dans la liste pour
                            afficher les messages ou créez un nouveau message
                          </p>
                        </div>
                      )
                    ) : (
                      <NewDirectMessage onMessageSent={handleMessageSent} />
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

export default DirectMessagesPage;
