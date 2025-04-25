import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ActivityChart = ({ analytics, period }) => {
  // Transformer les données pour le graphique
  const chartData = useMemo(() => {
    // Vérifier si les données sont disponibles
    if (!analytics?.users || !analytics?.reservations) {
      return [];
    }

    // Créer un dictionnaire des dates pour faciliter la fusion
    const dateMap = {};

    // Ajouter les données utilisateurs
    analytics.users.forEach((item) => {
      dateMap[item._id] = {
        date: item._id,
        newUsers: item.count,
        newReservations: 0,
        revenue: 0,
      };
    });

    // Ajouter les données réservations
    analytics.reservations.forEach((item) => {
      if (dateMap[item._id]) {
        dateMap[item._id].newReservations = item.count;
        dateMap[item._id].revenue = item.revenue;
      } else {
        dateMap[item._id] = {
          date: item._id,
          newUsers: 0,
          newReservations: item.count,
          revenue: item.revenue,
        };
      }
    });

    // Convertir en tableau et trier par date
    return Object.values(dateMap).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [analytics]);

  // Formater la date selon la période sélectionnée
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);

    switch (period) {
      case "week":
        return new Intl.DateTimeFormat("fr-FR", {
          weekday: "short",
          day: "numeric",
        }).format(date);
      case "month":
        return new Intl.DateTimeFormat("fr-FR", {
          day: "numeric",
          month: "short",
        }).format(date);
      case "year":
        return new Intl.DateTimeFormat("fr-FR", { month: "short" }).format(
          date
        );
      default:
        return new Intl.DateTimeFormat("fr-FR", {
          day: "numeric",
          month: "short",
        }).format(date);
    }
  };

  // Formater les tooltips
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{formatDate(label)}</p>
          <p className="tooltip-users">
            <span className="dot users"></span>
            Nouveaux utilisateurs: {payload[0].value}
          </p>
          <p className="tooltip-reservations">
            <span className="dot reservations"></span>
            Réservations: {payload[1].value}
          </p>
          <p className="tooltip-revenue">
            Revenu: {payload[1].payload.revenue} €
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="activity-chart">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              padding={{ left: 30, right: 30 }}
            />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="newUsers"
              name="Nouveaux utilisateurs"
              stroke="#4290f5"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="newReservations"
              name="Réservations"
              stroke="#e9546b"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="no-data-message">
          <p>Aucune donnée disponible pour la période sélectionnée</p>
        </div>
      )}
    </div>
  );
};

export default ActivityChart;
