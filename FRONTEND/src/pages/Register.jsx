import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
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
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        // El usuario se guardó correctamente en MongoDB
        alert("¡Cuenta creada con éxito!");
        navigate("/login");
      } else {
        // El backend respondió con un error (ej. 400 o 500)
        // Mostramos el mensaje que viene del authService.js o auth.routes.js
        alert(`Error: ${data.message || "No se pudo completar el registro"}`);
      }
    } catch (error) {
      // Error de red (el servidor está apagado o no hay internet)
      console.error("Error en la petición:", error);
      alert("No se pudo conectar con el servidor. Inténtalo más tarde.");
    }
  };

  return (
    <div className="auth-page">
      {/* Fondo */}
      <div className="auth-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="auth-card">
        {/* Título */}
        <h2 className="auth-title">Crea tu cuenta</h2>
        <p className="auth-subtitle">
          Únete y recibe recomendaciones personalizadas con IA
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Nombre</label>
            <input
              type="text"
              name="name"
              placeholder="Tu nombre"
              value={form.name} // Controlar el input es buena práctica
              onChange={handleChange}
              required
            />
          </div>

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

          <button type="submit" className="btn btn-primary btn-full">
            Crear cuenta
          </button>
        </form>

        {/* Footer */}
        <p className="auth-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;