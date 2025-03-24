import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/ListUsers.css";
import Layout from "../components/Layout";

const ListProprietaire = () => {
  const [proprietaires, setProprietaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProprietaires = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/user/proprietaires");
        setProprietaires(response.data);
        setLoading(false);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des propriétaires:",
          error
        );
        setLoading(false);
      }
    };

    fetchProprietaires();
  }, []);

  const filteredProprietaires = proprietaires.filter(
    (proprietaire) =>
      proprietaire.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proprietaire.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proprietaire.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Layout>
        <div className="container mt-5">
          <div className="user-list-card">
            <h1 className="h3">Liste des Propriétaires</h1>
            <div className="filter-bar">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="text-center mt-4">Chargement des données...</div>
            ) : filteredProprietaires.length === 0 ? (
              <div className="alert alert-info">Aucun propriétaire trouvé</div>
            ) : (
              <div className="table-responsive">
                <table className="user-list-table">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Prénom</th>
                      <th>Email</th>
                      <th>Téléphone</th>
                      <th>Adresse</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProprietaires.map((proprietaire) => (
                      <tr key={proprietaire._id}>
                        <td>{proprietaire.nom}</td>
                        <td>{proprietaire.prenom}</td>
                        <td>{proprietaire.email}</td>
                        <td>{proprietaire.tel}</td>
                        <td>{proprietaire.adresse}</td>
                        <td className="action-buttons">
                          <button className="btn btn-info" title="Détails">
                            <i className="bi bi-info-circle"></i> Détails
                          </button>
                          <button
                            className="btn btn-primary ml-2"
                            title="Contacter"
                          >
                            <i className="bi bi-envelope"></i> Contacter
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ListProprietaire;
