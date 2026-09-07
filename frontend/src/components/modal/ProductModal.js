import useTranslation from "next-translate/useTranslation";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { FiMinus, FiPlus } from "react-icons/fi";

//internal import
import Price from "@components/common/Price";
import Stock from "@components/common/Stock";
import Tags from "@components/common/Tags";
import { notifyError } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import MainModal from "@components/modal/MainModal";
import Discount from "@components/common/Discount";
import VariantList from "@components/variants/VariantList";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useGetSetting from "@hooks/useGetSetting";
import { handleLogEvent } from "src/lib/analytics";

const ProductModal = ({
  modalOpen,
  setModalOpen,
  product,
  attributes,
  currency,
}) => {
  const router = useRouter();
  const { setIsLoading, isLoading } = useContext(SidebarContext);
  const { t } = useTranslation("ns1");

  const { handleAddItem, setItem, item } = useAddToCart();
  const { lang, showingTranslateValue, getNumber, getNumberTwo } =
    useUtilsFunction();
  const { storeCustomizationSetting, globalSetting } = useGetSetting();

  // react hook
  const [value, setValue] = useState("");
  const [price, setPrice] = useState(0);
  const [img, setImg] = useState("");
  const [originalPrice, setOriginalPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [selectVariant, setSelectVariant] = useState({});
  const [selectVa, setSelectVa] = useState({});
  const [variantTitle, setVariantTitle] = useState([]);
  const [variants, setVariants] = useState([]);

  // Customer-entered Color and Size
  const [customColor, setCustomColor] = useState("");
  const [customSize, setCustomSize] = useState("");
  const [colorError, setColorError] = useState(false);
  const [sizeError, setSizeError] = useState(false);

  const colorSuggestions = React.useMemo(() => {
    const list = new Set();
    if (Array.isArray(product?.colorVariants)) {
      product.colorVariants.forEach((cv) => {
        if (cv?.color) cv.color.split(",").forEach((c) => { const t = c.trim(); if (t) list.add(t); });
      });
    }
    if (Array.isArray(product?.variants)) {
      product.variants.forEach((v) => {
        if (v?.color) v.color.split(",").forEach((c) => { const t = c.trim(); if (t) list.add(t); });
      });
    }
    return Array.from(list);
  }, [product]);

  const sizeSuggestions = React.useMemo(() => {
    const list = new Set();
    ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10"].forEach((s) => list.add(s));
    if (Array.isArray(product?.variants)) {
      product.variants.forEach((v) => {
        if (v?.size) { const t = v.size.trim(); if (t) list.add(t); }
      });
    }
    return Array.from(list);
  }, [product]);

  useEffect(() => {
    // console.log('value', value, product);
    if (value) {
      const result = product?.variants?.filter((variant) =>
        Object.keys(selectVa).every((k) => selectVa[k] === variant[k])
      );

      const res = result?.map(
        ({
          originalPrice,
          price,
          discount,
          quantity,
          barcode,
          sku,
          productId,
          image,
          ...rest
        }) => ({
          ...rest,
        })
      );

      const filterKey = Object.keys(Object.assign({}, ...res));
      const selectVar = filterKey?.reduce(
        (obj, key) => ({ ...obj, [key]: selectVariant[key] }),
        {}
      );
      const newObj = Object.entries(selectVar).reduce(
        (a, [k, v]) => (v ? ((a[k] = v), a) : a),
        {}
      );

      const result2 = result?.find((v) =>
        Object.keys(newObj).every((k) => newObj[k] === v[k])
      );

      // console.log("result2", result2);

      if (result.length <= 0 || result2 === undefined) return setStock(0);

      setVariants(result);
      setSelectVariant(result2);
      setSelectVa(result2);
      setImg(result2?.image);
      setStock(result2?.quantity);
      const variantPrice = getNumber(result2?.price);
      const variantOriginalPrice = getNumber(result2?.originalPrice);
      const discountPercentage = getNumber(((variantOriginalPrice - variantPrice) / (variantOriginalPrice || variantPrice)) * 100);
      setDiscount(getNumber(discountPercentage));
      setPrice(variantPrice);
      setOriginalPrice(variantOriginalPrice);
    } else if (product?.variants?.length > 0) {
      const result = product?.variants?.filter((variant) =>
        Object.keys(selectVa).every((k) => selectVa[k] === variant[k])
      );

      setVariants(result);
      setStock(product.variants[0]?.quantity);
      setSelectVariant(product.variants[0]);
      setSelectVa(product.variants[0]);
      setImg(product.variants[0]?.image);
      const variantPrice0 = getNumber(product.variants[0]?.price);
      const variantOriginalPrice0 = getNumber(product.variants[0]?.originalPrice);
      const discountPercentage0 = getNumber(((variantOriginalPrice0 - variantPrice0) / (variantOriginalPrice0 || variantPrice0)) * 100);
      setDiscount(getNumber(discountPercentage0));
      setPrice(variantPrice0);
      setOriginalPrice(variantOriginalPrice0);
    } else {
      setStock(product?.stock);
      setImg(product?.image?.[0] || product?.images?.[0]);
      const retailPrice = getNumber(product?.prices?.price);
      const retailOriginalPrice = getNumber(product?.prices?.originalPrice);
      const discountPercentage = getNumber(((retailOriginalPrice - retailPrice) / (retailOriginalPrice || retailPrice)) * 100);
      setDiscount(getNumber(discountPercentage));
      setPrice(retailPrice);
      setOriginalPrice(retailOriginalPrice);
    }
  }, [
    product?.prices?.discount,
    product?.prices?.originalPrice,
    product?.prices?.price,
    product?.stock,
    product.variants,
    selectVa,
    selectVariant,
    value,
  ]);
  // console.log("product", product);

  useEffect(() => {
    const res = Object.keys(Object.assign({}, ...product?.variants));

    const varTitle = attributes?.filter((att) => res.includes(att?._id));

    setVariantTitle(varTitle?.sort());
  }, [variants, attributes]);

  const handleAddToCart = (p) => {
    if (stock <= 0) return notifyError("Insufficient stock");

    const cleanColor = customColor.trim();
    const cleanSize = customSize.trim();

    let hasError = false;
    if (!cleanColor) {
      setColorError(true);
      hasError = true;
    }
    if (!cleanSize) {
      setSizeError(true);
      hasError = true;
    }

    if (hasError) {
      return notifyError("Please enter your desired Color and Size");
    }

    const { variants, categories, description, ...updatedProduct } = product;
    const priceToUse = price > 0 ? getNumber(price) : getNumber(p.prices?.price || 0);
    const originalToUse = originalPrice > 0 ? getNumber(originalPrice) : getNumber(p.prices?.originalPrice || priceToUse);

    const colorKey = cleanColor.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const sizeKey = cleanSize.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const cartItemId = `${p._id}-${colorKey}-${sizeKey}`;

    const newItem = {
      ...updatedProduct,
      id: cartItemId,
      productId: p._id,
      title: showingTranslateValue(p.title),
      color: cleanColor,
      size: cleanSize,
      image: img || product.image?.[0] || product.images?.[0],
      price: priceToUse,
      originalPrice: originalToUse,
      variant: {
        color: cleanColor,
        size: cleanSize,
      },
    };

    handleAddItem(newItem, item);
    setModalOpen(false);
  };

  const handleMoreInfo = (slug) => {
    setModalOpen(false);

    router.push(`/product/${slug}`);
    setIsLoading(!isLoading);
    handleLogEvent("product", `opened ${slug} product details`);
  };

  const category_name = showingTranslateValue(product?.category?.name)
    ?.toLowerCase()
    ?.replace(/[^A-Z0-9]+/gi, "-");

  // console.log("product", product, "stock", stock);

  return (
    <>
      <MainModal modalOpen={modalOpen} setModalOpen={setModalOpen}>
        <div className="inline-block overflow-y-auto h-full align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          <div className="flex flex-col lg:flex-row md:flex-row w-full max-w-4xl overflow-hidden">
            <Link href={`/product/${product.slug}`} passHref>
              <div
                onClick={() => setModalOpen(false)}
                className="flex-shrink-0 flex items-center justify-center h-auto cursor-pointer"
              >
                <Discount product={product} discount={discount} modal />
                {product.image[0] ? (
                  <Image
                    src={img || product.image[0]}
                    width={420}
                    height={420}
                    alt="product"
                  />
                ) : (
                  <Image
                    src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
                    width={420}
                    height={420}
                    alt="product Image"
                  />
                )}
              </div>
            </Link>

            <div className="w-full flex flex-col p-5 md:p-8 text-left">
              <div className="mb-2 md:mb-2.5 block -mt-1.5">
                <Link href={`/product/${product.slug}`} passHref>
                  <h1
                    onClick={() => setModalOpen(false)}
                    className="text-heading text-lg md:text-xl lg:text-2xl font-semibold font-serif hover:text-black cursor-pointer"
                  >
                    {showingTranslateValue(product?.title)}
                  </h1>
                </Link>
                <div
                  className={`${
                    stock <= 0 ? "relative py-1 mb-2" : "relative"
                  }`}
                >
                  <Stock stock={stock} />
                </div>
              </div>
              <p className="text-sm leading-6 text-gray-400 md:leading-6 whitespace-pre-line">
                {showingTranslateValue(product?.description)}
              </p>
              <div className="flex items-center my-4">
                <Price
                  product={product}
                  price={price}
                  currency={currency}
                  originalPrice={originalPrice}
                />
              </div>
 

              <div className="mb-4 space-y-3">
                {/* Color input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-700">
                      Color <span className="text-red-500">*</span>
                    </label>
                    {customColor && (
                      <span className="text-xs text-[#D4AF37] font-medium">{customColor}</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => {
                      setCustomColor(e.target.value);
                      if (colorError) setColorError(false);
                    }}
                    placeholder="Enter color (e.g. Maroon, Black, White)"
                    className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none transition-colors ${
                      colorError ? "border-red-500" : "border-gray-300 focus:border-[#D4AF37]"
                    }`}
                  />
                  {colorError && (
                    <p className="text-xs text-red-500 mt-0.5">Please enter color</p>
                  )}
                  {colorSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {colorSuggestions.map((c, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setCustomColor(c);
                            setColorError(false);
                            const matched = product?.colorVariants?.find(
                              (cv) => cv.color && cv.color.toLowerCase().includes(c.toLowerCase())
                            );
                            if (matched?.images?.[0]) setImg(matched.images[0]);
                          }}
                          className={`px-2 py-0.5 text-xs rounded border transition-all ${
                            customColor.toLowerCase() === c.toLowerCase()
                              ? "bg-[#D4AF37] text-black font-semibold border-[#D4AF37]"
                              : "bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Size input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-700">
                      Size <span className="text-red-500">*</span>
                    </label>
                    {customSize && (
                      <span className="text-xs text-[#D4AF37] font-medium">{customSize}</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={customSize}
                    onChange={(e) => {
                      setCustomSize(e.target.value);
                      if (sizeError) setSizeError(false);
                    }}
                    placeholder="Enter size (e.g. UK 8, UK 9, UK 10)"
                    className={`w-full h-10 px-3 rounded-lg border text-sm focus:outline-none transition-colors ${
                      sizeError ? "border-red-500" : "border-gray-300 focus:border-[#D4AF37]"
                    }`}
                  />
                  {sizeError && (
                    <p className="text-xs text-red-500 mt-0.5">Please enter size</p>
                  )}
                  {sizeSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {sizeSuggestions.map((s, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setCustomSize(s);
                            setSizeError(false);
                          }}
                          className={`px-2 py-0.5 text-xs rounded border transition-all ${
                            customSize.toLowerCase() === s.toLowerCase()
                              ? "bg-[#D4AF37] text-black font-semibold border-[#D4AF37]"
                              : "bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-400"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center mt-4">
                <div className="flex items-center justify-between space-s-3 sm:space-s-4 w-full">
                  <div className="group flex items-center justify-between rounded-md overflow-hidden flex-shrink-0 border h-11 md:h-12 border-gray-300">
                    <button
                      onClick={() => setItem(Math.max(item - 1, 1))}
                      disabled={item <= 1}
                      className="flex items-center justify-center flex-shrink-0 h-full transition ease-in-out duration-300 focus:outline-none w-8 md:w-12 text-heading border-e border-gray-300 hover:text-gray-500"
                    >
                      <span className="text-dark text-base">
                        <FiMinus />
                      </span>
                    </button>
                    <p className="font-semibold flex items-center justify-center h-full  transition-colors duration-250 ease-in-out cursor-default flex-shrink-0 text-base text-heading w-8  md:w-20 xl:w-24">
                      {item}
                    </p>
                    <button
                      onClick={() => setItem(Math.min(item + 1, stock || 0))}
                      disabled={item >= (stock || 0)}
                      className="flex items-center justify-center h-full flex-shrink-0 transition ease-in-out duration-300 focus:outline-none w-8 md:w-12 text-heading border-s border-gray-300 hover:text-gray-500"
                    >
                      <span className="text-dark text-base">
                        <FiPlus />
                      </span>
                    </button>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.quantity < 1}
                    className={`text-sm leading-4 inline-flex items-center cursor-pointer transition ease-in-out duration-300 font-semibold font-serif text-center justify-center border-0 border-transparent rounded-md focus-visible:outline-none focus:outline-none text-white px-4 ml-4 md:px-6 lg:px-8 py-4 md:py-3.5 lg:py-4 hover:text-white bg-${(require('@hooks/useGetSetting').default()?.storeCustomizationSetting?.theme?.color) || 'green'}-500 hover:bg-${(require('@hooks/useGetSetting').default()?.storeCustomizationSetting?.theme?.color) || 'green'}-600 w-full h-12`}
                  >
                    {t("common:addToCart")}
                  </button>
                </div>
              </div>
              <div className="flex items-center mt-4">
                <div className="flex items-center justify-between space-s-3 sm:space-s-4 w-full">
                  <div>
                    <span className="font-serif font-semibold py-1 text-sm d-block">
                      <span className="text-gray-700">
                        {t("common:category")}:
                      </span>{" "}
                      <Link
                        href={`/search?category=${category_name}&_id=${product?.category?._id}`}
                      >
                        <button
                          type="button"
                          className="text-gray-600 font-serif font-medium underline ml-2 hover:text-teal-600"
                          onClick={() => setIsLoading(!isLoading)}
                        >
                          {category_name}
                        </button>
                      </Link>
                    </span>

                    <Tags product={product} />
                  </div>

                  <div>
                    <button
                      onClick={() => handleMoreInfo(product.slug)}
                      className="font-sans font-medium text-sm text-orange-500"
                    >
                      {t("common:moreInfo")}
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <p className="text-xs sm:text-sm text-gray-600">
                  WhatsApp Us To Order :{" "}
                  <a
                    href="https://wa.me/919731308713"
                    target="_blank"
                    rel="noreferrer"
                    className="text-store-500 font-semibold hover:text-store-600 hover:underline"
                  >
                    9731308713
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </MainModal>
    </>
  );
};

export default ProductModal;
