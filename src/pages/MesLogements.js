import React, { useState, useEffect } from "react";
import { logementService } from "../services/LogementService";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const MesLogements = () => {
  const [logements, setLogements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingLogement, setEditingLogement] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMesLogements = async () => {
      try {
        const data = await logementService.getMesLogements();
        setLogements(data);
        setLoading(false);
      } catch (err) {
        setError("Impossible de charger vos logements");
        setLoading(false);
      }
    };

    fetchMesLogements();
  }, []);

  const handleDeleteLogement = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce logement ?")) {
      try {
        await logementService.deleteLogement(id);
        setLogements(logements.filter((log) => log._id !== id));
      } catch (err) {
        console.error("Erreur lors de la suppression du logement", err);
        alert("Impossible de supprimer le logement");
      }
    }
  };

  const toggleDisponibilite = async (logement) => {
    try {
      const updatedLogement = await logementService.toggleDisponibilite(
        logement._id
      );
      setLogements(
        logements.map((log) =>
          log._id === logement._id
            ? { ...log, disponible: updatedLogement.disponible }
            : log
        )
      );
    } catch (err) {
      console.error("Erreur lors du changement de disponibilité", err);
      alert("Impossible de modifier la disponibilité");
    }
  };

  const handleEditChange = (e, field) => {
    const { value } = e.target;
    setEditingLogement((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const startEditing = (logement) => {
    setEditingLogement({ ...logement });
  };

  const cancelEditing = () => {
    setEditingLogement(null);
  };

  const saveLogement = async () => {
    try {
      // Préparer les données pour la mise à jour
      const dataToUpdate = {
        titre: editingLogement.titre,
        description: editingLogement.description,
        prix: editingLogement.prix,
        superficie: editingLogement.superficie,
        nombreChambres: editingLogement.nombreChambres,
        nombreSallesDeBain: editingLogement.nombreSallesDeBain,
        categorie: editingLogement.categorie,
        disponible: editingLogement.disponible,
        adresse: editingLogement.adresse,
        amenites: editingLogement.amenites,
      };

      const updatedLogement = await logementService.updateLogement(
        editingLogement._id,
        dataToUpdate
      );

      // Mettre à jour la liste des logements
      setLogements(
        logements.map((log) =>
          log._id === updatedLogement._id ? updatedLogement : log
        )
      );

      // Sortir du mode édition
      setEditingLogement(null);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du logement", err);
      alert("Impossible de mettre à jour le logement");
    }
  };

  // New function to handle navigating to logement details
  const handleViewDetails = (id) => {
    navigate(`/logement-details/${id}`);
  };

  if (loading) return <div>Chargement de vos logements...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Layout>
      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>
            Mes Logements
          </h1>
          <Link to="/ajouter-logement">
            <button
              style={{
                padding: "10px 15px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            >
              + Ajouter un logement
            </button>
          </Link>
        </div>

        {logements.length === 0 ? (
          <div style={{ textAlign: "center", color: "#888" }}>
            Vous n'avez pas encore de logements. Commencez par en ajouter un !
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {logements.map((logement) => (
              <div
                key={logement._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "15px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              >
                {editingLogement && editingLogement._id === logement._id ? (
                  // Formulaire de modification
                  <div>
                    <input
                      type="text"
                      value={editingLogement.titre}
                      onChange={(e) => handleEditChange(e, "titre")}
                      style={{ width: "100%", marginBottom: "10px" }}
                    />
                    <textarea
                      value={editingLogement.description}
                      onChange={(e) => handleEditChange(e, "description")}
                      style={{ width: "100%", marginBottom: "10px" }}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <input
                        type="number"
                        value={editingLogement.prix}
                        onChange={(e) => handleEditChange(e, "prix")}
                        placeholder="Prix"
                        style={{ flex: 1 }}
                      />
                      <input
                        type="number"
                        value={editingLogement.superficie}
                        onChange={(e) => handleEditChange(e, "superficie")}
                        placeholder="Superficie"
                        style={{ flex: 1 }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <button
                        onClick={saveLogement}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "green",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                        }}
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={cancelEditing}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "red",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  // Vue normale du logement
                  <>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <h2 style={{ fontWeight: "bold" }}>{logement.titre}</h2>
                      <span
                        style={{
                          padding: "5px 10px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          backgroundColor: logement.disponible
                            ? "#e6f3e6"
                            : "#f3e6e6",
                          color: logement.disponible ? "green" : "red",
                        }}
                      >
                        {logement.disponible ? "Disponible" : "Non disponible"}
                      </span>
                    </div>
                    <p style={{ marginBottom: "10px" }}>
                      {logement.description}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <p>Prix: {logement.prix} €</p>
                        <p>Superficie: {logement.superficie} m²</p>
                      </div>
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => toggleDisponibilite(logement)}
                          style={{
                            padding: "5px 10px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        >
                          {logement.disponible ? "Indisponible" : "Disponible"}
                        </button>
                        <button
                          onClick={() => startEditing(logement)}
                          style={{
                            padding: "5px 10px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                          }}
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteLogement(logement._id)}
                          style={{
                            padding: "5px 10px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            backgroundColor: "#ffdddd",
                          }}
                        >
                          Supprimer
                        </button>
                        <button
                          onClick={() => handleViewDetails(logement._id)}
                          style={{
                            padding: "5px 10px",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            backgroundColor: "#e6f3ff",
                          }}
                        >
                          Détails
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MesLogements;
