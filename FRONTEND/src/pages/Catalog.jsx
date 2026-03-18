import { useState, useEffect } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/productService";
import { useCartStore } from "../store/cartStore";
import "../styles/catalog.css";

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [sortBy, setSortBy] = useState("relevancia");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedStyle, setSelectedStyle] = useState("todos");
  const [selectedColor, setSelectedColor] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formMode, setFormMode] = useState("create"); // "create" or "edit"
  const [editingId, setEditingId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    image: "",
    category: "hoodies",
    style: "",
    color: "",
    stock: 0
  });
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(null);
  const { addToCart } = useCartStore();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Error al cargar productos. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSuccess(null);

    try {
      if (formMode === "create") {
        const created = await createProduct({
          name: newProduct.name,
          price: Number(newProduct.price),
          image: newProduct.image,
          category: newProduct.category,
          style: newProduct.style,
          color: newProduct.color,
          stock: Number(newProduct.stock)
        });

        setProducts((prev) => [created, ...prev]);
        setCreateSuccess("Producto creado correctamente.");
      } else {
        const updated = await updateProduct(editingId, {
          name: newProduct.name,
          price: Number(newProduct.price),
          image: newProduct.image,
          category: newProduct.category,
          style: newProduct.style,
          color: newProduct.color,
          stock: Number(newProduct.stock)
        });

        setProducts((prev) => prev.map((p) => (p._id === editingId ? updated : p)));
        setCreateSuccess("Producto actualizado correctamente.");
      }

      setNewProduct({
        name: "",
        price: 0,
        image: "",
        category: "hoodies",
        style: "",
        color: "",
        stock: 0
      });
      setFormMode("create");
      setEditingId(null);
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error guardando producto:", error);
      setCreateError("No se pudo guardar el producto. Revisa los datos o la conexión.");
    }
  };

  const handleEditProduct = (product) => {
    setFormMode("edit");
    setEditingId(product._id);
    setNewProduct({
      name: product.name || "",
      price: product.price || 0,
      image: product.image || "",
      category: product.category || "hoodies",
      style: product.style || "",
      color: product.color || "",
      stock: product.stock || 0
    });
    setCreateError(null);
    setCreateSuccess(null);
    setShowCreateForm(true);
  };

  const handleDeleteProduct = async (id) => {
    const confirmed = window.confirm("¿Estás seguro de que deseas eliminar este producto?");
    if (!confirmed) return;

    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setCreateSuccess("Producto eliminado correctamente.");
      setCreateError(null);
    } catch (error) {
      console.error("Error eliminando producto:", error);
      setCreateError("No se pudo eliminar el producto.");
    }
  };

  const categories = [
    { id: "todos", name: "Todos" },
    { id: "hoodies", name: "Hoodies" },
    { id: "camisetas", name: "Camisetas" },
    { id: "pantalones", name: "Pantalones" },
    { id: "accesorios", name: "Accesorios" }
  ];

  // Obtener estilos y colores únicos de los productos
  const styles = ["todos", ...new Set(products.map(p => p?.style).filter(s => s && s.trim()))];
  const colors = ["todos", ...new Set(products.map(p => p?.color).filter(c => c && c.trim()))];

  // Filtrar y ordenar productos
  let filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "todos" || p.category === selectedCategory;
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    const matchesStyle = selectedStyle === "todos" || (p.style && p.style === selectedStyle);
    const matchesColor = selectedColor === "todos" || (p.color && p.color === selectedColor);
    return matchesSearch && matchesCategory && matchesPrice && matchesStyle && matchesColor;
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
        <button
          className="btn-create"
          onClick={() => {
            setCreateError(null);
            setCreateSuccess(null);
            setFormMode("create");
            setEditingId(null);
            setNewProduct({
              name: "",
              price: 0,
              image: "",
              category: "hoodies",
              style: "",
              color: "",
              stock: 0
            });
            setShowCreateForm((prev) => !prev);
          }}
        >
          {showCreateForm ? "Cancelar" : "Agregar producto"}
        </button>
      </div>

      {showCreateForm && (
        <div className="create-product-form">
          <h2>{formMode === "create" ? "Nuevo producto" : "Editar producto"}</h2>
          {createError && <p className="form-error">{createError}</p>}
          {createSuccess && <p className="form-success">{createSuccess}</p>}
          <form onSubmit={handleSubmitProduct}>
            <div className="form-row">
              <label>Nombre</label>
              <input
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <label>Precio</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <label>Imagen (ruta)</label>
              <input
                value={newProduct.image}
                onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
              />
            </div>
            <div className="form-row">
              <label>Categoría</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              >
                <option value="hoodies">Hoodies</option>
                <option value="camisetas">Camisetas</option>
                <option value="pantalones">Pantalones</option>
                <option value="accesorios">Accesorios</option>
              </select>
            </div>
            <div className="form-row">
              <label>Estilo</label>
              <input
                value={newProduct.style}
                onChange={(e) => setNewProduct({ ...newProduct, style: e.target.value })}
              />
            </div>
            <div className="form-row">
              <label>Color</label>
              <input
                value={newProduct.color}
                onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
              />
            </div>
            <div className="form-row">
              <label>Stock</label>
              <input
                type="number"
                min="0"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              />
            </div>
            <button type="submit" className="btn-submit">
              Crear producto
            </button>
          </form>
        </div>
      )}

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
            <label>Estilo</label>
            <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)}>
              {styles.map(style => (
                <option key={style} value={style}>{style === "todos" ? "Todos" : style}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Color</label>
            <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
              {colors.map(color => (
                <option key={color} value={color}>{color === "todos" ? "Todos" : color}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Rango de Precio</label>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              />
            </div>
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
        {(searchTerm || selectedCategory !== "todos" || selectedStyle !== "todos" || selectedColor !== "todos" || priceRange[0] > 0 || priceRange[1] < 2000) && (
          <button 
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("todos");
              setSelectedStyle("todos");
              setSelectedColor("todos");
              setPriceRange([0, 2000]);
            }} 
            className="btn-reset"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="loading">
          <p>Cargando productos...</p>
        </div>
      ) : error ? (
        <div className="error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">Reintentar</button>
        </div>
      ) : filtered.length > 0 ? (
        <div className="product-grid">
          {filtered.map(product => (
            <div key={product._id} className="product-card">
              <div className="product-image-wrapper">
                <img src={product.image} alt={product.name} className="product-image" />
                <span className="product-badge">Stock</span>
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-price">${product.price.toLocaleString()}</p>
                <div className="product-actions">
                  <button className="btn-add-cart" onClick={() => addToCart(product)}>
                    Agregar al carrito
                  </button>
                  <button className="btn-edit" onClick={() => handleEditProduct(product)}>
                    Editar
                  </button>
                  <button className="btn-delete" onClick={() => handleDeleteProduct(product._id)}>
                    Eliminar
                  </button>
                </div>
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