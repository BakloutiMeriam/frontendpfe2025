import { Routes, Route } from "react-router-dom";
import React from "react";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPasswordPage";
import ResetPassword from "../pages/ResetPasswordPage";
import Register from "../pages/Register";
import CompleteProfile from "../pages/CompleteProfile";
import UserList from "../pages/UserListPage";
import ViewProfilePage from "../pages/ViewProfilePage";
import ProfileAdmin from "../pages/ProfileAdmin";
import Dashboard from "../pages/DashboardAdmin";
import GestionProps from "../pages/GestionProps";
import ConfirmationPage from "../pages/ConfirmationPage";
import ListProprietaire from "../pages/ListeProprietaire";
import GestionCategories from "../pages/GestionCategories";
import AddLogementForm from "../pages/AddLogementForm";
import MesLogements from "../pages/MesLogements";
import LogementDetails from "../pages/LogementDetails";
import HomePage from "../pages/homepage";
import FavorisPage from "../pages/FavorisPage";
import PublicLogementDetails from "../pages/PublicLogementDetails";
import ReservationForm from "../pages/ReservationForm";
import MesReservations from "../pages/MesResevations";
import ReservationDetail from "../pages/ReservationDetail";
import UpgradeToOwner from "../pages/devenirproprietaire";
import MesReservationsProp from "../pages/reservationPourProp";
import CommandesClient from "../pages/CommandesClient";
import AdminLogementsPage from "../pages/AdminLogementsPage";
import AdminReservationsPage from "../pages/AdminReservationsPage";
import DevenirConnecter from "../pages/devenirconnecter";
import NousPage from "../pages/NousPage";
import NotificationsPage from "../pages/NotificationsPage";
import Layout from "../components/Layout";
import HelpPage from "../pages/HelpPage";
import InfoMessages from "../pages/InfoMessages";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="/completer-profil/:userId" element={<CompleteProfile />} />
      <Route path="/users" element={<UserList />} />
      <Route path="/profile" element={<ViewProfilePage />} />
      <Route path="/profileAdmin" element={<ProfileAdmin />} />
      <Route path="/dashbordAdmin" element={<Dashboard />} />
      <Route path="/proprietairelist" element={<ListProprietaire />} />
      <Route path="/confirmation" element={<ConfirmationPage />} />
      <Route path="/gestProps" element={<GestionProps />} />
      <Route path="/dashboardAdmin" element={<Dashboard />} />
      <Route path="/categories" element={<GestionCategories />} />
      <Route path="/AddLogement" element={<AddLogementForm />} />
      <Route path="/MesLogements" element={<MesLogements />} />
      <Route path="/logement-details/:id" element={<LogementDetails />} />
      <Route path="/FavorisPage" element={<FavorisPage />} />
      <Route
        path="/Public-logement-details/:id"
        element={<PublicLogementDetails />}
      />
      <Route path="/reservationForm/:id" element={<ReservationForm />} />
      <Route path="/MesReservations" element={<MesReservations />} />
      <Route path="/DetailReservation/:id" element={<ReservationDetail />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/devenir-connecter" element={<DevenirConnecter />} />
      <Route path="/devenir-proprietaire" element={<UpgradeToOwner />} />
      <Route path="/mes-reservations" element={<MesReservationsProp />} />
      <Route path="/mes-commandes" element={<CommandesClient />} />
      <Route path="/admin/reservations" element={<AdminReservationsPage />} />
      <Route path="/admin/logements" element={<AdminLogementsPage />} />
      <Route path="*" element={<HomePage />} />
      <Route path="/Nous" element={<NousPage />} />
      <Route
        path="/notifications"
        element={
          <Layout>
            <NotificationsPage />
          </Layout>
        }
      />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/admin/help" element={<HelpPage />} />
      <Route path="/messages/info" element={<InfoMessages />} />
    </Routes>
  );
};

export default AppRoutes;
