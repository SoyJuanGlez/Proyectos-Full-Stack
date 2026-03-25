import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../services/authService";
import { getMyOrders } from "../services/orderService";
import { getProducts } from "../services/productService";
import "../styles/profile.css";

const STATUS_LABELS = {
  pending:    { label: "Pendiente",   cls: "status--pending"   },
  processing: { label: "En proceso",  cls: "status--processing" },
  shipped:    { label: "Enviado",     cls: "status--shipped"    },
  delivered:  { label: "Entregado",   cls: "status--delivered"  },
  cancelled:  { label: "Cancelado",   cls: "status--cancelled"  },
};

const Profile = () => {
  const navigate  = useNavigate();
  const user      = getCurrentUser();

  const [orders,    setOrders]    = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState("info");
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingFavs,   setLoadingFavs]   = useState(false);

  // Redirigir si no hay sesión
  useEffect(() => {
    if (!user) navigate("/login");
  }, []);

  // Cargar órdenes
  useEffect(() => {
    if (activeTab !== "orders") return;
    const fetch = async () => {
      setLoadingOrders(true);
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch {
        setOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetch();
  }, [activeTab]);

  // Cargar favoritos desde localStorage
  useEffect(() => {
    if (activeTab !== "favorites") return;
    setLoadingFavs(true);
    try {
      const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
      if (stored.length === 0) { setFavorites([]); setLoadingFavs(false); return; }
      getProducts().then((all) => {
        const favProducts = all.filter((p) => stored.includes(p._id));
        setFavorites(favProducts);
      }).finally(() => setLoadingFavs(false));
    } catch {
      setFavorites([]);
      setLoadingFavs(false);
    }
  }, [activeTab]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  // Avatar con iniciales
  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="profile-wrapper">
      {/* ── Sidebar ── */}
      <aside className="profile-sidebar">
        <div className="profile-avatar">{initials}</div>
        <h2 className="profile-username">{user.name}</h2>
        <p className="profile-email">{user.email}</p>
        {user.role && (
          <span className={`profile-role-badge ${user.role === "admin" ? "admin" : ""}`}>
            {user.role === "admin" ? "⚙️ Admin" : "👤 Cliente"}
          </span>
        )}

        <nav className="profile-nav">
          <button
            className={`profile-nav-btn ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            <span>📋</span> Mi información
          </button>
          <button
            className={`profile-nav-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <span>📦</span> Mis pedidos
          </button>
          <button
            className={`profile-nav-btn ${activeTab === "favorites" ? "active" : ""}`}
            onClick={() => setActiveTab("favorites")}
          >
            <span>❤️</span> Favoritos
          </button>
        </nav>

        <button className="profile-logout-btn" onClick={handleLogout}>
          🚪 Cerrar sesión
        </button>
      </aside>

      {/* ── Main content ── */}
      <main className="profile-main">

        {/* ── Tab: Información ── */}
        {activeTab === "info" && (
          <section className="profile-section" key="info">
            <div className="profile-section-header">
              <h3>Mi información</h3>
              <p>Datos de tu cuenta en OUTFAI</p>
            </div>

            <div className="info-cards">
              <div className="info-card">
                <span className="info-card-icon">👤</span>
                <div>
                  <p className="info-card-label">Nombre completo</p>
                  <p className="info-card-value">{user.name}</p>
                </div>
              </div>

              <div className="info-card">
                <span className="info-card-icon">✉️</span>
                <div>
                  <p className="info-card-label">Correo electrónico</p>
                  <p className="info-card-value">{user.email}</p>
                </div>
              </div>

              <div className="info-card">
                <span className="info-card-icon">🛡️</span>
                <div>
                  <p className="info-card-label">Rol</p>
                  <p className="info-card-value" style={{ textTransform: "capitalize" }}>
                    {user.role || "usuario"}
                  </p>
                </div>
              </div>

              <div className="info-card">
                <span className="info-card-icon">🔑</span>
                <div>
                  <p className="info-card-label">ID de cuenta</p>
                  <p className="info-card-value info-card-id">{user._id || user.id}</p>
                </div>
              </div>
            </div>

            <div className="info-notice">
              <span>ℹ️</span>
              <p>Para modificar tus datos, contacta a soporte.</p>
            </div>
          </section>
        )}

        {/* ── Tab: Pedidos ── */}
        {activeTab === "orders" && (
          <section className="profile-section" key="orders">
            <div className="profile-section-header">
              <h3>Mis pedidos</h3>
              <p>Historial de todas tus compras</p>
            </div>

            {loadingOrders ? (
              <div className="profile-loading">
                <div className="profile-spinner" />
                <p>Cargando pedidos...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="profile-empty">
                <span className="profile-empty-icon">📦</span>
                <p>Aún no tienes pedidos</p>
                <button className="btn btn-primary" onClick={() => navigate("/catalog")}>
                  Ir al catálogo
                </button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => {
                  const st = STATUS_LABELS[order.status] || { label: order.status, cls: "" };
                  return (
                    <div key={order._id} className="order-card">
                      <div className="order-card-top">
                        <div>
                          <p className="order-id">Pedido #{order._id.slice(-8).toUpperCase()}</p>
                          <p className="order-date">
                            {new Date(order.createdAt).toLocaleDateString("es-MX", {
                              year: "numeric", month: "long", day: "numeric"
                            })}
                          </p>
                        </div>
                        <span className={`order-status ${st.cls}`}>{st.label}</span>
                      </div>

                      {/* Items del pedido */}
                      {order.items && order.items.length > 0 && (
                        <div className="order-items">
                          {order.items.map((item, i) => (
                            <div key={i} className="order-item">
                              {item.image && (
                                <img src={item.image} alt={item.name} className="order-item-img" />
                              )}
                              <div className="order-item-info">
                                <p className="order-item-name">{item.name}</p>
                                <p className="order-item-meta">
                                  {item.selectedSize && <span>Talla: {item.selectedSize}</span>}
                                  <span>Cant: {item.quantity}</span>
                                  <span>${(item.price * item.quantity).toLocaleString()}</span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="order-card-footer">
                        <span>Total del pedido</span>
                        <span className="order-total">${order.total?.toLocaleString()} MXN</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ── Tab: Favoritos ── */}
        {activeTab === "favorites" && (
          <section className="profile-section" key="favorites">
            <div className="profile-section-header">
              <h3>Mis favoritos</h3>
              <p>Productos que guardaste para después</p>
            </div>

            {loadingFavs ? (
              <div className="profile-loading">
                <div className="profile-spinner" />
                <p>Cargando favoritos...</p>
              </div>
            ) : favorites.length === 0 ? (
              <div className="profile-empty">
                <span className="profile-empty-icon">❤️</span>
                <p>No tienes favoritos guardados aún</p>
                <button className="btn btn-primary" onClick={() => navigate("/catalog")}>
                  Explorar catálogo
                </button>
              </div>
            ) : (
              <div className="favorites-grid">
                {favorites.map((product) => (
                  <div
                    key={product._id}
                    className="fav-card"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <div className="fav-card-img-wrap">
                      <img src={product.image} alt={product.name} className="fav-card-img" />
                    </div>
                    <div className="fav-card-info">
                      <p className="fav-card-name">{product.name}</p>
                      <p className="fav-card-price">${product.price?.toLocaleString()} MXN</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {favorites.length === 0 && (
              <div className="info-notice" style={{ marginTop: "1.5rem" }}>
                <span>💡</span>
                <p>Próximamente podrás guardar favoritos directo desde el catálogo con un botón de corazón ❤️</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Profile;