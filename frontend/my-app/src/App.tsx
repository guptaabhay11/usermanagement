import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Home from "./components/Home";
import SendEmail from "./components/SendInvite";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/login" element={<LoginForm/>}  />
      <Route path="/signup" element={<SignupForm/>} />
      <Route path="/user/:id/dashboard" element={<UserDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/invite" element={<SendEmail/>} />
    </Routes>
  );
}

export default App;
