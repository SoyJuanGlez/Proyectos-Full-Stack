import { useMemo } from "react";
import { useCartStore } from "../store/cartStore";
import "../styles/cart.css";

const Cart = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    incrementQuantity,
    decrementQuantity,
  } = useCartStore();

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  return (
    <div className="cart">
      <div className="cart-header">
        <h1>Carrito de Compras</h1>
        <p>{cart.length} producto(s) en tu carrito</p>
      </div>

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
              <button className="btn btn-primary" disabled={total === 0}>Proceder al Pago</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;