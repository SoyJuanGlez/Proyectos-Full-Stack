import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProducts } from "../services/productService";
import { useCartStore } from "../store/cartStore";
import "../styles/productDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [added, setAdded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProducts();
        const found = data.find((p) => p._id === id);
        if (!found) {
          setError("Producto no encontrado.");
        } else {
          setProduct(found);
        }
      } catch (err) {
        setError("Error al cargar el producto.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    addToCart({ ...product, selectedSize });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  if (loading) {
    return (
      <div className="pd-loading">
        <div className="pd-spinner" />
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-error">
        <span className="pd-error-icon">⚠️</span>
        <p>{error || "Producto no disponible."}</p>
        <button onClick={() => navigate("/catalog")} className="btn btn-primary">
          ← Volver al catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="pd-wrapper">
      {/* Breadcrumb */}
      <div className="pd-breadcrumb">
        <button onClick={() => navigate("/catalog")} className="pd-crumb">
          Catálogo
        </button>
        <span className="pd-crumb-sep">›</span>
        <span className="pd-crumb pd-crumb--active">{product.name}</span>
      </div>

      <div className="pd-container">
        {/* ── LEFT: Imagen ── */}
        <div className="pd-image-col">
          <div className={`pd-image-frame ${imgLoaded ? "loaded" : ""}`}>
            <img
              src={product.image}
              alt={product.name}
              className="pd-image"
              onLoad={() => setImgLoaded(true)}
            />
            {/* Badges */}
            {product.stock === 0 && (
              <div className="pd-badge pd-badge--out">Agotado</div>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <div className="pd-badge pd-badge--low">Últimas {product.stock} piezas</div>
            )}
          </div>

          {/* Tags debajo de la imagen */}
          <div className="pd-tags">
            {product.category && (
              <span className="pd-tag">📁 {product.category}</span>
            )}
            {product.style && (
              <span className="pd-tag">✨ {product.style}</span>
            )}
            {product.color && (
              <span className="pd-tag">🎨 {product.color}</span>
            )}
          </div>
        </div>

        {/* ── RIGHT: Info ── */}
        <div className="pd-info-col">
          {/* Nombre y precio */}
          <div className="pd-header">
            <p className="pd-label">STREETWEAR PREMIUM</p>
            <h1 className="pd-name">{product.name}</h1>
            <div className="pd-price-row">
              <span className="pd-price">${product.price.toLocaleString()}</span>
              <span className="pd-price-currency">MXN</span>
            </div>
          </div>

          <div className="pd-divider" />

          {/* Selector de tallas */}
          <div className="pd-section">
            <p className="pd-section-label">
              TALLA
              {!selectedSize && <span className="pd-required"> (requerida)</span>}
            </p>
            <div className="pd-sizes">
              {sizes.map((size) => (
                <button
                  key={size}
                  className={`pd-size-btn ${selectedSize === size ? "active" : ""}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Disponibilidad */}
          <div className="pd-stock-row">
            <span className={`pd-stock-dot ${product.stock > 0 ? "in" : "out"}`} />
            <span className="pd-stock-text">
              {product.stock > 0
                ? `${product.stock} unidades disponibles`
                : "Sin stock"}
            </span>
          </div>

          {/* Botón principal */}
          <button
            className={`pd-cta ${added ? "added" : ""} ${
              !selectedSize || product.stock === 0 ? "disabled" : ""
            }`}
            onClick={handleAddToCart}
            disabled={!selectedSize || product.stock === 0}
          >
            {added
              ? "✓ Agregado al carrito"
              : product.stock === 0
              ? "Sin stock disponible"
              : "Agregar al carrito"}
          </button>

          {!selectedSize && product.stock > 0 && (
            <p className="pd-size-hint">Selecciona una talla para continuar</p>
          )}

          <div className="pd-divider" />

          {/* Detalles */}
          <div className="pd-section">
            <p className="pd-section-label">DETALLES DEL PRODUCTO</p>
            <table className="pd-details-table">
              <tbody>
                {product.category && (
                  <tr>
                    <td className="pd-dt-key">Categoría</td>
                    <td className="pd-dt-val">{product.category}</td>
                  </tr>
                )}
                {product.style && (
                  <tr>
                    <td className="pd-dt-key">Estilo</td>
                    <td className="pd-dt-val">{product.style}</td>
                  </tr>
                )}
                {product.color && (
                  <tr>
                    <td className="pd-dt-key">Color</td>
                    <td className="pd-dt-val">{product.color}</td>
                  </tr>
                )}
                <tr>
                  <td className="pd-dt-key">Stock</td>
                  <td className="pd-dt-val">{product.stock} unidades</td>
                </tr>
                <tr>
                  <td className="pd-dt-key">ID</td>
                  <td className="pd-dt-val pd-dt-id">{product._id}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Garantías */}
          <div className="pd-guarantees">
            <div className="pd-guarantee">
              <span>🚚</span>
              <span>Envío gratis en compras mayores a $999 MXN</span>
            </div>
            <div className="pd-guarantee">
              <span>↩️</span>
              <span>Devoluciones gratuitas en 30 días</span>
            </div>
            <div className="pd-guarantee">
              <span>🔒</span>
              <span>Pago 100% seguro y cifrado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;