import React from "react";
import { FiCheck, FiClock, FiX } from "react-icons/fi";

const RecentUsersTable = ({ users }) => {
  // Si aucune donnée n'est disponible ou si ce n'est pas un tableau
  if (!users || !Array.isArray(users) || users.length === 0) {
    return <div className="no-data">Aucun utilisateur récent à afficher</div>;
  }

  // Fonction pour afficher le statut avec une icône
  const renderStatus = (approvalStatus) => {
    switch (approvalStatus) {
      case "approved":
        return (
          <span className="status-approved">
            <FiCheck /> Approuvé
          </span>
        );
      case "pending":
        return (
          <span className="status-pending">
            <FiClock /> En attente
          </span>
        );
      case "rejected":
        return (
          <span className="status-rejected">
            <FiX /> Rejeté
          </span>
        );
      default:
        return <span className="status-unknown">Inconnu</span>;
    }
  };

  // Fonction pour déterminer la source de l'image
  const getImageSrc = (url_img) => {
    if (!url_img) return "/uploads/default-user.jpg";

    // Si c'est une URL externe (commence par http:// ou https://)
    if (url_img.startsWith("http://") || url_img.startsWith("https://")) {
      return url_img;
    }

    // Si c'est un chemin local qui commence déjà par /uploads/
    if (url_img.startsWith("/uploads/")) {
      return url_img;
    }

    // Pour les autres cas, on suppose que c'est un nom de fichier
    return `/uploads/${url_img}`;
  };

  return (
    <div className="recent-users-table">
      <table>
        <thead>
          <tr>
            <th>Utilisateur</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Date d'inscription</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td className="user-cell-user">
                <div className="user-avatar-user">
                  <img
                    src={getImageSrc(user.url_img)}
                    alt={`${user.prenom} ${user.nom}`}
                    className="user-avatar-user"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "../mages/avatar.png";
                    }}
                  />
                </div>
                <span>
                  {user.prenom} {user.nom}
                </span>
              </td>
              <td>{user.email}</td>
              <td className="role-cell">
                <span className={`role-badge ${user.role}`}>
                  {user.role === "proprietaire" ? "Propriétaire" : "Client"}
                </span>
              </td>
              <td>{renderStatus(user.approvalStatus)}</td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecentUsersTable;
