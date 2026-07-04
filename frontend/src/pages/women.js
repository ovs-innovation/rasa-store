import React from "react";
import Layout from "@layout/Layout";
import ProductServices from "@services/ProductServices";
import AttributeServices from "@services/AttributeServices";
import ProductCard from "@components/product/ProductCard";
import CatalogPageLayout from "@components/common/CatalogPageLayout";

const WomenCollection = ({ products, attributes }) => {
  const list = products || [];

  return (
    <Layout title="Women" description="Women's sneakers, bags and streetwear at Rasa Store.">
      <CatalogPageLayout
        title="Women"
        description="Sneakers, bags and streetwear for women."
        count={list.length}
        emptyMessage="No items in this collection."
      >
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4 product-card-grid">
          {list.map((product) => (
            <ProductCard key={product._id} product={product} attributes={attributes} />
          ))}
        </div>
      </CatalogPageLayout>
    </Layout>
  );
};

export const getServerSideProps = async () => {
  try {
    const [data, attributes] = await Promise.all([
      ProductServices.getShowingStoreProducts({ category: "women" }),
      AttributeServices.getShowingAttributes(),
    ]);
    return {
      props: {
        products: data?.products || [],
        attributes: attributes || [],
      },
    };
  } catch (err) {
    console.error("Error fetching women collection:", err);
    return { props: { products: [], attributes: [] } };
  }
};

export default WomenCollection;
