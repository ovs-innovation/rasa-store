import ProductCard from "@components/product/ProductCard";

const HomeProductCarousel = ({ products, attributes }) => {
  if (!products?.length) return null;

  // Strictly display the two products side-by-side simultaneously.
  // No carousel, no Swiper, no swipe gestures, no pagination dots, no hydration flicker.
  const displayProducts = products.slice(0, 2);

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-stretch">
      {displayProducts.map((product) => (
        <div key={product._id} className="min-w-0 w-full">
          <ProductCard product={product} attributes={attributes} />
        </div>
      ))}
    </div>
  );
};

export default HomeProductCarousel;
