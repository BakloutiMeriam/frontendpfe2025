import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaUpload } from "react-icons/fa";
import "../styles/Categories.css";
import Layout from "../components/Layout";

import {
  getCategoriesService,
  createCategorieService,
  updateCategorieService,
  deleteCategorieService,
} from "../services/categService";

const GestionCategories = () => {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(null);

  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    icone: null,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategoriesService();
      setCategories(data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors du chargement des catégories"
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevState) => ({
      ...prevState,
      icone: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nom.trim()) {
      setError("Le nom de la catégorie est requis");
      return;
    }

    const submitData = new FormData();
    submitData.append("nom", formData.nom);
    if (formData.description) {
      submitData.append("description", formData.description);
    }
    if (formData.icone) {
      submitData.append("icone", formData.icone);
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (editMode) {
        await updateCategorieService(editMode, submitData);
        setSuccess("Catégorie modifiée avec succès");
      } else {
        await createCategorieService(submitData);
        setSuccess("Catégorie ajoutée avec succès");
      }

      resetForm();
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Une erreur est survenue");
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const startEdit = (categorie) => {
    setFormData({
      nom: categorie.nom,
      description: categorie.description || "",
      icone: null,
    });
    setEditMode(categorie._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    resetForm();
  };

  const resetForm = () => {
    setEditMode(null);
    setFormData({
      nom: "",
      description: "",
      icone: null,
    });
    if (document.getElementById("icone")) {
      document.getElementById("icone").value = "";
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")
    ) {
      try {
        setLoading(true);
        await deleteCategorieService(id);
        setSuccess("Catégorie supprimée avec succès");
        fetchCategories();
      } catch (err) {
        setError(
          err.response?.data?.message || "Erreur lors de la suppression"
        );
        console.error(err);
      } finally {
        setLoading(false);
        setTimeout(() => setSuccess(""), 3000);
      }
    }
  };

  const renderErrorMessage = () =>
    error && <div className="alert alert-danger">{error}</div>;

  const renderSuccessMessage = () =>
    success && <div className="alert alert-success">{success}</div>;

  const renderForm = () => (
    <form
      onSubmit={handleSubmit}
      className="categorie-form"
      encType="multipart/form-data"
    >
      <div className="form-group">
        <label htmlFor="nom">Nom de la catégorie*</label>
        <input
          type="text"
          id="nom"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          required
          className="form-control"
          placeholder="Entrez le nom de la catégorie"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="form-control"
          rows="3"
          placeholder="Description optionnelle"
        />
      </div>

      <div className="form-group">
        <label htmlFor="icone">Icône</label>
        <div className="file-input-wrapper">
          <input
            type="file"
            id="icone"
            name="icone"
            accept="image/*"
            onChange={handleFileChange}
            className="form-control-file"
          />
          <label htmlFor="icone" className="file-input-label">
            <FaUpload /> Choisir un fichier
          </label>
        </div>
        <small className="form-text text-muted">
          Téléchargez une image pour l'icône de la catégorie
        </small>
      </div>

      <div className="form-buttons">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Traitement..." : editMode ? "Mettre à jour" : "Ajouter"}
        </button>

        {editMode && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={cancelEdit}
            disabled={loading}
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );

  const renderCategoriesList = () => {
    if (loading) return <div className="loading">Chargement...</div>;

    if (categories.length === 0) {
      return <div className="empty-message">Aucune catégorie disponible</div>;
    }

    return (
      <div className="categories-grid">
        {categories.map((categorie) => (
          <div key={categorie._id} className="categorie-card">
            <div className="categorie-icon">
              <img
                src={`/uploads/${categorie.icone}`}
                alt={categorie.nom}
                onError={(e) => {
                  e.target.src = "/uploads/default-categorie.png";
                }}
              />
            </div>
            <div className="categorie-details">
              <h3>{categorie.nom}</h3>
              <p>{categorie.description || "Aucune description"}</p>
            </div>
            <div className="categorie-actions">
              <button
                className="btn-icon edit"
                onClick={() => startEdit(categorie)}
                title="Modifier"
                disabled={loading}
              >
                <FaEdit />
              </button>
              <button
                className="btn-icon delete"
                onClick={() => handleDelete(categorie._id)}
                title="Supprimer"
                disabled={loading}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="gestion-categories-container">
        <h1>{editMode ? "Modifier une catégorie" : "Ajouter une catégorie"}</h1>

        {renderErrorMessage()}
        {renderSuccessMessage()}

        {renderForm()}

        <div className="categories-list-container">
          <h2>Liste des catégories</h2>
          {renderCategoriesList()}
        </div>
      </div>
    </Layout>
  );
};

export default GestionCategories;
