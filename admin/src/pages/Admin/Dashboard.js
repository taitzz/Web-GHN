import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import TopBar from "../../components/TopBar";
import StatusTabs from "../../components/StatusTabs";
import MainContent from "../../components/MainContent";
import "../../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Add state for authentication

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setIsAuthenticated(false); // Set as false if token doesn't exist
      navigate("/"); // Redirect to login page
    } else {
      setIsLoading(false); // Show dashboard if logged in
    }
  }, [navigate]);

  if (isLoading) return null; // Prevent rendering until token check is complete

  return (
    <div className="app">
      <div className="app__container">
        <Sidebar setIsAuthenticated={setIsAuthenticated} /> {/* Pass down setIsAuthenticated */}
        <div className="main">
          <TopBar />
          <StatusTabs />
          <MainContent />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
