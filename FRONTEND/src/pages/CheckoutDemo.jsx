import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import "../styles/checkoutDemo.css";

const CheckoutDemo = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [fallbackSessionId] = useState(() => `mock_session_${Date.now()}`);
  const sessionId = searchParams.get("session_id") || fallbackSessionId;

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const itemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const handleSuccess = () => {
    setIsProcessing(true);

    window.setTimeout(() => {
      navigate(`/cart?payment=success&session_id=${sessionId}`);
    }, 1600);
  };

  const handleCancel = () => {
    navigate("/cart?payment=cancelled");
  };

  return (
    <div className="checkout-demo">
      <div className="checkout-demo__shell">
        <section className="checkout-demo__card">
          <div className="checkout-demo__badge">Modo demo</div>
          <h1>Pago de prueba</h1>
          <p className="checkout-demo__subtitle">
            Esta pantalla simula un checkout exitoso para tus demos con Stripe en entorno de prueba.
          </p>

          <div className="checkout-demo__panel">
            <div className="checkout-demo__row">
              <span>Comercio</span>
              <strong>OUTFAI</strong>
            </div>
            <div className="checkout-demo__row">
              <span>Sesion</span>
              <strong>{sessionId.slice(-12)}</strong>
            </div>
            <div className="checkout-demo__row">
              <span>Tarjeta</span>
              <strong>4242 4242 4242 4242</strong>
            </div>
            <div className="checkout-demo__row">
              <span>Estado</span>
              <strong>{isProcessing ? "Procesando..." : "Lista para aprobar"}</strong>
            </div>
          </div>

          <div className="checkout-demo__actions">
            <button
              className="checkout-demo__btn checkout-demo__btn--secondary"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Cancelar
            </button>
            <button
              className="checkout-demo__btn checkout-demo__btn--primary"
              onClick={handleSuccess}
              disabled={isProcessing || cart.length === 0}
            >
              {isProcessing ? "Aprobando pago..." : "Pagar y completar demo"}
            </button>
          </div>
        </section>

        <aside className="checkout-demo__summary">
          <p className="checkout-demo__summary-label">Resumen del pedido</p>
          <h2>{itemCount} articulo(s)</h2>

          <div className="checkout-demo__items">
            {cart.map((item) => (
              <div key={`${item._id}-${item.selectedSize || "base"}`} className="checkout-demo__item">
                <div>
                  <p>{item.name}</p>
                  <span>
                    {item.quantity} x ${item.price.toLocaleString()}
                  </span>
                </div>
                <strong>${(item.price * item.quantity).toLocaleString()}</strong>
              </div>
            ))}
          </div>

          <div className="checkout-demo__total">
            <span>Total demo</span>
            <strong>${total.toLocaleString()} MXN</strong>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutDemo;
