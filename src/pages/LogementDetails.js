import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { logementService } from "../services/LogementService";
import Layout from "../components/Layout";

const LogementDetails = () => {
  const [logement, setLogement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  // Fonction de rendu sécurisé
  const renderSafely = (value, fallback = "") => {
    if (value === undefined || value === null) return fallback;
    if (typeof value === "object") {
      try {
        // Pour les tableaux, convertir en chaîne
        if (Array.isArray(value)) {
          return value
            .map((item) =>
              typeof item === "object" ? JSON.stringify(item) : item
            )
            .join(", ");
        }
        // Pour les objets, convertir en chaîne
        return JSON.stringify(value);
      } catch (err) {
        console.error("Erreur de rendu:", value);
        return fallback;
      }
    }
    return value.toString();
  };

  useEffect(() => {
    const fetchLogementDetails = async () => {
      try {
        const data = await logementService.getLogementById(id);

        // Log de débogage
        console.log("Données du logement :", data);

        // Validation minimale des données
        if (!data || typeof data !== "object") {
          throw new Error("Données de logement invalides");
        }

        setLogement(data);
        setLoading(false);
      } catch (err) {
        console.error("Erreur de chargement :", err);
        setError(
          `Impossible de charger les détails du logement : ${err.message}`
        );
        setLoading(false);
      }
    };

    fetchLogementDetails();
  }, [id]);

  if (loading) return <div>Chargement des détails du logement...</div>;
  if (error) return <div>{error}</div>;
  if (!logement) return <div>Logement non trouvé</div>;

  return (
    <Layout>
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: "20px",
            padding: "10px 15px",
            border: "1px solid #ccc",
            borderRadius: "5px",
          }}
        >
          Retour
        </button>

        <h1>{renderSafely(logement.titre)}</h1>

        <div style={{ marginTop: "20px" }}>
          <p>
            <strong>Description:</strong> {renderSafely(logement.description)}
          </p>
          <p>
            <strong>Prix:</strong> {renderSafely(logement.prix, "0")} €
          </p>
          <p>
            <strong>Superficie:</strong>{" "}
            {renderSafely(logement.superficie, "0")} m²
          </p>
          <p>
            <strong>Nombre de chambres:</strong>{" "}
            {renderSafely(logement.nombreChambres, "0")}
          </p>
          <p>
            <strong>Nombre de salles de bain:</strong>{" "}
            {renderSafely(logement.nombreSallesDeBain, "0")}
          </p>
          <p>
            <strong>Catégorie:</strong> {renderSafely(logement.categorie)}
          </p>
          <p>
            <strong>Disponibilité:</strong>{" "}
            {logement.disponible ? "Disponible" : "Non disponible"}
          </p>

          {logement.adresse && (
            <div style={{ marginTop: "15px" }}>
              <strong>Adresse:</strong>
              <p>
                {renderSafely(logement.adresse.rue)}
                <br />
                {renderSafely(logement.adresse.codePostal)}{" "}
                {renderSafely(logement.adresse.ville)}
                <br />
                {renderSafely(logement.adresse.pays)}
              </p>
            </div>
          )}

          {logement.amenites && logement.amenites.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              <strong>Aménités:</strong>
              <ul>
                {logement.amenites.map((amenite, index) => (
                  <li key={index}>{renderSafely(amenite)}</li>
                ))}
              </ul>
            </div>
          )}

          {logement.photoprincipale && (
            <div style={{ marginTop: "15px" }}>
              <strong>Photo principale:</strong>
              <img
                src={renderSafely(logement.photoprincipale)}
                alt="Photo principale du logement"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "8px",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LogementDetails;
