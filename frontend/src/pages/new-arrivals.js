import React from "react";
import Layout from "@layout/Layout";
import ProductServices from "@services/ProductServices";
import AttributeServices from "@services/AttributeServices";
import ProductCard from "@components/product/ProductCard";
import CatalogPageLayout from "@components/common/CatalogPageLayout";

const NewArrivals = ({ products, attributes }) => {
  const list = products || [];

  return (
    <Layout title="New Arrivals" description="Latest sneakers, bags and streetwear from Rasa Store.">
      <CatalogPageLayout
        eyebrow="Fresh in"
        title="New Arrivals"
        description="Latest drops — sneakers, bags and streetwear essentials."
        count={list.length}
        emptyMessage="No new arrivals right now."
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
      ProductServices.getShowingStoreProducts({}),
      AttributeServices.getShowingAttributes(),
    ]);
    return {
      props: {
        products: data?.popularProducts || data?.products || [],
        attributes: attributes || [],
      },
    };
  } catch (err) {
    console.error("Error fetching new arrivals:", err);
    return { props: { products: [], attributes: [] } };
  }
};

export default NewArrivals;
