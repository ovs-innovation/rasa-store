import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { FiSearch, FiPackage } from "react-icons/fi";
import Cookies from "js-cookie";

import UserDashboardLayout from "@components/user/UserDashboardLayout";
import OrderServices from "@services/OrderServices";
import OrderTracking from "@components/order/OrderTracking";
import { setToken } from "@services/httpServices";
import { UD } from "@components/user/userDashboardTheme";
import withNoSsr from "@utils/withNoSsr";

const TrackOrder = () => {
  const router = useRouter();
  const { id } = router.query;
  const [orderIdInput, setOrderIdInput] = useState(id || "");

  useEffect(() => {
    const userInfo = Cookies.get("userInfo");
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      if (parsedUser?.token) setToken(parsedUser.token);
    }
  }, []);

  useEffect(() => {
    if (id) setOrderIdInput(id);
  }, [id]);

  const { data: order, isLoading, error } = useOrderQuery(id);

  const handleSearch = (e) => {
    e.preventDefault();
    if (orderIdInput.trim()) {
      router.push(`/user/track-order?id=${orderIdInput.trim()}`);
    }
  };

  return (
    <UserDashboardLayout title="Track Order" description="Track your order">
      <div className="max-w-2xl space-y-5">
        <div>
          <h1 className={UD.pageTitle}>Track Order</h1>
          <p className={UD.pageSubtitle}>Enter your order ID to see status</p>
        </div>

        <div className={UD.panelPad}>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 w-4 h-4" />
              <input
                type="text"
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="Order ID"
                className={`${UD.input} pl-10`}
              />
            </div>
            <button type="submit" className={UD.btnPrimary}>Track</button>
          </form>
        </div>

        {isLoading && id && <p className={UD.muted}>Loading order...</p>}

        {error && id && (
          <div className={`${UD.panelPad} text-center`}>
            <p className="text-red-400 text-sm">Order not found. Check the ID from My Orders.</p>
          </div>
        )}

        {order && (
          <div className="space-y-4">
            <div className={`${UD.panelPad} flex flex-wrap gap-4 justify-between`}>
              <div>
                <p className="text-xs text-neutral-500">Order ID</p>
                <p className="text-sm text-white font-mono">#{order._id?.slice(-8)}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Placed</p>
                <p className="text-sm text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Total</p>
                <p className="text-sm text-[#D4AF37]">₹{parseFloat(order.total).toFixed(2)}</p>
              </div>
            </div>
            <OrderTracking order={order} />
          </div>
        )}

        {!id && !order && (
          <div className={`${UD.panelPad} ${UD.empty}`}>
            <FiPackage className="w-8 h-8 mx-auto mb-3 text-neutral-600" />
            <p>Enter an order ID above to track your package</p>
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
};

const useOrderQuery = (id) =>
  useQuery({
    queryKey: ["order", id],
    queryFn: () => OrderServices.getOrderById(id),
    enabled: !!id,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  });

export default withNoSsr(TrackOrder);
