import React from "react";
import Layout from "@layout/Layout";
import ProductServices from "@services/ProductServices";
import AttributeServices from "@services/AttributeServices";
import ProductCard from "@components/product/ProductCard";
import CatalogPageLayout from "@components/common/CatalogPageLayout";

const TrendingCollection = ({ products, attributes }) => {
  const list = products || [];

  return (
    <Layout title="Trending" description="Best-selling sneakers and streetwear at Rasa Store.">
      <CatalogPageLayout
        eyebrow="Most wanted"
        title="Trending Now"
        description="This week's best-selling picks."
        count={list.length}
        emptyMessage="No trending items right now."
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
        products: data?.bestSellingProducts || data?.products || [],
        attributes: attributes || [],
      },
    };
  } catch (err) {
    console.error("Error fetching trending:", err);
    return { props: { products: [], attributes: [] } };
  }
};

export default TrendingCollection;
