import React from "react";
import { Outlet } from "react-router-dom";
import DashboardLayout from "../../shared/layout/DashboardLayout";



// Composant principal
const Dashboard = () => {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
};

export default Dashboard;