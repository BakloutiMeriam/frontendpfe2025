import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/navbar.css";
import NotificationIcon from "./NotificationIcon";
import MessageIcon from "./MessageIcon";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [navbarCollapsed, setNavbarCollapsed] = useState(true);

  // Fonction de déconnexion modifiée
  const handleLogout = async () => {
    try {
      await logout(); // Attendez que la déconnexion soit terminée

      // Force la redirection vers la page de login pour tous les utilisateurs
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 300);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // En cas d'erreur, essayez quand même de rediriger
      navigate("/login", { replace: true });
    }
  };

  // Toggle du menu hamburger
  const toggleNavbar = () => {
    setNavbarCollapsed(!navbarCollapsed);
  };

  // Fonction pour gérer correctement l'URL de l'image de profil
  const getProfileImageSrc = () => {
    if (!user.url_img) {
      return "../images/avatar.png";
    }

    // Si l'URL commence par http(s), c'est une URL complète (réseaux sociaux)
    if (user.url_img.startsWith("http")) {
      return user.url_img;
    }

    // Si l'URL contient déjà /uploads/, on ne duplique pas
    if (user.url_img.includes("/uploads/")) {
      return user.url_img;
    }

    // Sinon, on ajoute le préfixe /uploads/
    return `/uploads/${user.url_img}`;
  };

  // Vérifier si l'utilisateur est un administrateur
  const isAdmin = user && user.role === "admin";

  return (
    <nav
      className={`navbar navbar-expand-lg navbar-custom shadow-sm ${
        user ? "with-sidebar" : ""
      }`}
    >
      <div className="container-fluid navbar-container-custom">
        {/* Logo visible uniquement quand l'utilisateur n'est pas connecté (sinon il est dans la sidebar) */}
        {!user && (
          <Link className="navbar-brand" to="/" onClick={() => navigate("/")}>
            <img
              src="/images/logo2.png"
              alt="Logo"
              style={{ height: "36px" }}
            />
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
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                <MessageIcon />
                <NotificationIcon />

                {/* Profil utilisateur simplifié */}
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle profile-dropdown-toggle"
                    href="/"
                    id="navbarDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {/* Photo de profil affichée pour tous les utilisateurs, y compris les administrateurs */}
                    <img
                      src={getProfileImageSrc()}
                      alt="Profile"
                      className="rounded-circle me-2"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "../images/avatar.png";
                      }}
                    />
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

                      {/* Afficher le lien de messagerie uniquement pour les utilisateurs non-admin */}
                      {!isAdmin && (
                        <Link className="dropdown-item" to={"/messages/direct"}>
                          Messagerie
                        </Link>
                      )}

                      <Link className="dropdown-item" to={"/help"}>
                        Centre d'aide
                      </Link>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                {/* Liens pour les utilisateurs non connectés */}
                <li className="nav-item">
                  <Link className="nav-link" to="/Nous">
                    Qui Sommes-Nous
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="fas fa-sign-in-alt me-1"></i> Se connecter
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
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
