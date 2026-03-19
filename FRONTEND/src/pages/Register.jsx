import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/authService";
import "../styles/auth.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await register(name, email, password);
      setMessage("Registro exitoso. Ahora inicia sesión.");
      setError("");
      setTimeout(() => navigate("/login"), 1400);
    } catch (err) {
      setMessage("");
      setError(err.response?.data?.message || "Error al registrar usuario");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Registrarse</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>Nombre</label>
          <input type="text" value={name} required onChange={(e) => setName(e.target.value)} />
          <label>Email</label>
          <input type="email" value={email} required onChange={(e) => setEmail(e.target.value)} />
          <label>Contraseña</label>
          <input type="password" value={password} required onChange={(e) => setPassword(e.target.value)} />
          {message && <p className="auth-success">{message}</p>}
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-button">Crear cuenta</button>
        </form>
        <p>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
