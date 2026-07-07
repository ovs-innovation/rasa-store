import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { IoRefreshOutline } from "react-icons/io5";
import ReactPaginate from "react-paginate";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import { setToken } from "@services/httpServices";

import UserDashboardLayout from "@components/user/UserDashboardLayout";
import useGetSetting from "@hooks/useGetSetting";
import OrderServices from "@services/OrderServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import { SidebarContext } from "@context/SidebarContext";
import { notifySuccess, notifyError } from "@utils/toast";
import useCartDB from "@hooks/useCartDB";
import { UD } from "@components/user/userDashboardTheme";
import withNoSsr from "@utils/withNoSsr";

const statusStyle = (status) => {
  if (status === "Delivered") return "text-emerald-400 bg-emerald-950/40 border-emerald-900/30";
  if (status === "Cancel" || status === "Cancelled") return "text-red-400 bg-red-950/40 border-red-900/30";
  return "text-amber-400 bg-amber-950/40 border-amber-900/30";
};

const MyOrders = () => {
  const { data: session, status } = useSession();
  const { currentPage, handleChangePage, setCartDrawerOpen } = useContext(SidebarContext);
  const { storeCustomizationSetting } = useGetSetting();
  const { showingTranslateValue, currency } = useUtilsFunction();
  const [reorderingId, setReorderingId] = useState(null);
  const [mounted, setMounted] = useState(false);
  const { addItemWithDB, clearCartWithDB } = useCartDB();

  useEffect(() => {
    setMounted(true);
  }, []);

  const parsedUser = mounted && Cookies.get("userInfo") ? JSON.parse(Cookies.get("userInfo")) : null;
  const userId = session?.user?.id || parsedUser?._id || parsedUser?.id;
  const hasAuthToken = !!(session?.user?.token || parsedUser?.token);
  const isClientLoggedIn = mounted && (status === "authenticated" || !!parsedUser);

  useEffect(() => {
    if (parsedUser?.token && !session?.user?.token) setToken(parsedUser.token);
  }, [parsedUser?.token, session?.user?.token]);

  const { data, isLoading: loading } = useQuery({
    queryKey: ["orders", { currentPage, user: userId }],
    queryFn: () => OrderServices.getOrderCustomer({ limit: 10, page: currentPage }),
    enabled: hasAuthToken && isClientLoggedIn,
  });

  const pageCount = Math.ceil((data?.totalDoc || 0) / 10);

  const handleReorder = async (order) => {
    if (!order?.cart?.length) {
      notifyError("No items found in this order.");
      return;
    }
    setReorderingId(order._id);
    try {
      await clearCartWithDB();
      let addedCount = 0;
      for (const item of order.cart) {
        const product = item.productId || item;
        const productId = product?._id || item._id || item.id;
        if (!productId) continue;
        const img = Array.isArray(product.image) ? product.image[0] : product.image || item.image || "";
        await addItemWithDB(
          {
            id: String(productId),
            title: product.title?.en || product.title || item.title || "Product",
            price: item.price || product.prices?.price || product.prices?.originalPrice || 0,
            image: img,
            slug: product.slug || item.slug || "",
            quantity: item.quantity || 1,
            stock: product.stock,
          },
          item.quantity || 1
        );
        addedCount++;
      }
      if (addedCount > 0) {
        notifySuccess(`${addedCount} item${addedCount > 1 ? "s" : ""} added to cart`);
        setCartDrawerOpen(true);
      } else {
        notifyError("Could not add items.");
      }
    } catch {
      notifyError("Something went wrong.");
    } finally {
      setReorderingId(null);
    }
  };

  return (
    <UserDashboardLayout
      title={showingTranslateValue(storeCustomizationSetting?.dashboard?.my_order) || "My Orders"}
      description="Your order history"
    >
      <div className="space-y-5">
        <div>
          <h1 className={UD.pageTitle}>
            {showingTranslateValue(storeCustomizationSetting?.dashboard?.my_order) || "My Orders"}
          </h1>
          <p className={UD.pageSubtitle}>
            {data?.totalDoc ? `${data.totalDoc} order${data.totalDoc !== 1 ? "s" : ""}` : "View your past purchases"}
          </p>
        </div>

        {loading ? (
          <p className={UD.muted}>Loading...</p>
        ) : !data?.orders?.length ? (
          <div className={`${UD.panelPad} ${UD.empty}`}>
            <p className="mb-4">No orders yet</p>
            <Link href="/" className={UD.btnPrimary}>Start Shopping</Link>
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {data.orders.map((order) => (
                <li key={order._id} className={UD.panelPad}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-white">
                        Order #{order._id?.slice(-6).toUpperCase()}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {dayjs(order.createdAt).format("DD MMM YYYY · hh:mm A")}
                        {order.paymentMethod ? ` · ${order.paymentMethod}` : ""}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded border ${statusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-neutral-800">
                    <p className="text-base font-semibold text-[#D4AF37]">
                      {currency}{parseFloat(order.total || 0).toFixed(2)}
                      <span className="text-xs text-neutral-500 font-normal ml-2">
                        {order.cart?.length || 0} item{(order.cart?.length || 0) !== 1 ? "s" : ""}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/order/${order._id}`} className={UD.btnSecondary}>View</Link>
                      <Link href={`/user/track-order?id=${order._id}`} className={UD.btnSecondary}>Track</Link>
                      <button
                        type="button"
                        disabled={reorderingId === order._id}
                        onClick={() => handleReorder(order)}
                        className={UD.btnPrimary}
                      >
                        {reorderingId === order._id ? "Adding..." : (
                          <><IoRefreshOutline size={14} /> Re-order</>
                        )}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {data.totalDoc > 10 && (
              <div className="paginationOrder">
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Next"
                  onPageChange={(e) => handleChangePage(e.selected + 1)}
                  pageRangeDisplayed={3}
                  pageCount={pageCount}
                  previousLabel="Prev"
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
    </UserDashboardLayout>
  );
};

export default withNoSsr(MyOrders);
