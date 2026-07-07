import React from "react";
import { useParams } from "react-router-dom";
import ProductFormPage from "@/components/product/ProductFormPage";

const EditProduct = () => {
  const { id } = useParams();
  return <ProductFormPage productId={id} />;
};

export default EditProduct;
