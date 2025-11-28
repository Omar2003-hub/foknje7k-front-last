
import React from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import Login from "./pages/auth/login/login";
import Register from "./pages/auth/register/register";
import RegisterTeacher from "./pages/auth/register/register-teacher";
import Role from "./pages/auth/role/role";
import ForgetPassword from "./pages/auth/forget-password/forget-password";
import Home from "./pages/home/home";
import Layout from "./shared/layout/layout";
import Landing from "./pages/landig-page";
import Dashboard from "./pages/dashboard/dashboard";
import ReferralCodePage from "./pages/dashboard/ReferralCodePage";
import Advertisement from "./pages/dashboard/advertisement/advertisement";
import Calender from "./pages/dashboard/calender/calender";
import Chat from "./pages/dashboard/chat/chat";
import ManagementProf from "./pages/dashboard/management-prof/management-prof";
import ManagementStudent from "./pages/dashboard/management-student/management-student";
import ManagementCourse from "./pages/dashboard/mangement- course/management-course";
import ManagementFiles from "./pages/dashboard/mangement-files/management-files";
import Offer from "./pages/dashboard/offer/offer";
import Subscription from "./pages/dashboard/subscription/subscription";
import Subject from "./pages/home/subject";
import SubjectDetails from "./pages/home/subject-details";
import Requests from "./pages/dashboard/request/requests";
import Files from "./pages/dashboard/mangement-files/files";
import GlobalLoader from "./shared/loader/loader";
import OfferStudent from "./pages/dashboard/offer/offer-student";
import StudentRequests from "./pages/dashboard/request/student-requests";
import VerificationCode from "./pages/auth/forget-password/verification-code";
import Stats from "./pages/dashboard/stats/stats";
import ProfilePage from "./pages/dashboard/updateprofil/updateprofil";
import ManagementUsers from "./pages/dashboard/management-users/management-users";
import PaymentReturn from "./pages/api/payment/return";
import PaymentCancel from "./pages/api/payment/cancel";
import PaymentWebhook from "./pages/api/payment/webhook";
import ConfirmEmail from "./pages/auth/confirm-email/confirm-email";

// Simple NotFound page
function NotFound() {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: '#e11d48', fontWeight: 600 }}>
      404 - Page non trouvée
    </div>
  );
}

// Simple admin route guard
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const role = useSelector((state: any) => state?.user?.userData?.role?.name);
  if (role !== "ROLE_ADMIN") {
    return <NotFound />;
  }
  return <>{children}</>;
}

function App() {
  return (
    <div className="min-h-screen bg-blue-200">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Home />} />
            <Route path="/subject/:id?" element={<Subject />} />
            <Route path="/subject-Details" element={<SubjectDetails />} />
            <Route path="/home" element={<Home />} />
          </Route>
          
          {/* Dashboard routes without Layout wrapper to avoid header conflicts */}
          <Route path="/dashboard" element={<Dashboard />}>
              <Route path="advertisement" element={<Advertisement />} />
              <Route path="calender" element={<Calender />} />
              <Route path="chat" element={<Chat />} />
              <Route path="management-prof" element={<ManagementProf />} />
              <Route
                path="management-student"
                element={<ManagementStudent />}
              />
              <Route path="offer-teacher" element={<Offer />} />
              <Route path="offer-student" element={<OfferStudent />} />
              <Route path="subscription" element={<Subscription />} />
              <Route path="requests-prof" element={<Requests />} />
              <Route path="requests-student" element={<StudentRequests />} />
              <Route path="files" element={<Files />} />
              <Route path="management-users" element={
                <RequireAdmin>
                  <ManagementUsers />
                </RequireAdmin>
              } />
              <Route path="stats" element={<Stats />} />
              <Route path="updateprofil" element={<ProfilePage />} />
              <Route path="referral-code" element={<ReferralCodePage />} />
            </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register-student" element={<Register />} />
          <Route path="/register" element={<RegisterTeacher />} />
          <Route path="/role" element={<Role />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route
            path="/verification-code/:email"
            element={<VerificationCode />}
          />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          
          {/* Payment Routes */}
            <Route path="/api/payment/return" element={<PaymentReturn />} />
            <Route path="/api/payment/cancel" element={<PaymentCancel />} />
            <Route path="/api/payment/webhook" element={<PaymentWebhook />} />
        </Routes>
        <GlobalLoader />
      </BrowserRouter>
    </div>
  );
}

export default App;
