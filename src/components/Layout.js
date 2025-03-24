import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "../styles/layout.css";

const Layout = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

  // Gestion de la visibilité de la sidebar en fonction de la taille de l'écran
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);

      // Fermer automatiquement la sidebar sur mobile
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
      // Ouvrir automatiquement la sidebar sur desktop
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  // Écouter l'événement toggleSidebar depuis la navbar
  useEffect(() => {
    const handleToggleSidebar = (e) => {
      setSidebarOpen(e.detail);
    };

    document.addEventListener("toggleSidebar", handleToggleSidebar);
    return () => {
      document.removeEventListener("toggleSidebar", handleToggleSidebar);
    };
  }, []);

  // Toggle la sidebar manuellement
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout">
      {user && (
        <div className={`sidebar-container ${sidebarOpen ? "open" : "closed"}`}>
          <Sidebar />
        </div>
      )}

      {/* Overlay pour fermer la sidebar sur mobile */}
      {isMobile && sidebarOpen && user && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      <div
        className={`content-container ${user ? "with-sidebar" : ""} ${
          sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <Navbar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
