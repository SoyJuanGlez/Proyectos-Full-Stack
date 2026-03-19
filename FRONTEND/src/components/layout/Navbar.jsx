import "../../styles/navbar.css";
import { Link } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";

const Navbar = () => {
  const { cart, getTotal, getItemCount } = useCartStore();

  const cartCount = getItemCount();
  const cartTotal = getTotal();

  return (
    <nav className="navbar improved-navbar">
      <div className="logo">OUTF<span>AI</span>T</div>

      <div className="links">
        <Link to="/">Inicio</Link>
        <Link to="/catalog">Catalogo</Link>
        <Link to="/cart" className="cart-link">
          Carrito {cartCount > 0 ? <span className="cart-count">{cartCount}</span> : <span className="cart-count zero">0</span>}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;