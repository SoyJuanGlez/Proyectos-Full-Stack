import { useCartStore } from "../../store/cartStore";

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();

  return (
    <div className="bg-gray-900 p-4 rounded-xl">
      <img src={product.image} className="h-56 w-full object-cover rounded-lg" />
      <h3 className="mt-3 font-semibold">{product.name}</h3>
      <p className="text-green-400">${product.price}</p>

      <button
        onClick={() => addToCart(product)}
        className="mt-3 w-full bg-green-500 text-black py-2 rounded-lg"
      >
        Agregar
      </button>
    </div>
  );
};

export default ProductCard;