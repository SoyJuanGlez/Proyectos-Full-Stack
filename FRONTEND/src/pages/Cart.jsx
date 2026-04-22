import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { getCurrentUser } from "../services/authService";
import { createOrder } from "../services/orderService";
import { createCheckoutSession, getCheckoutSession } from "../services/paymentService";
import "../styles/cart.css";

const ORDER_SNAPSHOT_KEY = "pending-order-snapshot";

const Cart = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    cart,
    removeFromCart,
    clearCart,
    incrementQuantity,
    decrementQuantity,
  } = useCartStore();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const cartRef = useRef(cart);
  const totalRef = useRef(0);

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  useEffect(() => {
    cartRef.current = cart;
    totalRef.current = total;
  }, [cart, total]);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (paymentStatus === "cancelled") {
      setCheckoutMessage("");
      setCheckoutError("El pago demo fue cancelado. Tu carrito sigue intacto.");
      sessionStorage.removeItem(ORDER_SNAPSHOT_KEY);
      setSearchParams({}, { replace: true });
      return;
    }

    if (paymentStatus !== "success" || !sessionId) return;

    const verifyPayment = async () => {
      try {
        const session = await getCheckoutSession(sessionId);
        const storedSnapshot = sessionStorage.getItem(ORDER_SNAPSHOT_KEY);
        const parsedSnapshot = storedSnapshot ? JSON.parse(storedSnapshot) : null;
        const orderItems = parsedSnapshot?.items || cartRef.current;
        const orderTotal = parsedSnapshot?.total || totalRef.current;

        if (session.payment_status === "paid") {
          await createOrder({
            items: orderItems,
            total: orderTotal,
            paymentSessionId: session.id,
            paymentStatus: session.payment_status,
          });

          clearCart();
          sessionStorage.removeItem(ORDER_SNAPSHOT_KEY);
          setCheckoutError("");
          setCheckoutMessage("Pago confirmado con Stripe. Tu orden ya aparece en tu historial.");
        } else {
          setCheckoutMessage("");
          setCheckoutError("Stripe devolvio la sesion, pero el pago aun no aparece como completado.");
        }
      } catch (error) {
        setCheckoutMessage("");
        setCheckoutError(
          error.response?.data?.message ||
          "No pude guardar tu orden o verificar el pago. Intenta entrar de nuevo a tu perfil."
        );
      } finally {
        setSearchParams({}, { replace: true });
        setIsCheckingOut(false);
      }
    };

    verifyPayment();
  }, [searchParams, setSearchParams, clearCart]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (!getCurrentUser()) {
      setCheckoutMessage("");
      setCheckoutError("Inicia sesion para completar tu compra y guardar tu historial de ordenes.");
      navigate("/login");
      return;
    }

    setIsCheckingOut(true);
    setCheckoutMessage("");
    setCheckoutError("");
    sessionStorage.setItem(ORDER_SNAPSHOT_KEY, JSON.stringify({
      items: cart,
      total,
    }));

    try {
      const session = await createCheckoutSession(cart);
      window.location.href = session.url;
    } catch (error) {
      setCheckoutError(
          error.response?.data?.message || "No se pudo iniciar el checkout con Stripe."
      );
      sessionStorage.removeItem(ORDER_SNAPSHOT_KEY);
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="cart">
      <div className="cart-header">
        <h1>Carrito de Compras</h1>
        <p>{cart.length} producto(s) en tu carrito</p>
      </div>

      {checkoutMessage && <p className="success-message">{checkoutMessage}</p>}
      {checkoutError && <p className="error-message">{checkoutError}</p>}

      {cart.length === 0 ? (
        <div className="empty-cart">
          <p>Tu carrito está vacío</p>
          <a href="/catalog" className="btn btn-primary">Ir al Catálogo</a>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item._id} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">${item.price.toLocaleString()}</p>
                  <div className="quantity-controls">
                    <button onClick={() => decrementQuantity(item._id)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => incrementQuantity(item._id)}>+</button>
                  </div>
                </div>
                <div className="cart-item-total">
                  <p>${(item.price * item.quantity).toLocaleString()}</p>
                  <button onClick={() => removeFromCart(item._id)} className="btn-remove">Eliminar</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-details">
              <p>Productos: <strong>{totalItems}</strong></p>
              <p>Subtotal: <strong>${total.toLocaleString()}</strong></p>
            </div>
            <div className="cart-total">
              <h3>Total: <span>${total.toLocaleString()}</span></h3>
            </div>
            <div className="cart-actions">
              <button onClick={clearCart} className="btn btn-secondary">Vaciar Carrito</button>
              <button
                className="btn btn-primary"
                disabled={total === 0 || isCheckingOut}
                onClick={handleCheckout}
              >
                {isCheckingOut ? "Redirigiendo a Stripe..." : "Proceder al Pago"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
