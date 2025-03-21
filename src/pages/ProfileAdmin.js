import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../styles/ProfileAdmin.css";
import Navbar from "../components/Navbar";
const ProfileAdmin = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [adminData, setAdminData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    url_img: "",
    fileUrl: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }

    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "http://localhost:3000/api/admin/profile",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération du profil");
        }

        const data = await response.json();
        setAdminData(data);
        setFormData({
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,

          fileUrl: data.url_img,
        });
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Impossible de charger le profil administrateur");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setFormData({
      nom: adminData.nom,
      prenom: adminData.prenom,
      email: adminData.email,
      url_img: adminData.url_img,
      fileUrl: adminData.url_img,
    });
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "url_img" && files) {
      const fileUrl = URL.createObjectURL(files[0]);
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0],
        fileUrl: fileUrl,
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataToSubmit = new FormData();
    formDataToSubmit.append("nom", formData.nom || adminData.nom);
    formDataToSubmit.append("prenom", formData.prenom || adminData.prenom);
    formDataToSubmit.append("email", formData.email || adminData.email);

    if (formData.url_img instanceof File) {
      formDataToSubmit.append("url_img", formData.url_img);
    }

    try {
      const response = await fetch("http://localhost:3000/api/admin/profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSubmit,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du profil");
      }

      const updatedAdmin = await response.json();
      setAdminData(updatedAdmin);
      setEditMode(false);
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
      console.error("Erreur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !adminData) {
    return (
      <div className="admin-profile-container">
        <div className="admin-profile-content text-center py-5">
          <div className="admin-spinner"></div>
          <p>Chargement du profil administrateur...</p>
        </div>
      </div>
    );
  }

  if (!adminData) return null;

  return (
    <>
      <Navbar />
      <div className="admin-profile-container">
        <div className="admin-profile-header">
          <h1>Bienvenue {formData.nom} a votre espace </h1>
          <span className="admin-badge">Espace Administrateur</span>
        </div>
        <div className="admin-profile-content">
          {editMode ? (
            <form onSubmit={handleSubmit}>
              <div className="admin-info-card">
                <div className="admin-form-group">
                  <label className="admin-form-label">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    className="admin-form-control"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    className="admin-form-control"
                  />
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="admin-form-control"
                  />
                </div>

                <div className="admin-form-group"></div>
              </div>

              <div className="admin-actions">
                <button
                  type="submit"
                  className="admin-btn admin-btn-save"
                  disabled={isLoading}
                >
                  {isLoading && <span className="admin-spinner"></span>}
                  <i className="bi bi-check2-circle me-2"></i> Sauvegarder
                </button>

                <button
                  type="button"
                  className="admin-btn admin-btn-cancel"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <i className="bi bi-x-circle me-2"></i> Annuler
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="admin-info-card">
                <div className="admin-info-row">
                  <div className="admin-info-label">
                    <i className="bi bi-person me-2"></i> Nom
                  </div>
                  <div className="admin-info-value">{adminData.nom}</div>
                </div>

                <div className="admin-info-row">
                  <div className="admin-info-label">
                    <i className="bi bi-person-fill me-2"></i> Prénom
                  </div>
                  <div className="admin-info-value">{adminData.prenom}</div>
                </div>

                <div className="admin-info-row">
                  <div className="admin-info-label">
                    <i className="bi bi-envelope me-2"></i> Email
                  </div>
                  <div className="admin-info-value">{adminData.email}</div>
                </div>
              </div>

              <div className="admin-actions">
                <button
                  className="admin-btn admin-btn-edit"
                  onClick={handleEdit}
                >
                  <i className="bi bi-pencil-fill me-2"></i> Modifier le profil
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileAdmin;
