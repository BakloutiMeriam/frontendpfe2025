import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/navbar.css";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  //const [sidebarOpen, setSidebarOpen] = useState(true);
  const [navbarCollapsed, setNavbarCollapsed] = useState(true);
  const notificationsRef = useRef(null);

  // Simuler le chargement des notifications (à remplacer par votre API réelle)
  useEffect(() => {
    if (user && user.role === "admin") {
      // Exemple de données de notification - à remplacer par votre appel API réel
      const fakeNotifications = [];
      setNotifications(fakeNotifications);
    }
  }, [user]);

  // Fermer les notifications quand on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fonction de déconnexion modifiée
  const handleLogout = async () => {
    try {
      await logout(); // Attendez que la déconnexion soit terminée

      // Force la redirection vers la page de login pour tous les utilisateurs
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 100);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // En cas d'erreur, essayez quand même de rediriger
      navigate("/login", { replace: true });
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  /*const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    // Utiliser un événement personnalisé pour communiquer avec le layout parent
    document.dispatchEvent(
      new CustomEvent("toggleSidebar", { detail: !sidebarOpen })
    );
  };*/
  // Toggle du menu hamburger
  const toggleNavbar = () => {
    setNavbarCollapsed(!navbarCollapsed);
  };

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-custom shadow-sm ${
        user ? "with-sidebar" : ""
      }`}
    >
      <div className="container-fluid navbar-container-custom">
        {/* Bouton toggle sidebar (uniquement si l'utilisateur est connecté) */}
        {/*{user && (
          <button className="sidebar-toggle me-2" onClick={toggleSidebar}>
            <i className="fas fa-bars"></i>
          </button>
        )}*/}

        {/* Logo visible uniquement quand l'utilisateur n'est pas connecté (sinon il est dans la sidebar) */}
        {!user && (
          <Link
            className="navbar-brand navbar-brand-custom"
            to="/"
            onClick={() => navigate("/")}
          >
            {" "}
            <img src="/images/logo2.png" alt="Logo" />
          </Link>
        )}

        {/* Bouton hamburger pour les petits écrans */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleNavbar}
          aria-controls="navbarNav"
          aria-expanded={!navbarCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${
            navbarCollapsed ? "" : "show"
          }`}
          id="navbarNav"
        >
          {/* Barre de recherche pour tous les utilisateurs connectés */}
          {/*{user && (
            <div className="search-container me-auto">
              <form className="d-flex" onSubmit={(e) => e.preventDefault()}>
                <input
                  className="form-control me-2"
                  type="search"
                  placeholder="Rechercher..."
                  aria-label="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn btn-outline-primary" type="submit">
                  <i className="fas fa-search"></i>
                </button>
              </form>
            </div>
          )}*/}

          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                {/* Notifications pour admin avec dropdown */}
                {user.role === "admin" && (
                  <li className="nav-item dropdown" ref={notificationsRef}>
                    <a
                      className="nav-link nav-link-custom position-relative"
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleNotifications();
                      }}
                    >
                      <i className="fas fa-bell"></i>
                      {notifications.length > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                          {notifications.length}
                          <span className="visually-hidden">
                            notifications non lues
                          </span>
                        </span>
                      )}
                    </a>
                    {showNotifications && (
                      <div
                        className="dropdown-menu dropdown-menu-end notification-dropdown show"
                        style={{ minWidth: "300px", padding: "10px" }}
                      >
                        <h6 className="dropdown-header">Notifications</h6>
                        {notifications.length > 0 ? (
                          <>
                            {notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className="notification-item p-2 border-bottom"
                              >
                                <div className="d-flex justify-content-between">
                                  <span className="notification-message">
                                    {notification.message}
                                  </span>
                                  <small className="text-muted">
                                    {notification.date}
                                  </small>
                                </div>
                              </div>
                            ))}
                            <div className="text-center mt-2">
                              <Link
                                to="/notifications"
                                className="btn btn-sm btn-primary"
                              >
                                Voir toutes les notifications
                              </Link>
                            </div>
                          </>
                        ) : (
                          <div className="p-3 text-center">
                            <p className="mb-0">Aucune notification</p>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                )}

                {/* Profil utilisateur simplifié */}
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle d-flex align-items-center"
                    href="/"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {user.role !== "admin" && (
                      <img
                        src={user.url_img || "../images/avatar.png"}
                        alt="Profile"
                        className="rounded-circle me-2"
                        style={{ width: "30px", height: "30px" }}
                      />
                    )}
                    <span className="d-none d-md-inline">
                      {user.prenom || "Profil"}
                    </span>
                  </a>
                  <ul
                    className="dropdown-menu dropdown-menu-end"
                    aria-labelledby="navbarDropdown"
                  >
                    <li>
                      <Link
                        className="dropdown-item"
                        to={
                          user.role === "admin" ? "/profileAdmin" : "/profile"
                        }
                      >
                        Mon Profil
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider" />
                    </li>
                    <li>
                      <button className="dropdown-item" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Déconnexion
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                {/* Liens pour les utilisateurs non connectés */}
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom" to="/Nous">
                    Qui Sommes-Nous
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom" to="/login">
                    <i className="fas fa-sign-in-alt me-1"></i> Se connecter
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom" to="/register">
                    <i className="fas fa-user-plus me-1"></i> S'inscrire
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
