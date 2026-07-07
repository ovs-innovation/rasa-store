import {
  Pagination,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
} from "@windmill/react-ui";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiSearch } from "react-icons/fi";

import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import ModernStats from "@/components/dashboard/ModernStats";
import DetailedOrderStatus from "@/components/dashboard/DetailedOrderStatus";
import OrderTable from "@/components/order/OrderTable";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import OrderServices from "@/services/OrderServices";
import AnimatedContent from "@/components/common/AnimatedContent";

const Dashboard = () => {
  const { t } = useTranslation();
  const { currentPage, handleChangePage } = useContext(SidebarContext);
  const [timeFilter, setTimeFilter] = useState("year");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: dashboardRecentOrder, loading: loadingRecentOrder, error } =
    useAsync(() =>
      OrderServices.getDashboardRecentOrder({ page: currentPage, limit: 8 })
    );

  const { data: dashboardOrderCount } = useAsync(
    OrderServices.getDashboardCount
  );

  const { data: dashboardOrderAmount } = useAsync(
    OrderServices.getDashboardAmount
  );

  const { dataTable } = useFilter(dashboardRecentOrder?.orders);

  const filteredData = dataTable?.filter(
    (order) =>
      String(order.invoice || "")
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.user_info?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageTitle>{t("DashboardOverview")}</PageTitle>

      <AnimatedContent>
        <div className="space-y-6">
          <ModernStats
            dashboardOrderCount={dashboardOrderCount}
            timeFilter={timeFilter}
            setTimeFilter={setTimeFilter}
            dashboardOrderAmount={dashboardOrderAmount}
          />
          <DetailedOrderStatus dashboardOrderCount={dashboardOrderCount} />
        </div>
      </AnimatedContent>

      <section className="mt-8 dark:bg-[#0f0f0f] bg-white rounded-3xl shadow-sm border border-gray-100 dark:border-white/[0.06] overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4 md:px-6 py-5 border-b border-gray-100 dark:border-white/[0.05]">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {t("RecentOrder")}
          </h2>

          <div className="relative">
            <input
              type="text"
              placeholder="Search invoice or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 h-10 pl-4 pr-10 bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-sm outline-none focus:border-[#D4AF37]/50"
            />
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>

        {loadingRecentOrder ? (
          <div className="p-6">
            <TableLoading row={5} col={4} />
          </div>
        ) : error ? (
          <div className="p-10 text-center text-rose-500">{error}</div>
        ) : filteredData?.length ? (
          <TableContainer className="mb-0 border-none shadow-none">
            <Table className="w-full">
              <TableHeader>
                <tr>
                  <TableCell>{t("InvoiceNo")}</TableCell>
                  <TableCell>{t("TimeTbl")}</TableCell>
                  <TableCell>{t("CustomerName")}</TableCell>
                  <TableCell className="text-center">{t("MethodTbl")}</TableCell>
                  <TableCell>{t("AmountTbl")}</TableCell>
                  <TableCell>{t("OderStatusTbl")}</TableCell>
                  <TableCell className="text-center">{t("ActionTbl")}</TableCell>
                </tr>
              </TableHeader>

              <OrderTable
                orders={filteredData}
                visibleColumns={{
                  invoice: true,
                  time: true,
                  customerName: true,
                  method: true,
                  amount: true,
                  status: true,
                  action: true,
                  actions: false,
                }}
              />
            </Table>

            <TableFooter>
              <Pagination
                totalResults={dashboardRecentOrder?.totalOrder}
                resultsPerPage={8}
                onChange={handleChangePage}
                label="Table navigation"
              />
            </TableFooter>
          </TableContainer>
        ) : (
          <div className="p-6">
            <NotFound title="Sorry, There are no orders right now." />
          </div>
        )}
      </section>
    </>
  );
};

export default Dashboard;
