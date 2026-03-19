import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (res.ok) {
      // Guardamos la sesión
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      alert(`Bienvenido, ${data.user.name}`);
      navigate("/catalog");
    } else {
      // Si el backend lanza error (401 o 400), lo mostramos aquí
      alert(data.message || "Error en los datos");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error crítico de conexión");
  }
};

  return (
    <div className="auth-page">
      <div className="auth-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="auth-card">
        <h2 className="auth-title">Bienvenido de nuevo</h2>
        <p className="auth-subtitle">
          Inicia sesión para descubrir outfits personalizados
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              name="email"
              placeholder="ejemplo@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-options">
            <Link to="#" className="forgot">¿Olvidaste tu contraseña?</Link>
          </div>

          <button type="submit" className="btn btn-primary btn-full">
            Iniciar sesión
          </button>
        </form>

        <p className="auth-footer">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;