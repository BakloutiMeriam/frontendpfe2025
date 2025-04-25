import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Home,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  Disc,
} from "lucide-react";
import "../styles/propDashboard.css";
import Layout from "../components/Layout";
import Footer from "../components/Footer";

const OwnerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [reservationsStats, setReservationsStats] = useState(null);
  const [revenueStats, setRevenueStats] = useState(null);
  const [advancedStats, setAdvancedStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Requêtes parallèles pour optimiser le chargement
        const [statsRes, reservationsRes, revenueRes, advancedRes] =
          await Promise.all([
            axios.get("/api/propDash/stats", { headers }),
            axios.get("/api/propDash/reservations", { headers }),
            axios.get("/api/propDash/revenue", { headers }),
            axios.get("/api/propDash/advanced-stats", { headers }),
          ]);
        console.log("Données statistiques reçues:", statsRes.data.data);

        setStats(statsRes.data.data);
        setReservationsStats(reservationsRes.data.data);
        setRevenueStats(revenueRes.data.data);
        setAdvancedStats(advancedRes.data.data);
      } catch (err) {
        setError("Erreur lors du chargement des données: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (num) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Format des dates pour l'affichage
  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("fr-FR", options);
  };

  // Helper function to safely get client name
  const getClientName = (reservation) => {
    if (!reservation.client) {
      return "Client inconnu";
    }
    return (
      `${reservation.client.prenom || ""} ${
        reservation.client.nom || ""
      }`.trim() || "Client sans nom"
    );
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={48} />
        <h2>Une erreur est survenue</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="reload-btn">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="full-page-dashboard">
      <Layout>
        {/* Header */}
        <header className="dashboard-header">
          <h1>Tableau de Bord Propriétaire</h1>
        </header>

        {/* Vue d'ensemble */}
        {stats && (
          <section className="dashboard-section">
            <h2 className="section-title">Vue d'ensemble</h2>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon property-icon">
                  <Home size={24} />
                </div>
                <div className="stat-info">
                  <h3>Logements</h3>
                  <p className="stat-value">{stats.total.logements}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon booking-icon">
                  <Calendar size={24} />
                </div>
                <div className="stat-info">
                  <h3>Réservations</h3>
                  <p className="stat-value">{stats.total.reservations}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon revenue-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-info">
                  <h3>Revenus totaux</h3>
                  <p className="stat-value">
                    {formatCurrency(stats.total.revenus)}
                  </p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon occupancy-icon">
                  <Disc size={24} />
                </div>
                <div className="stat-info">
                  <h3>Taux d'occupation</h3>
                  <p className="stat-value">{stats.total.tauxOccupation}%</p>
                </div>
              </div>
            </div>

            <div className="charts-row"></div>
          </section>
        )}
        {/* Réservations */}
        {reservationsStats && (
          <section className="dashboard-section">
            <h2 className="section-title">Réservations</h2>

            <div className="reservation-stats">
              <div className="chart-container">
                <h3 className="chart-title">Répartition par statut</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reservationsStats.reservationsParStatut}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="_id"
                      label={({ _id, percent }) =>
                        `${_id}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {reservationsStats.reservationsParStatut.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip formatter={(value, name) => [value, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="conversion-card">
                <h3>Taux de conversion</h3>
                <div className="conversion-gauge">
                  <div
                    className="gauge-value"
                    style={{ width: `${reservationsStats.tauxConversion}%` }}
                  ></div>
                </div>
                <p className="conversion-number">
                  {reservationsStats.tauxConversion}%
                </p>
                <p className="conversion-label">
                  des réservations sont confirmées ou terminées
                </p>
              </div>
            </div>

            <div className="recent-reservations">
              <h3>Dernières réservations</h3>
              <div className="reservations-table-container">
                <table className="reservations-table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Logement</th>
                      <th>Date de début</th>
                      <th>Date de fin</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservationsStats.dernieresReservations.map(
                      (reservation) => (
                        <tr key={reservation._id}>
                          <td>{getClientName(reservation)}</td>
                          <td>
                            {reservation.logement
                              ? reservation.logement.titre
                              : "Logement inconnu"}
                          </td>
                          <td>{formatDate(reservation.dateDebut)}</td>
                          <td>{formatDate(reservation.dateFin)}</td>
                          <td>
                            <span
                              className={`reservation-status ${reservation.statut}`}
                            >
                              {reservation.statut}
                            </span>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Mes logements */}
        {stats && (
          <section className="dashboard-section">
            <h2 className="section-title">Mes Logements</h2>

            <div className="properties-grid">
              {stats.logements.map((logement) => (
                <div key={logement.id} className="property-card">
                  <div className="property-header">
                    <h3>{logement.titre}</h3>
                    <span
                      className={`occupancy-badge ${
                        logement.tauxOccupation > 70
                          ? "high"
                          : logement.tauxOccupation > 40
                          ? "medium"
                          : "low"
                      }`}
                    >
                      {logement.tauxOccupation}% occupé
                    </span>
                  </div>

                  <div className="property-stats">
                    <div className="property-stat">
                      <Calendar size={16} />
                      <span>{logement.reservations} réservations</span>
                    </div>
                    <div className="property-stat">
                      <DollarSign size={16} />
                      <span>{formatCurrency(logement.revenus)}</span>
                    </div>
                  </div>

                  <div className="property-chart">
                    <ResponsiveContainer width="100%" height={100}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Occupé", value: logement.tauxOccupation },
                            {
                              name: "Libre",
                              value: 100 - logement.tauxOccupation,
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={25}
                          outerRadius={40}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          <Cell fill="#00C49F" />
                          <Cell fill="#EEEEEE" />
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Revenus */}
        {revenueStats && (
          <section className="dashboard-section">
            <h2 className="section-title">Revenus</h2>

            <div className="revenue-summary">
              <div className="revenue-period-card">
                <h3>Aujourd'hui</h3>
                <p className="revenue-amount">
                  {formatCurrency(revenueStats.revenuJour)}
                </p>
              </div>

              <div className="revenue-period-card">
                <h3>Cette semaine</h3>
                <p className="revenue-amount">
                  {formatCurrency(revenueStats.revenuSemaine)}
                </p>
              </div>

              <div className="revenue-period-card">
                <h3>Ce mois</h3>
                <p className="revenue-amount">
                  {formatCurrency(revenueStats.revenuMois)}
                </p>
              </div>
            </div>

            <div className="revenue-by-property">
              <h3>Revenus par logement</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={revenueStats.revenuParLogement}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="nom" type="category" width={150} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="total" name="Revenu total" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Analyses avancées */}
        {advancedStats && (
          <section className="dashboard-section">
            <h2 className="section-title">Analyses avancées</h2>

            <div className="advanced-stats-grid">
              <div className="advanced-stat-card">
                <div className="stat-icon">
                  <Clock size={24} />
                </div>
                <div className="stat-info">
                  <h3>Durée moyenne de séjour</h3>
                  <p className="stat-value">
                    {advancedStats.dureeMoyenneSejour} jours
                  </p>
                </div>
              </div>

              <div className="advanced-stat-card">
                <div className="stat-icon">
                  <DollarSign size={24} />
                </div>
                <div className="stat-info">
                  <h3>Revenu moyen par réservation</h3>
                  <p className="stat-value">
                    {formatCurrency(advancedStats.revenuMoyenParReservation)}
                  </p>
                </div>
              </div>

              <div className="advanced-stat-card">
                <div className="stat-icon">
                  <AlertCircle size={24} />
                </div>
                <div className="stat-info">
                  <h3>Taux d'annulation</h3>
                  <p className="stat-value">{advancedStats.tauxAnnulation}%</p>
                </div>
              </div>
            </div>

            <div className="seasonality-chart">
              <h3>Saisonnalité des réservations</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={advancedStats.saisonnalite}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nomMois" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value} réservations`, "Nombre"]}
                  />
                  <Legend />
                  <Bar
                    dataKey="reservations"
                    name="Réservations"
                    fill="#0088FE"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}
        <Footer />
      </Layout>
    </div>
  );
};

export default OwnerDashboard;
