import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/navbar.css";

const NavbarHome = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [navbarCollapsed, setNavbarCollapsed] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 100);
    } catch (error) {
      console.error("Erreur déconnexion:", error);
      navigate("/login", { replace: true });
    }
  };

  const toggleNavbar = () => {
    setNavbarCollapsed(!navbarCollapsed);
  };

  // Fonction pour gérer le clic sur "Ajouter mon logement"
  const handleAddProperty = () => {
    if (user) {
      if (user.role === "proprietaire") {
        navigate("/AddLogement");
      } else {
        // Si l'utilisateur est connecté mais n'est pas propriétaire
        navigate("/devenir-proprietaire");
      }
    } else {
      // Si l'utilisateur n'est pas connecté
      navigate("/devenir-Connecter");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom shadow-sm">
      <div className="container-fluid navbar-container-custom">
        <Link className="navbar-brand" to="/">
          <img
            src="/images/logo2.png"
            alt="Logo Stayzy"
            style={{ height: "36px" }}
          />
        </Link>

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
            {/* Lien vers Aide et Qui sommes-nous */}
            <li className="nav-item">
              <Link className="nav-link" to="/Nous">
                Qui sommes-nous
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/aide">
                Aide
              </Link>
            </li>

            {/* Bouton "Ajouter mon logement" */}
            <li className="nav-item">
              <button
                className="nav-link host-button"
                onClick={handleAddProperty}
              >
                Mettre mon logement sur Stayzy
              </button>
            </li>

            {/* Profil ou login/register */}
            {user ? (
              <li className="nav-item dropdown ms-3">
                <a
                  className="nav-link dropdown-toggle profile-dropdown-toggle"
                  href="/"
                  id="navbarDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img
                    src={user.url_img || "/images/avatar.png"}
                    alt="Profil"
                    className="rounded-circle me-2"
                  />
                  <span>{user.prenom || "Profil"}</span>
                </a>
                <ul
                  className="dropdown-menu dropdown-menu-end"
                  aria-labelledby="navbarDropdown"
                >
                  <li>
                    <Link
                      className="dropdown-item"
                      to={user.role === "admin" ? "/profileAdmin" : "/profile"}
                    >
                      Mon Profil
                    </Link>
                  </li>

                  <li>
                    <hr className="dropdown-divider" />
                  </li>
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Déconnexion
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Se connecter
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    S'inscrire
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

export default NavbarHome;
