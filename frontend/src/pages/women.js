import React from "react";
import Layout from "@layout/Layout";
import ProductServices from "@services/ProductServices";
import AttributeServices from "@services/AttributeServices";
import ProductCard from "@components/product/ProductCard";

const WomenCollection = ({ products, attributes }) => {
  return (
    <Layout title="Women Collection" description="Discover Rasa Store premium Women's collection - clothing, footwear, and accessories.">
      <div className="bg-white min-h-screen pb-16">
        {/* Editorial Banner */}
        <div className="relative bg-[#FAF9F6] py-16 px-4 border-b border-gray-100 mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-black mb-3">
            Women Collection
          </h1>
          <p className="text-gray-500 text-sm max-w-lg mx-auto font-medium">
            Discover minimalist silhouettes, relaxed fits, structured outerwear, and modern accessories designed with fine attention to detail.
          </p>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <span className="text-xs text-gray-400 font-extrabold uppercase tracking-widest">
              {products?.length || 0} Items Found
            </span>
          </div>

          {products?.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-bold uppercase tracking-wider">
              No items available in this collection.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} attributes={attributes} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps = async () => {
  try {
    const [data, attributes] = await Promise.all([
      ProductServices.getShowingStoreProducts({ category: "women" }),
      AttributeServices.getShowingAttributes()
    ]);
    return {
      props: {
        products: data?.products || [],
        attributes: attributes || []
      }
    };
  } catch (err) {
    console.error("Error fetching women collection data:", err);
    return {
      props: {
        products: [],
        attributes: []
      }
    };
  }
};

export default WomenCollection;
