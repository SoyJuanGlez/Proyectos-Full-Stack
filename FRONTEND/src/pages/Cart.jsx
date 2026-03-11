import { useCartStore } from "../store/cartStore";

const Cart = () => {
  const { cart, removeFromCart } = useCartStore();

  return (
    <div className="p-10">
      <h2 className="text-3xl mb-6">Carrito</h2>

      {cart.map((item) => (
        <div key={item._id} className="flex justify-between mb-4">
          <p>{item.name}</p>
          <button onClick={() => removeFromCart(item._id)}>
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
};

export default Cart;