import "../styles/navbar.css";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">OUTF<span>AI</span>T</div>

      <div className="links">
        <Link to="/">Home</Link>
        <Link to="/catalog">Catalog</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
};

export default Navbar;