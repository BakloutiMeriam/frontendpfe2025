import React, { useState, useEffect } from "react";
import "../styles/AdminDashboard.css";
import ActivityChart from "../components//dashboard/ActivityChart"; // Créez ce fichier dans votre dossier components
import CategoriesPieChart from "../components/dashboard/CategoriesPieChart";
import RevenueByCategoryChart from "../components/dashboard/RevenueByCategoryChart";
import ReservationStatusChart from "../components/dashboard/ReservationStatusChart";
import RecentUsersTable from "../components/dashboard/RecentUsersTable";
import {
  FiUsers,
  FiHome,
  FiCalendar,
  FiCreditCard,
  FiMessageSquare,
  FiAlertCircle,
  FiCheckCircle,
  FiPieChart,
  FiBarChart2,
  FiActivity,
  FiTrendingUp,
  FiDollarSign,
  FiUserPlus,
} from "react-icons/fi";
import Layout from "../components/Layout";
import Footer from "../components/Footer";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Récupérer les statistiques générales
        const statsResponse = await fetch("/api/adminDash/dashboard/stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        });

        // Récupérer les données analytiques
        const analyticsResponse = await fetch(
          `/api/adminDash/dashboard/analytics?period=${period}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );
        // Récupérer les utilisateurs récents
        const recentUsersResponse = await fetch(
          "/api/adminDash/users?limit=5&sort=createdAt",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
          }
        );

        if (
          !statsResponse.ok ||
          !analyticsResponse.ok ||
          !recentUsersResponse.ok
        ) {
          throw new Error("Erreur lors de la récupération des données");
        }

        const statsData = await statsResponse.json();
        const analyticsData = await analyticsResponse.json();
        const usersData = await recentUsersResponse.json();

        setStats(statsData);
        setAnalytics(analyticsData);
        setRecentUsers(usersData.users || []);

        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [period]);

  if (loading) {
    return <div className="dashboard-loading">Chargement des données...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <FiAlertCircle />
        <p>Une erreur est survenue: {error}</p>
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Layout>
        <div className="dashboard-header">
          <h1>Tableau de bord administrateur</h1>
          <div className="period-selector">
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="year">Année</option>
            </select>
          </div>
        </div>

        {/* Statistiques générales */}
        <div className="stats-cards">
          <div className="stats-card">
            <div className="stats-icon users">
              <FiUsers />
            </div>
            <div className="stats-info">
              <h3>Utilisateurs</h3>
              <div className="stats-numbers">
                <p className="stats-main-number">{stats?.users?.total || 0}</p>
                <div className="stats-details">
                  <span>Clients: {stats?.users?.clients || 0}</span>
                  <span>Propriétaires: {stats?.users?.proprietaires || 0}</span>
                </div>
              </div>
              <div className="stats-alert">
                <FiAlertCircle />
                <span>
                  {stats?.users?.pendingApproval || 0} en attente d'approbation
                </span>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-icon properties">
              <FiHome />
            </div>
            <div className="stats-info">
              <h3>Logements</h3>
              <div className="stats-numbers">
                <p className="stats-main-number">
                  {stats?.logements?.total || 0}
                </p>
                <div className="stats-details">
                  <span>Disponibles: {stats?.logements?.available || 0}</span>
                </div>
              </div>
              <div className="stats-categories">
                <span>{stats?.categories || 0} catégories</span>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-icon reservations">
              <FiCalendar />
            </div>
            <div className="stats-info">
              <h3>Réservations</h3>
              <div className="stats-numbers">
                <p className="stats-main-number">
                  {stats?.reservations?.total || 0}
                </p>
                <div className="stats-details">
                  <span>En attente: {stats?.reservations?.pending || 0}</span>
                  <span>Confirmées: {stats?.reservations?.confirmed || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-card">
            <div className="stats-icon payments">
              <FiCreditCard />
            </div>
            <div className="stats-info">
              <h3>Paiements</h3>
              <div className="stats-numbers">
                <p className="stats-main-number">
                  {stats?.payments?.total || 0}
                </p>
                <div className="stats-revenue">
                  <FiTrendingUp />
                  <span>{stats?.payments?.revenue || 0} €</span>
                </div>
              </div>
            </div>
          </div>

          {/*<div className="stats-card">
            <div className="stats-icon conversion">
              <FiPercent />
            </div>
            <div className="stats-info">
              <h3>Taux de conversion</h3>
              <div className="stats-numbers">
                <p className="stats-main-number">{conversionRate}%</p>
                <div className="stats-details">
                  <span>Confirmées: {stats?.reservations?.confirmed || 0}</span>
                  <span>Total: {stats?.reservations?.total || 0}</span>
                </div>
              </div>
            </div>
          </div>*/}
        </div>

        {/* Graphiques et statistiques */}
        <div className="analytics-section">
          <div className="analytics-row">
            <div className="analytics-card full-width">
              <div className="analytics-header">
                <h3>
                  <FiActivity /> Activité récente
                </h3>
              </div>
              <div className="analytics-content">
                <ActivityChart analytics={analytics} period={period} />
              </div>
            </div>
          </div>
          <div className="analytics-row">
            <div className="analytics-card half-width">
              <div className="analytics-header">
                <h3>
                  <FiDollarSign /> Revenus par catégorie
                </h3>
              </div>
              <div className="analytics-content">
                <RevenueByCategoryChart analyticsData={analytics} />
              </div>
            </div>

            <div className="analytics-card half-width">
              <div className="analytics-header">
                <h3>
                  <FiCalendar /> Statut des réservations
                </h3>
              </div>
              <div className="analytics-content">
                <ReservationStatusChart stats={stats} />
              </div>
            </div>
          </div>

          <div className="analytics-row">
            <div className="analytics-card">
              <div className="analytics-header">
                <h3>
                  <FiBarChart2 /> Top logements
                </h3>
              </div>
              <div className="analytics-content">
                {analytics?.topLogements &&
                analytics.topLogements.length > 0 ? (
                  <div className="top-properties-list">
                    {analytics.topLogements.map((logement, index) => (
                      <div
                        key={logement._id || index}
                        className="top-property-item"
                      >
                        <div className="property-rank">{index + 1}</div>
                        <div className="property-image">
                          <img
                            src={
                              logement.photo &&
                              logement.photo.startsWith("data:")
                                ? logement.photo // Utiliser directement la chaîne base64
                                : `/uploads/${
                                    logement.photo || "default-property.jpg"
                                  }`
                            } // Fallback sur le chemin de fichier
                            alt={logement.titre || "Logement"}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/uploads/default-property.jpg";
                            }}
                          />
                        </div>
                        <div className="property-info">
                          <h4>{logement.titre || "Sans titre"}</h4>
                          <p>{logement.ville || "Emplacement non spécifié"}</p>
                        </div>
                        <div className="property-stats">
                          <div className="stat-item">
                            <FiCalendar />
                            <span>{logement.count || 0} réservations</span>
                          </div>
                          <div className="stat-item">
                            <FiCreditCard />
                            <span>{logement.revenue || 0} €</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">
                    <p>Aucune donnée disponible</p>
                  </div>
                )}
              </div>
            </div>

            <div className="analytics-card">
              <div className="analytics-header">
                <h3>
                  <FiPieChart /> Catégories
                </h3>
              </div>
              <div className="analytics-content">
                <CategoriesPieChart categories={analytics?.categories} />
              </div>
            </div>
          </div>
        </div>

        {/* Tableau des utilisateurs récents */}
        <div className="analytics-row">
          <div className="analytics-card full-width">
            <div className="analytics-header">
              <h3>
                <FiUserPlus /> Utilisateurs récemment inscrits
              </h3>
            </div>
            <div className="analytics-content">
              <RecentUsersTable users={recentUsers} />
            </div>
          </div>
        </div>

        {/* Actions rapides et notifications */}
        <div className="quick-actions-section">
          <div className="notifications-card">
            <h3>Notifications récentes</h3>
            <div className="notifications-list">
              {/* Simuler des notifications récentes */}
              <div className="notification-item">
                <FiCheckCircle className="notification-icon success" />
                <div className="notification-content">
                  <p>Nouveau propriétaire inscrit</p>
                  <span className="notification-time">Il y a 5 minutes</span>
                </div>
              </div>
              <div className="notification-item">
                <FiCalendar className="notification-icon info" />
                <div className="notification-content">
                  <p>Nouvelle réservation #1024</p>
                  <span className="notification-time">Il y a 15 minutes</span>
                </div>
              </div>
              <div className="notification-item">
                <FiMessageSquare className="notification-icon warning" />
                <div className="notification-content">
                  <p>2 nouveaux messages non lus</p>
                  <span className="notification-time">Il y a 30 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </Layout>
    </div>
  );
};

export default AdminDashboard;
