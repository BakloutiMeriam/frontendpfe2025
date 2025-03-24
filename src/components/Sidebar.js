import { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/sidebar.css";

const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Vérifier si un lien est actif
  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  // Si l'utilisateur n'est pas connecté, ne pas afficher la sidebar
  if (!user) return null;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="/images/logo2.png" alt="Logo" className="sidebar-logo" />
      </div>
      <div className="sidebar-divider"></div>

      <div className="sidebar-user">
        {user.role !== "admin" && (
          <img
            src={user.url_img || "/images/avatar.png"}
            alt="Profile"
            className="rounded-circle me-2"
            style={{ width: "30px", height: "30px" }}
          />
        )}
        <div className="sidebar-user-info">
          <p className="sidebar-user-name">{user.prenom || "Utilisateur"}</p>
          <span className="sidebar-user-role">{user.role}</span>
        </div>
      </div>

      <ul className="sidebar-nav">
        <li className="sidebar-item">
          <Link to="/" className={`sidebar-link ${isActive("/")}`}>
            <i className="fas fa-home sidebar-icon"></i>
            <span>Accueil</span>
          </Link>
        </li>

        {user.role === "admin" && (
          <>
            <li className="sidebar-item">
              <Link
                to="/dashbordAdmin"
                className={`sidebar-link ${isActive("/dashbordAdmin")}`}
              >
                <i className="fas fa-chart-line sidebar-icon"></i>
                <span>Tableau de bord</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link
                to="/users"
                className={`sidebar-link ${isActive("/users")}`}
              >
                <i className="fas fa-users sidebar-icon"></i>
                <span>Utilisateurs</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link
                to="/proprietairelist"
                className={`sidebar-link ${isActive("/proprietairelist")}`}
              >
                <i className="fas fa-user-tie sidebar-icon"></i>
                <span>Propriétaires</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link
                to="/gestProps"
                className={`sidebar-link ${isActive("/gestProps")}`}
              >
                <i className="fas fa-user-check sidebar-icon"></i>
                <span>Approbations</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link
                to="/notifications"
                className={`sidebar-link ${isActive("/notifications")}`}
              >
                <i className="fas fa-bell sidebar-icon"></i>
                <span>Notifications</span>
                {user.notifications > 0 && (
                  <span className="sidebar-badge">{user.notifications}</span>
                )}
              </Link>
            </li>
          </>
        )}

        {user.role === "proprietaire" && (
          <>
            <li className="sidebar-item">
              <Link
                to="/mes-proprietes"
                className={`sidebar-link ${isActive("/mes-proprietes")}`}
              >
                <i className="fas fa-building sidebar-icon"></i>
                <span>Mes propriétés</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link
                to="/ajouter-propriete"
                className={`sidebar-link ${isActive("/ajouter-propriete")}`}
              >
                <i className="fas fa-plus-circle sidebar-icon"></i>
                <span>Ajouter propriété</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link
                to="/mes-reservations"
                className={`sidebar-link ${isActive("/mes-reservations")}`}
              >
                <i className="fas fa-calendar-check sidebar-icon"></i>
                <span>Réservations</span>
              </Link>
            </li>
          </>
        )}

        {user.role === "client" && (
          <>
            <li className="sidebar-item">
              <Link
                to="/favoris"
                className={`sidebar-link ${isActive("/favoris")}`}
              >
                <i className="fas fa-heart sidebar-icon"></i>
                <span>Favoris</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link
                to="/mes-reservations"
                className={`sidebar-link ${isActive("/mes-reservations")}`}
              >
                <i className="fas fa-calendar-alt sidebar-icon"></i>
                <span>Mes réservations</span>
              </Link>
            </li>
            <li className="sidebar-item">
              <Link
                to="/historique"
                className={`sidebar-link ${isActive("/historique")}`}
              >
                <i className="fas fa-history sidebar-icon"></i>
                <span>Historique</span>
              </Link>
            </li>
          </>
        )}

        <div className="sidebar-divider"></div>

        <li className="sidebar-item">
          <Link
            to={user.role === "admin" ? "/profileAdmin" : "/profile"}
            className={`sidebar-link ${
              isActive("/profile") || isActive("/profileAdmin") ? "active" : ""
            }`}
          >
            <i className="fas fa-user-circle sidebar-icon"></i>
            <span>Mon profile</span>
          </Link>
        </li>
        <li className="sidebar-item">
          <Link to="/Nous" className={`sidebar-link ${isActive("/Nous")}`}>
            <i className="fas fa-info-circle sidebar-icon"></i>
            <span>Qui sommes-nous</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
