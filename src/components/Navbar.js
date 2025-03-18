import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/navbar.css";
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom shadow-sm">
      <div className="container navbar-container-custom">
        {/* Logo avec lien vers la page d'accueil */}
        <Link className="navbar-brand navbar-brand-custom" to="/">
          <img src="/images/logo.jpg" alt="Logo" />{" "}
          {/* Remplacez par le chemin de votre logo */}
        </Link>

        {/* Bouton toggler pour les écrans mobiles */}
        <button
          className="navbar-toggler navbar-toggler-custom"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon navbar-toggler-icon-custom"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link nav-link-custom" to="/Nous">
                    Qui Nous
                  </Link>
                </li>
                {user.role === "admin" && (
                  <li className="nav-item">
                    <Link
                      className="nav-link nav-link-custom"
                      to="/profileAdmin"
                    >
                      Profile
                    </Link>
                    <Link className="nav-link nav-link-custom" to="/users">
                      UserList
                    </Link>
                  </li>
                )}
                {user.role === "client" && (
                  <li className="nav-item">
                    <Link className="nav-link nav-link-custom" to="/profile">
                      Profile
                    </Link>
                  </li>
                )}
                {user.role === "proprietaire" && (
                  <li className="nav-item">
                    <Link className="nav-link nav-link-custom" to="/profile">
                      Profile
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <button
                    className="btn btn-logout-custom ms-2"
                    onClick={handleLogout}
                  >
                    Déconnexion
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link nav-link-custom" to="/login">
                  Se connecter
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
