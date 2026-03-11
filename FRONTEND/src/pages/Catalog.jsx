import { useState } from "react";
import "../styles/catalog.css";

const Catalog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [sortBy, setSortBy] = useState("relevancia");

  // Datos de ejemplo
  const products = [
    { id: 1, name: "Hoodie Oversized", price: 850, category: "hoodies", image: "" },
    { id: 2, name: "Camiseta Streetwear", price: 450, category: "camisetas", image: "" },
    { id: 3, name: "Pantalón Cargo", price: 950, category: "pantalones", image: "" },
    { id: 4, name: "Hoodie Negro Premium", price: 1200, category: "hoodies", image: "" },
    { id: 5, name: "Camiseta Gráfica", price: 520, category: "camisetas", image: "" },
    { id: 6, name: "Mochila Técnica", price: 680, category: "accesorios", image: "" },
  ];

  const categories = [
    { id: "todos", name: "Todos" },
    { id: "hoodies", name: "Hoodies" },
    { id: "camisetas", name: "Camisetas" },
    { id: "pantalones", name: "Pantalones" },
    { id: "accesorios", name: "Accesorios" }
  ];

  // Filtrar y ordenar productos
  let filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "todos" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (sortBy === "precio-menor") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === "precio-mayor") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === "nombre") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  return (
    <div className="catalog">
      {/* Header */}
      <div className="catalog-header">
        <h1>Catálogo de Productos</h1>
        <p>Descubre nuestra colección exclusiva de streetwear premium</p>
      </div>

      {/* Filters Section */}
      <div className="catalog-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label>Categoría</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Ordenar por</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="relevancia">Relevancia</option>
              <option value="precio-menor">Precio: Menor a Mayor</option>
              <option value="precio-mayor">Precio: Mayor a Menor</option>
              <option value="nombre">Nombre (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <p>Mostrando <strong>{filtered.length}</strong> productos</p>
      </div>

      {/* Products Grid */}
      {filtered.length > 0 ? (
        <div className="product-grid">
          {filtered.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image-wrapper">
                <img src={product.image} alt={product.name} className="product-image" />
                <span className="product-badge">Stock</span>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-price">${product.price.toLocaleString()}</p>
                <button className="btn-add-cart">Agregar al carrito</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-products">
          <p>No se encontraron productos que coincidan con tu búsqueda.</p>
          <button onClick={() => { setSearchTerm(""); setSelectedCategory("todos"); }} className="btn-reset">
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
};

export default Catalog;