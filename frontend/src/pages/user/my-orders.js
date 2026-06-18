import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { IoBagHandle, IoRefreshOutline, IoReceiptOutline, IoTimeOutline } from "react-icons/io5";
import { FiShoppingCart, FiEye, FiStar, FiPackage, FiTruck, FiCheck, FiX, FiClock } from "react-icons/fi";
import ReactPaginate from "react-paginate";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "react-use-cart";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import { setToken } from "@services/httpServices";

// internal imports
import Dashboard from "@pages/user/dashboard";
import useGetSetting from "@hooks/useGetSetting";
import OrderServices from "@services/OrderServices";
import Loading from "@components/preloader/Loading";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ReviewModal from "@components/reviews/ReviewModal";
import { SidebarContext } from "@context/SidebarContext";
import { UserContext } from "@context/UserContext";
import CMSkeletonTwo from "@components/preloader/CMSkeletonTwo";
import { notifySuccess, notifyError } from "@utils/toast";
import useCartDB from "@hooks/useCartDB";

/* ─── Status badge ─── */
const StatusBadge = ({ status }) => {
  const map = {
    "Order Placed": { bg: "bg-blue-100 text-blue-700 border-blue-200", dot: "bg-blue-500" },
    "Pending": { bg: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
    "Scheduled": { bg: "bg-indigo-100 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
    "Accepted": { bg: "bg-cyan-100 text-cyan-700 border-cyan-200", dot: "bg-cyan-500" },
    "Processing": { bg: "bg-orange-100 text-orange-700 border-orange-200", dot: "bg-orange-500" },
    "Order On The Way": { bg: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
    "Delivered": { bg: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    "Cancelled": { bg: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
    "Cancel": { bg: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
    "OutForDelivery": { bg: "bg-purple-100 text-purple-700 border-purple-200", dot: "bg-purple-500" },
    "Payment Failed": { bg: "bg-rose-100 text-rose-700 border-rose-200", dot: "bg-rose-500" },
    "Failed": { bg: "bg-rose-100 text-rose-700 border-rose-200", dot: "bg-rose-500" },
  };
  const s = map[status] || map.Pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider shadow-sm ${s.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
      {status || "Pending"}
    </span>
  );
};

/* ─── Payment method badge ─── */
const PaymentBadge = ({ method }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
    {method}
  </span>
);

/* ─── Product thumbnail strip ─── */
const ProductStrip = ({ cart = [] }) => {
  const visible = cart.slice(0, 3);
  const extra = cart.length - visible.length;
  return (
    <div className="flex items-center gap-1.5">
      {visible.map((item, i) => {
        const img =
          item.image ||
          (Array.isArray(item.productId?.image)
            ? item.productId.image[0]
            : item.productId?.image) ||
          "";
        return (
          <div
            key={i}
            className="w-9 h-9 rounded-lg border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0"
          >
            {img ? (
              <img
                src={img}
                alt={item.title || "product"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <FiPackage size={14} />
              </div>
            )}
          </div>
        );
      })}
      {extra > 0 && (
        <span className="w-9 h-9 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-500 font-semibold flex-shrink-0">
          +{extra}
        </span>
      )}
    </div>
  );
};

/* ─── Main Component ─── */
const MyOrders = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { currentPage, handleChangePage, isLoading, setIsLoading, setCartDrawerOpen } =
    useContext(SidebarContext);
  const { state: userState } = useContext(UserContext);

  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue, currency } = useUtilsFunction();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState(null);
  const [reorderingId, setReorderingId] = useState(null);

  // Cart
  const { addItemWithDB, clearCartWithDB } = useCartDB();

  // Auth from either next-auth session or cookie
  const userInfoCookie = Cookies.get("userInfo");
  const parsedUser = userInfoCookie ? JSON.parse(userInfoCookie) : null;
  const userId =
    session?.user?.id || parsedUser?._id || parsedUser?.id || null;
  const hasAuthToken = !!(session?.user?.token || parsedUser?.token);
  const isClientLoggedIn = status === "authenticated" || !!parsedUser;

  useEffect(() => {
    if (parsedUser?.token && !session?.user?.token) {
      setToken(parsedUser.token);
    }
  }, [parsedUser?.token, session?.user?.token]);

  const {
    data,
    error,
    isLoading: loading,
  } = useQuery({
    queryKey: ["orders", { currentPage, user: userId }],
    queryFn: async () =>
      await OrderServices.getOrderCustomer({ limit: 10, page: currentPage }),
    enabled: hasAuthToken && isClientLoggedIn,
  });

  const pageCount = Math.ceil(data?.totalDoc / 10);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  /* ─── Re-order handler ─── */
  const handleReorder = async (order) => {
    if (!order?.cart || !Array.isArray(order.cart) || order.cart.length === 0) {
      notifyError("No items found in this order.");
      return;
    }

    setReorderingId(order._id);
    try {
      // Clear local cart AND DB cart
      await clearCartWithDB();

      let addedCount = 0;

      for (const item of order.cart) {
        // product info may live in item or item.productId (populated)
        const product = item.productId || item;
        const productId = product?._id || item._id || item.id;
        if (!productId) return;

        const img = Array.isArray(product.image)
          ? product.image[0]
          : product.image || item.image || "";

        const itemToAdd = {
          id: String(productId),
          title: product.title?.en || product.title || item.title || "Product",
          price:
            item.price ||
            product.prices?.price ||
            product.prices?.originalPrice ||
            0,
          image: img,
          slug: product.slug || item.slug || "",
          quantity: item.quantity || 1,
          stock: product.stock,
        };

        await addItemWithDB(itemToAdd, item.quantity || 1);
        addedCount++;
      }

      if (addedCount > 0) {
        notifySuccess(
          `${addedCount} item${addedCount > 1 ? "s" : ""} added to your cart! You can now adjust quantities or add/remove items.`
        );
        // Open the cart drawer instead of redirecting to checkout
        setCartDrawerOpen(true);
      } else {
        notifyError("Could not add items — product data may be unavailable.");
      }
    } catch (err) {
      console.error("Re-order error:", err);
      notifyError("Something went wrong. Please try again.");
    } finally {
      setReorderingId(null);
    }
  };

  return (
    <>
      {isLoading ? (
        <Loading loading={isLoading} />
      ) : (
        <Dashboard
          title={
            showingTranslateValue(
              storeCustomizationSetting?.dashboard?.my_order
            ) || "My Orders"
          }
          description="User order history with re-order"
        >
          <div className="font-serif">
            {/* ── Header ── */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <IoReceiptOutline className="text-store-500" />
                  Order History
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  View & re-order your past purchases
                </p>
              </div>
              {data?.totalDoc > 0 && (
                <span className="bg-store-50 text-store-600 text-xs font-bold px-3 py-1.5 rounded-full border border-store-200">
                  {data.totalDoc} Order{data.totalDoc !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* ── Loading skeleton ── */}
            {loading ? (
              <CMSkeletonTwo
                count={20}
                width={100}
                error={error}
                loading={loading}
              />
            ) : data?.orders?.length === 0 ? (
              /* ── Empty state ── */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-store-50 rounded-full flex items-center justify-center mb-5">
                  <IoBagHandle className="text-store-400 text-4xl" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No Orders Yet
                </h3>
                <p className="text-sm text-gray-500 mb-6 max-w-xs">
                  Looks like you haven't placed any orders. Start shopping and
                  they'll appear here.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 bg-store-500 hover:bg-store-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
                >
                  <FiShoppingCart size={14} />
                  Start Shopping
                </Link>
              </div>
            ) : (
              <>
                {/* ─────────────────── DESKTOP TABLE ─────────────────── */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead>
                      <tr className="bg-gray-50">
                        {[
                          "Order ID",
                          "Date",
                          "Items",
                          "Payment",
                          "Status",
                          "Total",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {data?.orders?.map((order) => (
                        <tr
                          key={order._id}
                          className="hover:bg-gray-50/60 transition-colors group"
                        >
                          {/* Order ID */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="font-mono text-xs font-bold text-store-600 bg-store-50 px-2 py-1 rounded">
                              #{order?._id?.slice(-6).toUpperCase()}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-sm text-gray-700 font-medium">
                                {dayjs(order.createdAt).format("DD MMM YYYY")}
                              </span>
                              <span className="text-xs text-gray-400">
                                {dayjs(order.createdAt).format("hh:mm A")}
                              </span>
                            </div>
                          </td>

                          {/* Items preview */}
                          <td className="px-5 py-4">
                            <ProductStrip cart={order.cart} />
                            <span className="text-xs text-gray-400 mt-1 block">
                              {order.cart?.length || 0} item
                              {(order.cart?.length || 0) !== 1 ? "s" : ""}
                            </span>
                          </td>

                          {/* Payment */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <PaymentBadge method={order.paymentMethod} />
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <StatusBadge status={order.status} />
                          </td>

                          {/* Total */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-800">
                              {currency}
                              {parseFloat(order?.total || 0).toFixed(2)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/order/${order._id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                              >
                                <FiEye size={11} />
                                Invoice
                              </Link>

                              {/* Track Order */}
                              <Link
                                href={`/user/track-order?id=${order._id}`}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-store-50 text-store-600 border border-store-100 hover:bg-store-500 hover:text-white transition-all shadow-sm"
                              >
                                <FiTruck size={11} />
                                Track
                              </Link>

                              {/* Re-order */}
                              <button
                                type="button"
                                disabled={reorderingId === order._id}
                                onClick={() => handleReorder(order)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-store-500 text-white hover:bg-store-600 disabled:opacity-60 disabled:cursor-wait transition-all"
                              >
                                {reorderingId === order._id ? (
                                  <>
                                    <svg
                                      className="animate-spin h-3 w-3"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                    >
                                      <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                      />
                                      <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v8z"
                                      />
                                    </svg>
                                    Adding…
                                  </>
                                ) : (
                                  <>
                                    <IoRefreshOutline size={11} />
                                    Re-order
                                  </>
                                )}
                              </button>

                              {/* Review (delivered only) */}
                              {order.status === "Delivered" &&
                                order?.cart?.[0]?.slug && (
                                  <button
                                    type="button"
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white transition-all"
                                    onClick={() => {
                                      setSelectedProductForReview(
                                        order.cart[0]
                                      );
                                      setReviewModalOpen(true);
                                    }}
                                  >
                                    <FiStar size={11} />
                                    Review
                                  </button>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* ─────────────────── MOBILE CARDS ─────────────────── */}
                <div className="md:hidden space-y-4">
                  {data?.orders?.map((order) => (
                    <div
                      key={order._id}
                      className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
                    >
                      {/* Card header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                        <div>
                          <span className="font-mono text-xs font-bold text-store-600">
                            #{order?._id?.slice(-6).toUpperCase()}
                          </span>
                          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                            <IoTimeOutline size={11} />
                            {dayjs(order.createdAt).format("DD MMM YYYY · hh:mm A")}
                          </p>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>

                      {/* Card body */}
                      <div className="px-4 py-3">
                        {/* Items */}
                        <div className="flex items-center justify-between mb-3">
                          <ProductStrip cart={order.cart} />
                          <span className="text-xs text-gray-500">
                            {order.cart?.length || 0} item
                            {(order.cart?.length || 0) !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Meta row */}
                        <div className="flex items-center justify-between">
                          <PaymentBadge method={order.paymentMethod} />
                          <span className="text-sm font-extrabold text-gray-800">
                            {currency}
                            {parseFloat(order?.total || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Card footer – actions */}
                      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/order/${order._id}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                        >
                          <FiEye size={12} />
                          Invoice
                        </Link>

                        <Link
                          href={`/user/track-order?id=${order._id}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-store-50 border border-store-100 text-store-600 hover:bg-store-500 hover:text-white transition-all shadow-sm"
                        >
                          <FiTruck size={12} />
                          Track
                        </Link>

                        <button
                          type="button"
                          disabled={reorderingId === order._id}
                          onClick={() => handleReorder(order)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-store-500 text-white hover:bg-store-600 disabled:opacity-60 disabled:cursor-wait transition-all"
                        >
                          {reorderingId === order._id ? (
                            <>
                              <svg
                                className="animate-spin h-3 w-3"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8z"
                                />
                              </svg>
                              Adding…
                            </>
                          ) : (
                            <>
                              <IoRefreshOutline size={12} />
                              Re-order
                            </>
                          )}
                        </button>

                        {order.status === "Delivered" &&
                          order?.cart?.[0]?.slug && (
                            <button
                              type="button"
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-50 border border-amber-200 text-amber-600 hover:bg-amber-500 hover:text-white transition-all"
                              onClick={() => {
                                setSelectedProductForReview(order.cart[0]);
                                setReviewModalOpen(true);
                              }}
                            >
                              <FiStar size={12} />
                              Rate & Review
                            </button>
                          )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Pagination ── */}
                {data?.totalDoc > 10 && (
                  <div className="paginationOrder mt-6">
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel="Next →"
                      onPageChange={(e) =>
                        handleChangePage(e.selected + 1)
                      }
                      pageRangeDisplayed={3}
                      pageCount={pageCount}
                      previousLabel="← Prev"
                      renderOnZeroPageCount={null}
                      pageClassName="page--item"
                      pageLinkClassName="page--link"
                      previousClassName="page-item"
                      previousLinkClassName="page-previous-link"
                      nextClassName="page-item"
                      nextLinkClassName="page-next-link"
                      breakClassName="page--item"
                      breakLinkClassName="page--link"
                      containerClassName="pagination"
                      activeClassName="activePagination"
                      forcePage={currentPage - 1}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Review Modal ── */}
          {reviewModalOpen && selectedProductForReview && (
            <ReviewModal
              open={reviewModalOpen}
              onClose={() => setReviewModalOpen(false)}
              productSnapshot={selectedProductForReview}
            />
          )}
        </Dashboard>
      )}
    </>
  );
};

export default MyOrders;
