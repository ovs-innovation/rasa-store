import { useState } from "react";
import { useCart } from "react-use-cart";
import { notifyError, notifySuccess } from "@utils/toast";
import useCartDB from "@hooks/useCartDB";

const useAddToCart = () => {
  const [item, setItem] = useState(1);
  const { items } = useCart();
  const { addItemWithDB, updateQuantityWithDB } = useCartDB();

  // Helper: return available stock number
  const getAvailableStock = (product) => {
    if (!product) return Number.MAX_SAFE_INTEGER;
    if (product?.variants?.length > 0) {
      if (
        product?.variant &&
        typeof product.variant.quantity === "number"
      )
        return Number(product.variant.quantity);
      if (
        product?.variants[0] &&
        typeof product.variants[0].quantity === "number"
      )
        return Number(product.variants[0].quantity);
    }
    if (typeof product?.stock === "number") return Number(product.stock);
    return Number.MAX_SAFE_INTEGER;
  };

  /**
   * handleAddItem
   * Adds a product to the local cart AND persists it to the database.
   */
  const handleAddItem = async (product, qty) => {
    const quantityToAdd = typeof qty === "number" ? qty : item;
    const result = items.find((i) => i.id === product.id);

    const { variants, categories, description, ...updatedProduct } = product;

    const effectivePrice =
      product.prices?.price ||
      product.prices?.originalPrice ||
      product.price ||
      0;

    updatedProduct.price = effectivePrice;
    updatedProduct.stock =
      product?.stock !== undefined
        ? product.stock
        : product?.variants && product.variants[0]
          ? product.variants[0].quantity
          : undefined;

    const available = getAvailableStock(product);

    if (result !== undefined) {
      if (result?.quantity + quantityToAdd <= available) {
        await addItemWithDB(updatedProduct, quantityToAdd);
        notifySuccess(`${quantityToAdd} ${product.title} added to cart!`);
      } else {
        notifyError("Insufficient stock!");
      }
    } else {
      if (quantityToAdd <= available) {
        await addItemWithDB(updatedProduct, quantityToAdd);
        notifySuccess(`${quantityToAdd} ${product.title} added to cart!`);
      } else {
        notifyError("Insufficient stock!");
      }
    }
  };

  /**
   * handleIncreaseQuantity
   * Increments quantity by 1, updating both local cart and DB.
   */
  const handleIncreaseQuantity = async (product) => {
    const result = items?.find((p) => p.id === product.id);
    const available = getAvailableStock(product);

    if (result) {
      if (result?.quantity + 1 <= available) {
        await updateQuantityWithDB(product.id, result.quantity + 1);
      } else {
        notifyError("Insufficient stock!");
      }
    }
  };

  return {
    setItem,
    item,
    handleAddItem,
    handleIncreaseQuantity,
  };
};
export default useAddToCart;
