import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Pour afficher des notifications de succès ou erreur

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
    fileUrl: "", // Ajout d'une URL temporaire pour l'image
  });

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/"); // Redirection si ce n'est pas un admin
    }

    const fetchProfile = async () => {
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
          url_img: data.url_img,
          fileUrl: data.url_img, // Stocker l'URL de l'image pour l'afficher
        });
      } catch (error) {
        console.error("Erreur:", error);
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
      fileUrl: adminData.url_img, // Réinitialisation de l'URL de l'image
    });
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "url_img" && files) {
      // Créer une URL temporaire pour l'image
      const fileUrl = URL.createObjectURL(files[0]);
      setFormData((prevData) => ({
        ...prevData,
        [name]: files[0], // On garde le fichier pour l'envoyer
        fileUrl: fileUrl, // On garde l'URL temporaire pour l'afficher
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSubmit = new FormData();
    formDataToSubmit.append("nom", formData.nom || adminData.nom);
    formDataToSubmit.append("prenom", formData.prenom || adminData.prenom);
    formDataToSubmit.append("email", formData.email || adminData.email);

    // Ajouter l'image seulement si elle a été modifiée
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
    }
  };

  if (!adminData) return <p>Chargement...</p>;

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Profil Admin</h1>

      <div className="row justify-content-center">
        <div className="col-md-6">
          <table className="table table-bordered table-striped">
            <thead className="table-primary">
              <tr>
                <th>Champ</th>
                <th>Valeur</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Nom</td>
                <td>
                  {editMode ? (
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    adminData.nom
                  )}
                </td>
              </tr>
              <tr>
                <td>Prénom</td>
                <td>
                  {editMode ? (
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    adminData.prenom
                  )}
                </td>
              </tr>
              <tr>
                <td>Email</td>
                <td>
                  {editMode ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  ) : (
                    adminData.email
                  )}
                </td>
              </tr>

              <tr>
                <td>Image</td>
                <td colSpan="2" className="text-center">
                  {editMode ? (
                    <>
                      <input
                        type="file"
                        name="url_img"
                        onChange={handleInputChange}
                        className="form-control"
                      />
                      {formData.fileUrl && (
                        <img
                          src={formData.fileUrl}
                          alt="Prévisualisation"
                          className="img-thumbnail"
                          style={{ width: "120px" }}
                        />
                      )}
                    </>
                  ) : (
                    <img
                      src={adminData.url_img}
                      alt="Profil"
                      className="img-thumbnail"
                      style={{ width: "120px" }}
                    />
                  )}
                </td>
              </tr>

              <tr>
                <td>Action</td>
                <td>
                  {editMode ? (
                    <>
                      <button
                        className="btn btn-success"
                        onClick={handleSubmit}
                      >
                        Sauvegarder
                      </button>
                      <button
                        className="btn btn-secondary ms-2"
                        onClick={handleCancel}
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-warning" onClick={handleEdit}>
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfileAdmin;
