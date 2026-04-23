// ============================================================
// Catalog.jsx — Catálogo de productos con control de roles
//
// Visible para todos:       grid de productos, filtros, búsqueda
// Solo visible para admin:  botón "Agregar producto", Editar, Eliminar
// ============================================================

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../services/productService";
import { useCartStore } from "../store/cartStore";
import { useAuth } from "../hooks/useAuth";
import "../styles/catalog.css";

const CATEGORY_OPTIONS = [
  { id: "hoodies",    name: "Hoodies" },
  { id: "camisetas",  name: "Camisetas" },
  { id: "pantalones", name: "Pantalones" },
  { id: "calzado",    name: "Calzado" },
  { id: "chaquetas",  name: "Chaquetas" },
  { id: "accesorios", name: "Accesorios" },
];

const EMPTY_PRODUCT = {
  name: "", price: 0, image: "",
  category: "hoodies", style: "", color: "", stock: 0,
};

const Catalog = () => {
  // ── Rol del usuario actual ───────────────────────────────────────────────
  const { isAdmin } = useAuth();

  // ── Estado del catálogo ──────────────────────────────────────────────────
  const [products,         setProducts]         = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);

  // ── Filtros ──────────────────────────────────────────────────────────────
  const [searchTerm,       setSearchTerm]       = useState("");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [sortBy,           setSortBy]           = useState("relevancia");
  const [priceRange,       setPriceRange]       = useState([0, 2000]);
  const [selectedStyle,    setSelectedStyle]    = useState("todos");
  const [selectedColor,    setSelectedColor]    = useState("todos");

  // ── Formulario admin ─────────────────────────────────────────────────────
  const [showCreateForm,   setShowCreateForm]   = useState(false);
  const [formMode,         setFormMode]         = useState("create");
  const [editingId,        setEditingId]        = useState(null);
  const [newProduct,       setNewProduct]       = useState(EMPTY_PRODUCT);
  const [formError,        setFormError]        = useState(null);
  const [formSuccess,      setFormSuccess]      = useState(null);

  const { addToCart } = useCartStore();

  // ── Carga de productos ───────────────────────────────────────────────────
  useEffect(() => {
    getProducts()
      .then((data) => { setProducts(data); setError(null); })
      .catch(() => setError("Error al cargar productos. Inténtalo de nuevo."))
      .finally(() => setLoading(false));
  }, []);

  // ── Helpers del formulario (solo accesibles si isAdmin) ──────────────────
  const openCreateForm = () => {
    setFormMode("create");
    setEditingId(null);
    setNewProduct(EMPTY_PRODUCT);
    setFormError(null);
    setFormSuccess(null);
    setShowCreateForm((prev) => !prev);
  };

  const handleEditProduct = (product) => {
    setFormMode("edit");
    setEditingId(product._id);
    setNewProduct({
      name:     product.name     || "",
      price:    product.price    || 0,
      image:    product.image    || "",
      category: product.category || "hoodies",
      style:    product.style    || "",
      color:    product.color    || "",
      stock:    product.stock    || 0,
    });
    setFormError(null);
    setFormSuccess(null);
    setShowCreateForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      setFormSuccess("Producto eliminado correctamente.");
      setFormError(null);
    } catch {
      setFormError("No se pudo eliminar el producto.");
    }
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const payload = {
      name:     newProduct.name,
      price:    Number(newProduct.price),
      image:    newProduct.image,
      category: newProduct.category,
      style:    newProduct.style,
      color:    newProduct.color,
      stock:    Number(newProduct.stock),
    };

    try {
      if (formMode === "create") {
        const created = await createProduct(payload);
        setProducts((prev) => [created, ...prev]);
        setFormSuccess("Producto creado correctamente.");
      } else {
        const updated = await updateProduct(editingId, payload);
        setProducts((prev) => prev.map((p) => (p._id === editingId ? updated : p)));
        setFormSuccess("Producto actualizado correctamente.");
      }
      setNewProduct(EMPTY_PRODUCT);
      setFormMode("create");
      setEditingId(null);
      setShowCreateForm(false);
    } catch {
      setFormError("No se pudo guardar el producto. Revisa los datos o la conexión.");
    }
  };

  // ── Filtrado y ordenado ──────────────────────────────────────────────────
  const categories = [{ id: "todos", name: "Todos" }, ...CATEGORY_OPTIONS];
  const styles     = ["todos", ...new Set(products.map((p) => p?.style).filter(Boolean))];
  const colors     = ["todos", ...new Set(products.map((p) => p?.color).filter(Boolean))];

  let filtered = products.filter((p) => {
    return (
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "todos" || p.category === selectedCategory) &&
      p.price >= priceRange[0] && p.price <= priceRange[1] &&
      (selectedStyle === "todos" || p.style === selectedStyle) &&
      (selectedColor === "todos" || p.color === selectedColor)
    );
  });

  if (sortBy === "precio-menor") filtered.sort((a, b) => a.price - b.price);
  else if (sortBy === "precio-mayor") filtered.sort((a, b) => b.price - a.price);
  else if (sortBy === "nombre") filtered.sort((a, b) => a.name.localeCompare(b.name));

  const hasActiveFilters =
    searchTerm || selectedCategory !== "todos" ||
    selectedStyle !== "todos" || selectedColor !== "todos" ||
    priceRange[0] > 0 || priceRange[1] < 2000;

  const clearFilters = () => {
    setSearchTerm(""); setSelectedCategory("todos");
    setSelectedStyle("todos"); setSelectedColor("todos");
    setPriceRange([0, 2000]);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="catalog">

      {/* ── Header ── */}
      <div className="catalog-header">
        <h1>Catálogo de Productos</h1>
        <p>Descubre nuestra colección exclusiva de streetwear premium</p>

        {/* Botón "Agregar producto" — SOLO ADMIN */}
        {isAdmin && (
          <button className="btn-create" onClick={openCreateForm}>
            {showCreateForm ? "Cancelar" : "＋ Agregar producto"}
          </button>
        )}
      </div>

      {/* ── Formulario crear/editar — SOLO ADMIN ── */}
      {isAdmin && showCreateForm && (
        <div className="create-product-form">
          <h2>{formMode === "create" ? "Nuevo producto" : "Editar producto"}</h2>
          {formError   && <p className="form-error">{formError}</p>}
          {formSuccess  && <p className="form-success">{formSuccess}</p>}
          <form onSubmit={handleSubmitProduct}>
            {[
              { label: "Nombre",        key: "name",  type: "text" },
              { label: "Imagen (URL)",  key: "image", type: "text" },
              { label: "Estilo",        key: "style", type: "text" },
              { label: "Color",         key: "color", type: "text" },
            ].map(({ label, key, type }) => (
              <div className="form-row" key={key}>
                <label>{label}</label>
                <input
                  type={type}
                  value={newProduct[key]}
                  onChange={(e) => setNewProduct({ ...newProduct, [key]: e.target.value })}
                  required={key === "name"}
                />
              </div>
            ))}

            <div className="form-row">
              <label>Precio</label>
              <input type="number" min="0" step="0.01" value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required />
            </div>
            <div className="form-row">
              <label>Stock</label>
              <input type="number" min="0" value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />
            </div>
            <div className="form-row">
              <label>Categoría</label>
              <select value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn-submit">
              {formMode === "create" ? "Crear producto" : "Guardar cambios"}
            </button>
          </form>
        </div>
      )}

      {/* ── Filtros ── */}
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
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Estilo</label>
            <select value={selectedStyle} onChange={(e) => setSelectedStyle(e.target.value)}>
              {styles.map((s) => <option key={s} value={s}>{s === "todos" ? "Todos" : s}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Color</label>
            <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
              {colors.map((c) => <option key={c} value={c}>{c === "todos" ? "Todos" : c}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Rango de precio</label>
            <div className="price-range">
              <input type="number" placeholder="Min" value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} />
              <span>–</span>
              <input type="number" placeholder="Max" value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} />
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

      {/* ── Resultado de búsqueda ── */}
      <div className="results-info">
        <p>Mostrando <strong>{filtered.length}</strong> productos</p>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="btn-reset">Limpiar filtros</button>
        )}
      </div>

      {/* ── Grid de productos ── */}
      {loading ? (
        <div className="loading"><p>Cargando productos...</p></div>
      ) : error ? (
        <div className="error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">Reintentar</button>
        </div>
      ) : filtered.length > 0 ? (
        <div className="product-grid">
          {filtered.map((product) => (
            <div key={product._id} className="product-card">

              {/* Imagen — clicable para todos */}
              <Link to={`/product/${product._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div className="product-image-wrapper">
                  <img src={product.image} alt={product.name} className="product-image" />
                  <span className="product-badge">Stock</span>
                </div>
              </Link>

              <div className="product-info">
                <Link to={`/product/${product._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <h3 style={{ cursor: "pointer" }}>{product.name}</h3>
                </Link>
                <p className="product-price">${product.price.toLocaleString()}</p>

                <div className="product-actions">
                  {/* Agregar al carrito — visible para TODOS */}
                  <button className="btn-add-cart" onClick={() => addToCart(product)}>
                    Agregar al carrito
                  </button>

                  {/* Editar y Eliminar — SOLO ADMIN */}
                  {isAdmin && (
                    <>
                      <button className="btn-edit" onClick={() => handleEditProduct(product)}>
                        Editar
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteProduct(product._id)}>
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="no-products">
          <p>No se encontraron productos que coincidan con tu búsqueda.</p>
          <button onClick={clearFilters} className="btn-reset">Limpiar filtros</button>
        </div>
      )}
    </div>
  );
};

export default Catalog;