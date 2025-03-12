import React, { useState, useEffect } from "react";
import userService from "../services/UserService";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/ListUsers.css";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

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
    setEditingUserId(null);
  };

  const handleSaveEdit = async (userId) => {
    try {
      await userService.updateUser(userId, userData);

      const updatedUsers = users.map((user) =>
        user._id === userId ? { ...user, ...userData } : user
      );
      setUsers(updatedUsers);
      setEditingUserId(null);
    } catch (err) {
      setError("Erreur lors de la mise à jour de l'utilisateur");
    }
  };

  const handleDelete = async (userId) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    ) {
      try {
        await userService.deleteUser(userId);
        const updatedUsers = users.filter((user) => user._id !== userId);
        setUsers(updatedUsers);
      } catch (err) {
        setError("Erreur lors de la suppression de l'utilisateur");
      }
    }
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Filter logic
  const filteredUsers = currentUsers.filter((user) =>
    Object.values(user).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) return <div className="text-center mt-4">Chargement...</div>;
  if (error)
    return <div className="alert alert-danger text-center">{error}</div>;

  return (
    <div className="container mt-5">
      <div className="user-list-card">
        <h1 className="h3">Liste des utilisateurs</h1>
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={() => setSearchTerm("")}>Effacer</button>
        </div>
        <div className="table-responsive">
          <table className="user-list-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Adresse</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
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
                            setUserData({
                              ...userData,
                              adresse: e.target.value,
                            })
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
                          <i className="bi bi-check-circle"></i>
                        </button>
                        <button
                          className="btn btn-secondary ml-2"
                          onClick={handleCancelEdit}
                        >
                          <i className="bi bi-x-circle"></i>
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
                      <td className="action-buttons">
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
        <div className="pagination">
          {Array.from({ length: Math.ceil(users.length / usersPerPage) }).map(
            (_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`page-item ${
                  currentPage === index + 1 ? "active" : ""
                }`}
              >
                {index + 1}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
