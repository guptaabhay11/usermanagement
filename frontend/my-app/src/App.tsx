import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import UserDashboard from "./components/UserDashboard";
import AdminDashboard from "./components/AdminDashboard";
import Home from "./components/Home";
import { useDispatch } from 'react-redux';
import { authApi } from "./services/api";
import { AppDispatch } from "./store/store";
import SetPassword from "./components/SetPassword";

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      dispatch(authApi.endpoints.me.initiate());
    }
  }, [dispatch]);
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/login" element={<LoginForm/>}  />
      <Route path="/signup" element={<SignupForm/>} />
      <Route path="/user/dashboard" element={<UserDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/set-password/:token" element={<SetPassword />} />
      </Routes>
  );
}

export default App;
