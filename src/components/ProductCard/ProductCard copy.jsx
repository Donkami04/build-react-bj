import { FaPlus } from "react-icons/fa6";
import { FaMinus } from "react-icons/fa";
import "./ProductCard.css";

export const ProductCard = ({ data, addToShopcar, removeFromShopcar }) => {
  const name = data.name.toUpperCase();
  const value = data.sale_price.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return (
    <div className="product-card">
      <div className="name-product-container">
        <p>{name}</p>
      </div>
      <div className="product-image-container">
        <img src="" alt="" />
      </div>
      <div className="add-remove-buttons-container">
        <p className="add-product-button" onClick={() => addToShopcar(data)}>
          <FaPlus />
        </p>
        <p className="remove-product-button" onClick={() => removeFromShopcar(data)}>
          <FaMinus />
        </p>
      </div>
      <div className="price-product-container">
        <p>{value}</p>
      </div>
    </div>
  );
};
