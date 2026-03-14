import "../styles/navbar.css";
import { Link } from "react-router-dom";
import { useCartStore } from "../../store/cartStore";

const Navbar = () => {
  const { cart } = useCartStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="logo">OUTF<span>AI</span>T</div>

      <div className="links">
        <Link to="/">Home</Link>
        <Link to="/catalog">Catalog</Link>
        <Link to="/cart" className="cart-link">
          Carrito {cartCount > 0 && <span className="cart-count">({cartCount})</span>}
        </Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;