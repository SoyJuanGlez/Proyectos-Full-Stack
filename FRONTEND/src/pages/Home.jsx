import { Link } from "react-router-dom";
import "../styles/home.css";

const Home = () => {
  const features = [
    {
      icon: "🎨",
      title: "Diseño Personalizado",
      description: "Recomendaciones basadas en IA según tu estilo"
    },
    {
      icon: "👕",
      title: "Streetwear Premium",
      description: "Ropa de calidad seleccionada cuidadosamente"
    },
    {
      icon: "🚀",
      title: "Envío Rápido",
      description: "Entrega en tu puerta en 3-5 días hábiles"
    }
  ];

  const categories = [
    { name: "Hoodies", icon: "🧥" },
    { name: "Camisetas", icon: "👕" },
    { name: "Pantalones", icon: "👖" },
    { name: "Accesorios", icon: "🧢" }
  ];

  return (
    <div className="home">
      {/* Hero Section */}
      
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Encuentra tu Outfit Perfecto</h1>
          <p className="hero-subtitle">Streetwear personalizado con IA - El futuro de la moda está aquí</p>
          <div className="hero-buttons">
            <Link to="/quiz" className="btn btn-primary">Descubrir Ahora</Link>
            <Link to="/catalog" className="btn btn-secondary">Explorar Catálogo</Link>
          </div>
        </div>
        <div className="hero-background">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>¿Por qué elegirnos?</h2>
        <div className="features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="feature-card">
              <span className="feature-icon">{feature.icon}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories">
        <h2>Explora por Categoría</h2>
        <div className="categories-grid">
          {categories.map((cat, idx) => (
            <Link key={idx} to="/catalog" className="category-card">
              <span className="category-icon">{cat.icon}</span>
              <p>{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>¿Listo para transformar tu guardarropa?</h2>
        <p>Responde nuestro cuestionario y recibe recomendaciones personalizadas</p>
        <Link to="/quiz" className="btn btn-primary btn-large">Comenzar Quiz de Estilo</Link>
      </section>
    </div>
  );
};

export default Home;