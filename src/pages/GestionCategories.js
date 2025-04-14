import React, { useState, useEffect } from "react";
import {
  FaEdit,
  FaTrash,
  FaUpload,
  FaPlus,
  FaExclamationTriangle,
} from "react-icons/fa";
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
  const [validation, setValidation] = useState({
    nom: { valid: true, message: "" },
    description: { valid: true, message: "" },
    icone: { valid: true, message: "" },
  });

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

  const validateForm = () => {
    let isValid = true;
    const newValidation = { ...validation };

    // Validate name
    if (!formData.nom.trim()) {
      newValidation.nom = {
        valid: false,
        message: "Le nom de la catégorie est requis",
      };
      isValid = false;
    } else if (formData.nom.trim().length < 2) {
      newValidation.nom = {
        valid: false,
        message: "Le nom doit contenir au moins 2 caractères",
      };
      isValid = false;
    } else {
      newValidation.nom = { valid: true, message: "" };
    }

    // Validate description (optional but if provided, must be at least 10 chars)
    if (formData.description && formData.description.trim().length < 10) {
      newValidation.description = {
        valid: false,
        message: "La description doit contenir au moins 10 caractères",
      };
      isValid = false;
    } else {
      newValidation.description = { valid: true, message: "" };
    }

    // Validate icon file (if provided)
    if (formData.icone) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/svg+xml",
      ];
      if (!allowedTypes.includes(formData.icone.type)) {
        newValidation.icone = {
          valid: false,
          message: "Format d'image non supporté. Utilisez JPG, PNG, GIF ou SVG",
        };
        isValid = false;
      } else if (formData.icone.size > 2 * 1024 * 1024) {
        // 2MB limit
        newValidation.icone = {
          valid: false,
          message: "La taille de l'image ne doit pas dépasser 2MB",
        };
        isValid = false;
      } else {
        newValidation.icone = { valid: true, message: "" };
      }
    } else {
      newValidation.icone = { valid: true, message: "" };
    }

    setValidation(newValidation);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    // Clear validation error when typing
    if (validation[name] && !validation[name].valid) {
      setValidation((prev) => ({
        ...prev,
        [name]: { valid: true, message: "" },
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevState) => ({
        ...prevState,
        icone: file,
      }));

      // Clear validation error when a new file is selected
      if (validation.icone && !validation.icone.valid) {
        setValidation((prev) => ({
          ...prev,
          icone: { valid: true, message: "" },
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submitData = new FormData();
    submitData.append("nom", formData.nom.trim());
    if (formData.description) {
      submitData.append("description", formData.description.trim());
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
    // Reset validation state
    setValidation({
      nom: { valid: true, message: "" },
      description: { valid: true, message: "" },
      icone: { valid: true, message: "" },
    });
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
    // Reset validation state
    setValidation({
      nom: { valid: true, message: "" },
      description: { valid: true, message: "" },
      icone: { valid: true, message: "" },
    });
    if (document.getElementById("categ-icone")) {
      document.getElementById("categ-icone").value = "";
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
    error && (
      <div className="categ-alert categ-alert-danger">
        <FaExclamationTriangle className="categ-alert-icon" />
        {error}
      </div>
    );

  const renderSuccessMessage = () =>
    success && <div className="categ-alert categ-alert-success">{success}</div>;

  const renderForm = () => (
    <form
      onSubmit={handleSubmit}
      className="categ-form"
      encType="multipart/form-data"
    >
      <div className="categ-form-row row">
        <div className="categ-form-col col-md-6">
          <div className="categ-form-group mb-4">
            <label htmlFor="categ-nom" className="categ-form-label">
              Nom de la catégorie*
            </label>
            <input
              type="text"
              id="categ-nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={`categ-form-control ${
                !validation.nom.valid ? "categ-is-invalid" : ""
              }`}
              placeholder="Entrez le nom de la catégorie"
            />
            {!validation.nom.valid && (
              <div className="categ-invalid-feedback">
                {validation.nom.message}
              </div>
            )}
          </div>
        </div>

        <div className="categ-form-col col-md-6">
          <div className="categ-form-group mb-4">
            <label htmlFor="categ-icone" className="categ-form-label">
              Icône
            </label>
            <div className="categ-file-input-wrapper">
              <input
                type="file"
                id="categ-icone"
                name="icone"
                accept="image/*"
                onChange={handleFileChange}
                className={`categ-form-control-file ${
                  !validation.icone.valid ? "categ-is-invalid" : ""
                }`}
              />
              <label htmlFor="categ-icone" className="categ-file-input-label">
                <FaUpload />{" "}
                {formData.icone ? formData.icone.name : "Choisir un fichier"}
              </label>
            </div>
            {!validation.icone.valid && (
              <div className="categ-invalid-feedback">
                {validation.icone.message}
              </div>
            )}
            <small className="categ-form-text categ-text-muted">
              Formats acceptés: JPG, PNG, GIF, SVG (max 2MB)
            </small>
          </div>
        </div>
      </div>

      <div className="categ-form-group mb-4">
        <label htmlFor="categ-description" className="categ-form-label">
          Description
        </label>
        <textarea
          id="categ-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={`categ-form-control ${
            !validation.description.valid ? "categ-is-invalid" : ""
          }`}
          rows="3"
          placeholder="Description de la catégorie (minimum 10 caractères)"
        />
        {!validation.description.valid && (
          <div className="categ-invalid-feedback">
            {validation.description.message}
          </div>
        )}
      </div>

      <div className="categ-form-buttons">
        <button
          type="submit"
          className="categ-btn categ-btn-primary"
          disabled={loading}
        >
          {loading ? (
            <span>
              <span
                className="categ-spinner-border categ-spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              <span className="ms-2">Traitement...</span>
            </span>
          ) : (
            <span>
              <FaPlus className="me-2" />
              {editMode ? "Mettre à jour" : "Ajouter"}
            </span>
          )}
        </button>

        {editMode && (
          <button
            type="button"
            className="categ-btn categ-btn-secondary"
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
    if (loading && categories.length === 0) {
      return (
        <div className="categ-loading">
          <div className="categ-spinner-border" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p>Chargement des catégories...</p>
        </div>
      );
    }

    if (categories.length === 0) {
      return (
        <div className="categ-empty-message">
          <div className="categ-empty-icon">
            <FaExclamationTriangle />
          </div>
          <p>Aucune catégorie disponible</p>
        </div>
      );
    }

    return (
      <div className="categ-grid row">
        {categories.map((categorie) => (
          <div
            key={categorie._id}
            className="categ-grid-col col-lg-4 col-md-6 mb-4"
          >
            <div className="categ-card">
              <div className="categ-card-header">
                <div className="categ-card-icon">
                  <img
                    src={`/uploads/${categorie.icone}`}
                    alt={categorie.nom}
                    onError={(e) => {
                      e.target.src = "/uploads/default-categorie.png";
                    }}
                  />
                </div>
              </div>
              <div className="categ-card-body">
                <h3 className="categ-card-title">{categorie.nom}</h3>
                <p className="categ-card-description">
                  {categorie.description || "Aucune description"}
                </p>
              </div>
              <div className="categ-card-footer">
                <button
                  className="categ-btn-icon categ-btn-edit"
                  onClick={() => startEdit(categorie)}
                  title="Modifier"
                  disabled={loading}
                >
                  <FaEdit />
                </button>
                <button
                  className="categ-btn-icon categ-btn-delete"
                  onClick={() => handleDelete(categorie._id)}
                  title="Supprimer"
                  disabled={loading}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="categ-container">
        <div className="categ-header">
          <h1 className="categ-title">
            {editMode ? "Modifier une catégorie" : "Gestion des catégories"}
          </h1>
          <p className="categ-subtitle">
            {editMode
              ? "Mettez à jour les informations de la catégorie sélectionnée."
              : "Ajoutez, modifiez ou supprimez des catégories ."}
          </p>
        </div>

        {renderErrorMessage()}
        {renderSuccessMessage()}

        <div className="categ-section categ-form-section">
          <div className="categ-section-header">
            <h2 className="categ-section-title">
              {editMode
                ? "Modifier la catégorie"
                : "Ajouter une nouvelle catégorie"}
            </h2>
          </div>
          {renderForm()}
        </div>

        <div className="categ-section categ-list-section">
          <div className="categ-section-header">
            <h2 className="categ-section-title">Liste des catégories</h2>
          </div>
          {renderCategoriesList()}
        </div>
      </div>
    </Layout>
  );
};

export default GestionCategories;
