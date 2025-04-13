import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import { authApi } from "../services/api";
import { setLoading } from "../store/reducers/authReducer";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const loading = useSelector((state: RootState) => state.auth.loading);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        dispatch(setLoading({ loading: true }));

        // Wait until accessToken is available
        console.log("Access token:", accessToken);
        if (!accessToken) return;

        const res = await dispatch(authApi.endpoints.me.initiate()).unwrap();
        console.log("User data:", res);

        dispatch(setLoading({ loading: false }));
        console.log(isAuthenticated)
        console.log(res.data.role);

        if (isAuthenticated && res?.data && !redirected) {
          setRedirected(true);
          
          if (res.data.role === "ADMIN") {
            navigate("/admin/dashboard");
          } else {
            navigate(`/user/${res.data._id}/dashboard`);
          }
        }
      } catch (err) {
        console.error("User fetch error:", err);
        dispatch(setLoading({ loading: false }));
        navigate("/login");
      }
    };

    if (!redirected && accessToken) {
      fetchUser();
    }
  }, [dispatch, navigate, isAuthenticated, redirected, accessToken]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-lg font-medium">
        {loading ? "Loading..." : "Redirecting..."}
      </p>
    </div>
  );
};

export default Home;
