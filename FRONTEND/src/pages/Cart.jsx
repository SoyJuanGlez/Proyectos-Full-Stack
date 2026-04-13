import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { createCheckoutSession, getCheckoutSession } from "../services/paymentService";
import "../styles/cart.css";

const Cart = () => {
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

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");

    if (paymentStatus === "cancelled") {
      setCheckoutMessage("");
      setSearchParams({}, { replace: true });
      return;
    }

    if (paymentStatus !== "success" || !sessionId) return;

    const verifyPayment = async () => {
      try {
        const session = await getCheckoutSession(sessionId);

        if (session.payment_status === "paid") {
          clearCart();
          setCheckoutError("");
          setCheckoutMessage("Pago confirmado con Stripe. Tu carrito se vacio correctamente.");
        } else {
          setCheckoutMessage("");
          setCheckoutError("Stripe devolvio la sesion, pero el pago aun no aparece como completado.");
        }
      } catch {
        setCheckoutMessage("");
        setCheckoutError("No pude verificar el pago con Stripe. Revisa la sesion o intenta de nuevo.");
      } finally {
        setSearchParams({}, { replace: true });
        setIsCheckingOut(false);
      }
    };

    verifyPayment();
  }, [searchParams, setSearchParams, clearCart]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setIsCheckingOut(true);
    setCheckoutMessage("");
    setCheckoutError("");

    try {
      const session = await createCheckoutSession(cart);
      window.location.href = session.url;
    } catch (error) {
      setCheckoutError(
        error.response?.data?.message || "No se pudo iniciar el checkout con Stripe."
      );
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
