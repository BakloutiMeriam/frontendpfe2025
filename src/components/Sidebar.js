import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../styles/sidebar.css";
import { NotificationContext } from "../context/NotificationContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const { unreadCount } = useContext(NotificationContext);

  // État pour suivre les menus déroulants ouverts
  const [openMenus, setOpenMenus] = useState({});

  // État pour suivre les menus déroulants ouverts

  // Vérifier si un lien est actif
  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  // Vérifier si un menu déroulant contient le chemin actuel
  const isMenuActive = (paths) => {
    return paths.some((path) => location.pathname === path);
  };

  // Basculer l'état d'un menu déroulant
  const toggleMenu = (menuId) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  // Si l'utilisateur n'est pas connecté, ne pas afficher la sidebar
  if (!user) return null;

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <Link to="/" onClick={() => navigate("/")}>
          <img src="/images/logo2.png" alt="Logo" className="sidebar-logo" />
        </Link>
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
                to="/adminDash"
                className={`sidebar-link ${isActive("/adminDash")}`}
              >
                <i className="fas fa-chart-line sidebar-icon"></i>
                <span>Tableau de bord</span>
              </Link>
            </li>

            {/* Groupe de gestion des utilisateurs */}
            <li className="sidebar-item dropdown">
              <div
                className={`sidebar-link dropdown-toggle ${
                  isMenuActive(["/users", "/proprietairelist", "/gestProps"])
                    ? "active"
                    : ""
                }`}
                onClick={() => toggleMenu("users")}
              >
                <i className="fas fa-users-cog sidebar-icon"></i>
                <span>Gestion Utilisateurs</span>
                <i className={`${openMenus.users ? "up" : "down"} ms-auto`}></i>
              </div>
              <ul
                className={`sidebar-submenu ${openMenus.users ? "show" : ""}`}
              >
                <li>
                  <Link
                    to="/users"
                    className={`sidebar-sublink ${isActive("/users")}`}
                  >
                    <i className="fas fa-users sidebar-icon"></i>
                    <span>Utilisateurs</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/proprietairelist"
                    className={`sidebar-sublink ${isActive(
                      "/proprietairelist"
                    )}`}
                  >
                    <i className="fas fa-user-tie sidebar-icon"></i>
                    <span>Propriétaires</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/gestProps"
                    className={`sidebar-sublink ${isActive("/gestProps")}`}
                  >
                    <i className="fas fa-user-check sidebar-icon"></i>
                    <span>Approbations</span>
                  </Link>
                </li>
              </ul>
            </li>

            {/* Groupe de gestion des propriétés */}
            <li className="sidebar-item dropdown">
              <div
                className={`sidebar-link dropdown-toggle ${
                  isMenuActive(["/categories", "/logements"]) ? "active" : ""
                }`}
                onClick={() => toggleMenu("properties")}
              >
                <i className="fas fa-building sidebar-icon"></i>
                <span>Gestion Propriétés</span>
                <i className={`${openMenus.properties ? "up" : "down"} `}></i>
              </div>
              <ul
                className={`sidebar-submenu ${
                  openMenus.properties ? "show" : ""
                }`}
              >
                <li>
                  <Link
                    to="/categories"
                    className={`sidebar-sublink ${isActive("/categories")}`}
                  >
                    <i className="fas fa-tags sidebar-icon"></i>
                    <span>Catégories</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/logements"
                    className={`sidebar-sublink ${isActive(
                      "/admin/logements"
                    )}`}
                  >
                    <i className="fas fa-home sidebar-icon"></i>
                    <span>Logements</span>
                  </Link>
                </li>
              </ul>
            </li>
            {/* Groupe de gestion des réservations */}
            <li className="sidebar-item">
              <Link
                to="/admin/reservations"
                className={`sidebar-link ${isActive("/admin/reservations")}`}
              >
                <i className="fas fa-calendar-alt sidebar-icon"></i>
                <span>Réservations</span>
              </Link>
            </li>

            <li className="sidebar-item">
              <Link
                to="/notifications"
                className={`sidebar-link ${isActive("/notifications")}`}
              >
                <i className="fas fa-bell sidebar-icon"></i>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="sidebar-badge">{unreadCount}</span>
                )}
              </Link>
            </li>
          </>
        )}

        {user.role === "proprietaire" && (
          <>
            <li className="sidebar-item dropdown">
              <div
                className={`sidebar-link dropdown-toggle ${
                  isMenuActive(["/MesLogements", "/AddLogement"])
                    ? "active"
                    : ""
                }`}
                onClick={() => toggleMenu("proprietaire")}
              >
                <i className="fas fa-building sidebar-icon"></i>
                <span>Mes Propriétés</span>
                <i
                  className={`${
                    openMenus.proprietaire ? "up" : "down"
                  } ms-auto`}
                ></i>
              </div>
              <ul
                className={`sidebar-submenu ${
                  openMenus.proprietaire ? "show" : ""
                }`}
              >
                <li>
                  <Link
                    to="/MesLogements"
                    className={`sidebar-sublink ${isActive("/MesLogements")}`}
                  >
                    <i className="fas fa-list sidebar-icon"></i>
                    <span>Liste des propriétés</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/AddLogement"
                    className={`sidebar-sublink ${isActive("/AddLogement")}`}
                  >
                    <i className="fas fa-plus-circle sidebar-icon"></i>
                    <span>Ajouter propriété</span>
                  </Link>
                </li>
              </ul>
            </li>
            <li className="sidebar-item">
              <Link
                to="/propDash"
                className={`sidebar-link ${isActive("/propDash")}`}
              >
                <i className="fas fa-home sidebar-icon"></i>
                <span>Dashboard</span>
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
            <li className="sidebar-item dropdown">
              <div
                className={`sidebar-link dropdown-toggle ${
                  isMenuActive([
                    "/FavorisPage",
                    "/MesReservations",
                    "/mes-commandes",
                    "/historique",
                  ])
                    ? "active"
                    : ""
                }`}
                onClick={() => toggleMenu("client")}
              >
                <i className="fas fa-user sidebar-icon"></i>
                <span>Mon Espace</span>
                <i
                  className={`${openMenus.client ? "up" : "down"} ms-auto`}
                ></i>
              </div>
              <ul
                className={`sidebar-submenu ${openMenus.client ? "show" : ""}`}
              >
                <li>
                  <Link
                    to="/FavorisPage"
                    className={`sidebar-sublink ${isActive("/FavorisPage")}`}
                  >
                    <i className="fas fa-heart sidebar-icon"></i>
                    <span>Favoris</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/MesReservations"
                    className={`sidebar-sublink ${isActive(
                      "/MesReservations"
                    )}`}
                  >
                    <i className="fas fa-calendar-alt sidebar-icon"></i>
                    <span>Mes réservations</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/mes-commandes"
                    className={`sidebar-sublink ${isActive("/mes-commandes")}`}
                  >
                    <i className="fas fa-shopping-cart sidebar-icon"></i>
                    <span>Mes commandes</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/historique"
                    className={`sidebar-sublink ${isActive("/historique")}`}
                  >
                    <i className="fas fa-history sidebar-icon"></i>
                    <span>Historique</span>
                  </Link>
                </li>
              </ul>
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
