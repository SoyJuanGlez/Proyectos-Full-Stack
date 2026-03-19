import "../../styles/navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const { getItemCount } = useCartStore();
  const cartCount = getItemCount();

  // Estado local para que el Navbar se entere cuando el token cambie
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Función para cargar los datos del usuario
    const loadUserData = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };

    loadUserData();

    // Escuchar cambios en el localStorage (por si se loguea en otra pestaña)
    window.addEventListener("storage", loadUserData);
    return () => window.removeEventListener("storage", loadUserData);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    alert("Sesión cerrada correctamente");
    navigate("/login");
  };

  return (
    <nav className="navbar improved-navbar">
      <div className="logo">OUTF<span>AI</span></div>

      <div className="links">
        <Link to="/">Inicio</Link>
        <Link to="/catalog">Catalogo</Link>

        {!user ? (
          // SI NO HAY SESIÓN
          <>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register">Registrarse</Link>
          </>
        ) : (
          // SI HAY SESIÓN
          <>
            <Link to="/cart" className="cart-link">
              Carrito{" "}
              <span className={`cart-count ${cartCount === 0 ? "zero" : ""}`}>
                {cartCount}
              </span>
            </Link>
            
            {/* BOTÓN DE PERFIL Y CERRAR SESIÓN */}
            <Link to="/profile" className="profile-link">
               👤 {user.name}
            </Link>
            
            <button onClick={handleLogout} className="btn-logout">
              Salir
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;