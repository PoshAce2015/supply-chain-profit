import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCurrentUser } from "./actions";

export default function Logout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  React.useEffect(() => {
    try {
      dispatch(clearCurrentUser());
      // Clear any demo/local keys if present (safe no-ops if missing)
      localStorage.removeItem("demo:users");
      localStorage.removeItem("users");
      localStorage.removeItem("currentUser");
    } finally {
      navigate("/", { replace: true });
    }
  }, [dispatch, navigate]);

  return null;
}
