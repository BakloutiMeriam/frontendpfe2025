import React, { useState, useEffect, useRef } from "react";
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
    photo: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("table"); // table or card
  const [uploadedFile, setUploadedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [failedImages, setFailedImages] = useState({});

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
    setUploadedFile(null);
    setImagePreview(user.url_img || null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setUploadedFile(null);
    setImagePreview(null);
  };

  const handleSaveEdit = async (userId) => {
    try {
      let updatedUserData = { ...userData };

      if (uploadedFile) {
        const imageUrl = URL.createObjectURL(uploadedFile);
        updatedUserData.url_img = imageUrl;
      }

      await userService.updateUser(userId, updatedUserData);

      const updatedUsers = users.map((user) =>
        user._id === userId ? { ...user, ...updatedUserData } : user
      );

      setUsers(updatedUsers);
      setEditingUserId(null);
      setUploadedFile(null);
      setImagePreview(null);

      if (failedImages[userId]) {
        setFailedImages((prev) => {
          const newFailedImages = { ...prev };
          delete newFailedImages[userId];
          return newFailedImages;
        });
      }
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

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleImageError = (userId) => {
    setFailedImages((prev) => ({
      ...prev,
      [userId]: true,
    }));
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  // Filter logic
  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getDefaultAvatar = (name) => {
    return `https://ui-avatars.com/api/?name=${name}&background=2653a4&color=fff&size=50`;
  };

  const getRoleBadgeClass = (role) => {
    switch (role.toLowerCase()) {
      case "proprietaire":
        return "admin-badge-proprietaire";
      case "client":
        return "admin-badge-client";
      default:
        return "admin-badge-default";
    }
  };

  // Fonction pour obtenir la source d'image appropriée
  const getImageSource = (user) => {
    if (failedImages[user._id] || !user.url_img) {
      return getDefaultAvatar(`${user.nom} ${user.prenom}`);
    }
    return user.url_img;
  };

  if (loading)
    return (
      <div className="admin-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p>Chargement des données...</p>
      </div>
    );

  if (error)
    return <div className="admin-error alert alert-danger">{error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="admin-title">Gestion des Utilisateurs</h1>
        <div className="admin-actions">
          <div className="admin-search">
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm("")}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </div>
          <div className="admin-view-toggle btn-group">
            <button
              className={`btn ${
                viewMode === "table" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setViewMode("table")}
            >
              <i className="bi bi-table"></i>
            </button>
            <button
              className={`btn ${
                viewMode === "card" ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => setViewMode("card")}
            >
              <i className="bi bi-grid-3x3-gap"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="admin-content">
        {viewMode === "table" ? (
          <div className="admin-table-view">
            <div className="table-responsive">
              <table className="user-list-table table">
                <thead>
                  <tr>
                    <th className="admin-th-photo">Photo</th>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Téléphone</th>
                    <th>Adresse</th>
                    <th>Rôle</th>
                    <th className="admin-th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.map((user) => (
                    <tr key={user._id} className="admin-table-row">
                      {editingUserId === user._id ? (
                        <>
                          <td className="admin-user-photo">
                            <div className="admin-photo-edit">
                              <img
                                src={imagePreview || getImageSource(user)}
                                alt={`${userData.nom} ${userData.prenom}`}
                                className="admin-user-avatar"
                                onError={() => handleImageError(user._id)}
                              />
                              <div className="mt-2">
                                <input
                                  type="file"
                                  className="form-control form-control-sm"
                                  accept="image/*"
                                  onChange={handlePhotoChange}
                                  ref={fileInputRef}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={userData.nom}
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  nom: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={userData.prenom}
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  prenom: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="email"
                              className="form-control"
                              value={userData.email}
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  email: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="tel"
                              className="form-control"
                              value={userData.tel}
                              onChange={(e) =>
                                setUserData({
                                  ...userData,
                                  tel: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control"
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
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="role"
                                id="roleProprietaire"
                                value="proprietaire"
                                checked={userData.role === "proprietaire"}
                                onChange={(e) =>
                                  setUserData({
                                    ...userData,
                                    role: e.target.value,
                                  })
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor="roleProprietaire"
                              >
                                Propriétaire
                              </label>
                            </div>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="radio"
                                name="role"
                                id="roleClient"
                                value="client"
                                checked={userData.role === "client"}
                                onChange={(e) =>
                                  setUserData({
                                    ...userData,
                                    role: e.target.value,
                                  })
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor="roleClient"
                              >
                                Client
                              </label>
                            </div>
                          </td>
                          <td className="admin-action-buttons">
                            <button
                              className="btn btn-success admin-btn"
                              onClick={() => handleSaveEdit(user._id)}
                              title="Enregistrer"
                            >
                              <i className="bi bi-check-lg"></i>
                            </button>
                            <button
                              className="btn btn-secondary admin-btn"
                              onClick={handleCancelEdit}
                              title="Annuler"
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="admin-user-photo">
                            <img
                              src={getImageSource(user)}
                              alt={`${user.nom} ${user.prenom}`}
                              className="admin-user-avatar"
                              onError={() => handleImageError(user._id)}
                            />
                          </td>
                          <td>{user.nom}</td>
                          <td>{user.prenom}</td>
                          <td>{user.email}</td>
                          <td>{user.tel}</td>
                          <td>{user.adresse}</td>
                          <td>
                            <span
                              className={`admin-badge ${getRoleBadgeClass(
                                user.role
                              )}`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="admin-action-buttons">
                            <button
                              className="btn btn-warning admin-btn"
                              onClick={() => handleEdit(user)}
                              title="Modifier"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-danger admin-btn"
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
        ) : (
          <div className="admin-card-view">
            <div className="row g-4">
              {currentUsers.map((user) => (
                <div key={user._id} className="col-md-6 col-lg-4">
                  <div className="admin-user-card">
                    {editingUserId === user._id ? (
                      <div className="admin-user-card-edit">
                        <div className="admin-user-card-photo-edit">
                          <img
                            src={imagePreview || getImageSource(user)}
                            alt={`${userData.nom} ${userData.prenom}`}
                            className="admin-user-card-avatar"
                            onError={() => handleImageError(user._id)}
                          />
                          <div className="mt-2">
                            <label className="form-label">
                              Photo de profil
                            </label>
                            <input
                              type="file"
                              className="form-control"
                              accept="image/*"
                              onChange={handlePhotoChange}
                              ref={fileInputRef}
                            />
                          </div>
                        </div>
                        <div className="admin-user-card-form mt-3">
                          <div className="row g-2">
                            <div className="col-6">
                              <label className="form-label">Nom</label>
                              <input
                                type="text"
                                className="form-control"
                                value={userData.nom}
                                onChange={(e) =>
                                  setUserData({
                                    ...userData,
                                    nom: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="col-6">
                              <label className="form-label">Prénom</label>
                              <input
                                type="text"
                                className="form-control"
                                value={userData.prenom}
                                onChange={(e) =>
                                  setUserData({
                                    ...userData,
                                    prenom: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Email</label>
                              <input
                                type="email"
                                className="form-control"
                                value={userData.email}
                                onChange={(e) =>
                                  setUserData({
                                    ...userData,
                                    email: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Téléphone</label>
                              <input
                                type="tel"
                                className="form-control"
                                value={userData.tel}
                                onChange={(e) =>
                                  setUserData({
                                    ...userData,
                                    tel: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Adresse</label>
                              <input
                                type="text"
                                className="form-control"
                                value={userData.adresse}
                                onChange={(e) =>
                                  setUserData({
                                    ...userData,
                                    adresse: e.target.value,
                                  })
                                }
                              />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Rôle</label>
                              <div className="d-flex gap-4">
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="cardRole"
                                    id={`cardRoleProprietaire_${user._id}`}
                                    value="proprietaire"
                                    checked={userData.role === "proprietaire"}
                                    onChange={(e) =>
                                      setUserData({
                                        ...userData,
                                        role: e.target.value,
                                      })
                                    }
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor={`cardRoleProprietaire_${user._id}`}
                                  >
                                    Propriétaire
                                  </label>
                                </div>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    name="cardRole"
                                    id={`cardRoleClient_${user._id}`}
                                    value="client"
                                    checked={userData.role === "client"}
                                    onChange={(e) =>
                                      setUserData({
                                        ...userData,
                                        role: e.target.value,
                                      })
                                    }
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor={`cardRoleClient_${user._id}`}
                                  >
                                    Client
                                  </label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="admin-user-card-actions mt-3">
                          <button
                            className="btn btn-success admin-btn"
                            onClick={() => handleSaveEdit(user._id)}
                          >
                            <i className="bi bi-check-lg"></i> Enregistrer
                          </button>
                          <button
                            className="btn btn-secondary admin-btn"
                            onClick={handleCancelEdit}
                          >
                            <i className="bi bi-x-lg"></i> Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="admin-user-card-header">
                          <img
                            src={getImageSource(user)}
                            alt={`${user.nom} ${user.prenom}`}
                            className="admin-user-card-avatar"
                            onError={() => handleImageError(user._id)}
                          />
                          <h5 className="admin-user-card-name">
                            {user.prenom} {user.nom}
                          </h5>
                          <span
                            className={`admin-badge ${getRoleBadgeClass(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </div>
                        <div className="admin-user-card-body">
                          <div className="admin-user-card-info">
                            <p>
                              <i className="bi bi-envelope"></i> {user.email}
                            </p>
                            <p>
                              <i className="bi bi-telephone"></i> {user.tel}
                            </p>
                            <p>
                              <i className="bi bi-geo-alt"></i> {user.adresse}
                            </p>
                          </div>
                          <div className="admin-user-card-actions">
                            <button
                              className="btn btn-warning admin-btn"
                              onClick={() => handleEdit(user)}
                              title="Modifier"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-danger admin-btn"
                              onClick={() => handleDelete(user._id)}
                              title="Supprimer"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="admin-pagination">
          <nav aria-label="Navigation des pages utilisateurs">
            <ul className="pagination justify-content-center">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => paginate(currentPage - 1)}
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
              </li>
              {Array.from({
                length: Math.ceil(filteredUsers.length / usersPerPage),
              }).map((_, index) => (
                <li
                  key={index}
                  className={`page-item ${
                    currentPage === index + 1 ? "active" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => paginate(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
              <li
                className={`page-item ${
                  currentPage === Math.ceil(filteredUsers.length / usersPerPage)
                    ? "disabled"
                    : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => paginate(currentPage + 1)}
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default UserList;
//hneee
