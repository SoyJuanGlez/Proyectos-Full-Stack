
import { useState, useEffect } from "react";

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Carga inicial
    const load = () => {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    };

    load();

    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  return {
    user,
    isLoggedIn: !!user,
    isAdmin:    user?.role === "admin",
    isUser:     user?.role === "user",
  };
};