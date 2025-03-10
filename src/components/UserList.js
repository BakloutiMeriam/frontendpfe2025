import React, { useState, useEffect } from "react";
import userService from "../services/UserService";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userData, setUserData] = useState({
    nom: "",
    prenom: "",
    email: "",
    tel: "",
    adresse: "",
    role: "",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getUsers();
        setUsers(data);
        setLoading(false);
      } catch (err) {
        setError("Erreur de chargement des utilisateurs");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    // Lorsque l'on clique sur le bouton "Modifier", on met l'utilisateur en mode édition
    setEditingUserId(user._id);
    setUserData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      tel: user.tel,
      adresse: user.adresse,
      role: user.role,
    });
  };

  const handleCancelEdit = () => {
    // Annule l'édition et restaure les données de l'utilisateur
    setEditingUserId(null);
  };

  const handleSaveEdit = async (userId) => {
    // Met à jour l'utilisateur avec les nouvelles données
    try {
      await userService.updateUser(userId, userData);
      // Après la mise à jour, on recharge la liste des utilisateurs
      const updatedUsers = users.map((user) =>
        user._id === userId ? { ...user, ...userData } : user
      );
      setUsers(updatedUsers);
      setEditingUserId(null); // Sort de l'édition après avoir sauvegardé
    } catch (err) {
      setError("Erreur lors de la mise à jour de l'utilisateur");
    }
  };

  const handleDelete = async (userId) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    ) {
      try {
        await userService.deleteUser(userId); // Appel au service pour supprimer l'utilisateur
        // Après la suppression, on recharge la liste des utilisateurs
        const updatedUsers = users.filter((user) => user._id !== userId);
        setUsers(updatedUsers);
      } catch (err) {
        setError("Erreur lors de la suppression de l'utilisateur");
      }
    }
  };

  if (loading) return <div className="text-center mt-4">Chargement...</div>;
  if (error)
    return <div className="alert alert-danger text-center">{error}</div>;

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Liste des utilisateurs</h1>
      <div className="table-responsive">
        <table className="table table-striped table-bordered text-center">
          <thead className="table-dark">
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Adresse</th>
              <th>Rôle</th>
              <th>Actions</th> {/* Nouvelle colonne pour les icônes */}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                {/* Si l'utilisateur est en mode édition */}
                {editingUserId === user._id ? (
                  <>
                    <td>
                      <input
                        type="text"
                        value={userData.nom}
                        onChange={(e) =>
                          setUserData({ ...userData, nom: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={userData.prenom}
                        onChange={(e) =>
                          setUserData({ ...userData, prenom: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        value={userData.email}
                        onChange={(e) =>
                          setUserData({ ...userData, email: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="tel"
                        value={userData.tel}
                        onChange={(e) =>
                          setUserData({ ...userData, tel: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={userData.adresse}
                        onChange={(e) =>
                          setUserData({ ...userData, adresse: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={userData.role}
                        onChange={(e) =>
                          setUserData({ ...userData, role: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-success"
                        onClick={() => handleSaveEdit(user._id)}
                      >
                        <i className="bi bi-check-circle"></i>{" "}
                        {/* Icône de validation */}
                      </button>
                      <button
                        className="btn btn-secondary ml-2"
                        onClick={handleCancelEdit}
                      >
                        <i className="bi bi-x-circle"></i>{" "}
                        {/* Icône d'annulation */}
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{user.nom}</td>
                    <td>{user.prenom}</td>
                    <td>{user.email}</td>
                    <td>{user.tel}</td>
                    <td>{user.adresse}</td>
                    <td>{user.role}</td>
                    <td>
                      {/* Boutons pour éditer et supprimer */}
                      <button
                        className="btn btn-warning"
                        onClick={() => handleEdit(user)}
                        title="Modifier"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-danger ml-2"
                        onClick={() => handleDelete(user._id)}
                        title="Supprimer"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
