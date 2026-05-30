import {
  Button,
  Card,
  CardBody,
  Input,
  Label,
  Pagination,
  Select,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
} from "@windmill/react-ui";
import { useContext, useState, useRef, useEffect } from "react";
import { IoCloudDownloadOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import exportFromJSON from "export-from-json";
import { FiCheck, FiRefreshCw, FiShoppingCart, FiTruck, FiXCircle, FiList, FiChevronDown, FiSearch, FiCreditCard, FiCalendar, FiAlignLeft, FiZap } from "react-icons/fi";

//internal import
import { notifyError } from "@/utils/toast";
import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import OrderServices from "@/services/OrderServices";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import OrderTable from "@/components/order/OrderTable";
import TableLoading from "@/components/preloader/TableLoading";
import spinnerLoadingImage from "@/assets/img/spinner.gif";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import AnimatedContent from "@/components/common/AnimatedContent";
import CardItem from "@/components/dashboard/CardItem";

const Orders = () => {
  const {
    time,
    setTime,
    status,
    endDate,
    setStatus,
    setEndDate,
    startDate,
    currentPage,
    searchText,
    searchRef,
    method,
    setMethod,
    userRole,
    setUserRole,
    setStartDate,
    setSearchText,
    handleChangePage,
    handleSubmitForAll,
    resultsPerPage,
  } = useContext(SidebarContext);

  const { t } = useTranslation();

  const [loadingExport, setLoadingExport] = useState(false);
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const columnToggleRef = useRef(null);

  const [visibleColumns, setVisibleColumns] = useState({
    invoice: true,
    time: true,
    customerName: true,
    productName: false,
    contact: true,
    shippingCost: false,
    discount: false,
    method: true,
    amount: true,
    status: true,
    action: true,
    actions: true,
  });

  const toggleColumn = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  useEffect(() => {
    setStatus("");
    // Also reset any other filters that shouldn't be here
  }, [setStatus]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        columnToggleRef.current &&
        !columnToggleRef.current.contains(event.target)
      ) {
        setShowColumnToggle(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data, loading, error } = useAsync(() =>
    OrderServices.getAllOrders({
      day: time,
      method: method,
      status: status,
      page: currentPage,
      endDate: endDate,
      startDate: startDate,
      limit: resultsPerPage,
      customerName: searchText,
      userRole: userRole,
    })
  );

  const { data: dashboardOrderCount, loading: loadingOrderCount } = useAsync(
    OrderServices.getDashboardCount
  );

  const { currency, getNumber, getNumberTwo } = useUtilsFunction();

  const { dataTable, serviceData } = useFilter(data?.orders);

  const handleDownloadOrders = async () => {
    try {
      setLoadingExport(true);
      const res = await OrderServices.getAllOrders({
        page: 1,
        day: time,
        method: method,
        status: status,
        endDate: endDate,
        download: true,
        startDate: startDate,
        limit: data?.totalDoc,
        customerName: searchText,
        userRole: userRole,
      });

      // console.log("handleDownloadOrders", res);
      const exportData = res?.orders?.map((order) => {
        return {
          _id: order._id,
          invoice: order.invoice,
          subTotal: getNumberTwo(order.subTotal),
          shippingCost: getNumberTwo(order.shippingCost),
          discount: getNumberTwo(order?.discount),
          total: getNumberTwo(order.total),
          paymentMethod: order.paymentMethod,
          status: order.status,
          user_info: order?.user_info?.name,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
        };
      });
      // console.log("exportData", exportData);

      exportFromJSON({
        data: exportData,
        fileName: "orders",
        exportType: exportFromJSON.types.csv,
      });
      setLoadingExport(false);
    } catch (err) {
      setLoadingExport(false);
      // console.log("err on orders download", err);
      notifyError(err?.response?.data?.message || err?.message);
    }
  };

  // handle reset field
  const handleResetField = () => {
    setTime("");
    setMethod("");
    setStatus("");
    setUserRole("");
    setEndDate("");
    setStartDate("");
    setSearchText("");
    searchRef.current.value = "";
  };
  // console.log("data in orders page", data);

  return (
    <>
      <PageTitle>{t("Orders")}</PageTitle>

      <AnimatedContent>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5 items-stretch mb-5 bg-white border border-gray-100 rounded-3xl dark:bg-gray-800 shadow-sm p-7 md:p-10">
          <CardItem
            title="Total Order"
            Icon={FiShoppingCart}
            loading={loadingOrderCount}
            quantity={dashboardOrderCount?.totalOrder || 0}
            className="text-orange-600 dark:text-orange-100 bg-orange-100 dark:bg-orange-500"
          />
          <CardItem
            title={t("OrderPending")}
            Icon={FiRefreshCw}
            loading={loadingOrderCount}
            quantity={dashboardOrderCount?.totalPendingOrder?.count || 0}
            amount={dashboardOrderCount?.totalPendingOrder?.total || 0}
            className="text-blue-600 dark:text-blue-100 bg-blue-100 dark:bg-blue-500"
          />
          <CardItem
            title={t("OrderProcessing")}
            Icon={FiTruck}
            loading={loadingOrderCount}
            quantity={dashboardOrderCount?.totalProcessingOrder || 0}
            className="text-teal-600 dark:text-teal-100 bg-teal-100 dark:bg-teal-500"
          />
          <CardItem
            title={t("OrderDelivered")}
            Icon={FiCheck}
            loading={loadingOrderCount}
            quantity={dashboardOrderCount?.totalDeliveredOrder || 0}
            className="text-green-600 dark:text-green-100 bg-green-100 dark:bg-green-500"
          />
          <CardItem
            title={t("OrderCancel")}
            Icon={FiXCircle}
            loading={loadingOrderCount}
            quantity={dashboardOrderCount?.totalCancelOrder || 0}
            className="text-red-600 dark:text-red-100 bg-red-100 dark:bg-red-500"
          />
        </div>

        <div className="min-w-0 shadow-sm bg-white dark:bg-gray-800 mb-5 relative z-[60] border border-gray-100 dark:border-gray-700 rounded-2xl overflow-visible">
          <div className="p-6 md:p-8 overflow-visible">
            <form onSubmit={handleSubmitForAll}>
              <div className="flex flex-col gap-5">

                {/* Row 1: Role toggle + filters */}
                <div className="flex flex-wrap gap-3 items-center">

                  {/* Role Tabs */}
                  <div className="inline-flex p-1.5 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-700 shrink-0">
                    {[
                      { label: 'All', value: '' },
                      { label: 'Customer', value: 'customer' },
                      { label: 'Retailer', value: 'wholesaler' }
                    ].map((tab) => (
                      <button
                        key={tab.value}
                        type="button"
                        onClick={() => setUserRole(tab.value)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${userRole === tab.value
                          ? "bg-teal-500 text-white shadow-sm shadow-teal-500/30"
                          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Search */}
                  <div className="relative flex-1 min-w-[180px]">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input
                      ref={searchRef}
                      type="search"
                      placeholder="Search by customer name..."
                      className="w-full h-11 pl-10 pr-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:border-teal-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-teal-500/10 transition-all outline-none"
                    />
                  </div>

                  {/* Status */}
                  <div className="relative min-w-[140px]">
                    <FiZap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                    <select
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full h-11 pl-10 pr-8 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 appearance-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-teal-500/10 transition-all outline-none cursor-pointer"
                    >
                      <option value="" hidden>{t("Status")}</option>
                      <option value="Delivered">{t("PageOrderDelivered")}</option>
                      <option value="Pending">{t("PageOrderPending")}</option>
                      <option value="Processing">{t("PageOrderProcessing")}</option>
                      <option value="Cancel">{t("OrderCancel")}</option>
                    </select>
                    <FiChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                  </div>

                  {/* Order Limits */}
                  <div className="relative min-w-[140px]">
                    <FiAlignLeft className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                    <select
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full h-11 pl-10 pr-8 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 appearance-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-teal-500/10 transition-all outline-none cursor-pointer"
                    >
                      <option value="" hidden>{t("Orderlimits")}</option>
                      <option value="5">{t("DaysOrders5")}</option>
                      <option value="7">{t("DaysOrders7")}</option>
                      <option value="15">{t("DaysOrders15")}</option>
                      <option value="30">{t("DaysOrders30")}</option>
                    </select>
                    <FiChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                  </div>

                  {/* Payment Method */}
                  <div className="relative min-w-[140px]">
                    <FiCreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                    <select
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full h-11 pl-10 pr-8 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 appearance-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-teal-500/10 transition-all outline-none cursor-pointer"
                    >
                      <option value="" hidden>{t("Method")}</option>
                      <option value="All">{t("All")}</option>
                      <option value="Cash">{t("Cash")}</option>
                      <option value="Card">{t("Card")}</option>
                      <option value="Credit">{t("Upi")}</option>
                    </select>
                    <FiChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4" />
                  </div>

                  {/* Download */}
                  <button
                    onClick={handleDownloadOrders}
                    disabled={data?.orders?.length <= 0 || loadingExport}
                    type="button"
                    title="Export CSV"
                    className="h-11 w-11 flex items-center justify-center bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all shrink-0 disabled:opacity-40"
                  >
                    <IoCloudDownloadOutline className="text-xl" />
                  </button>

                  {/* Toggle Columns */}
                  <div className="relative shrink-0" ref={columnToggleRef}>
                    <button
                      onClick={() => setShowColumnToggle(!showColumnToggle)}
                      type="button"
                      title="Toggle Columns"
                      className="h-11 px-4 flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-300 hover:text-teal-600 hover:border-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all text-sm font-medium"
                    >
                      <FiList className="text-base" />
                      <span className="hidden sm:inline">Columns</span>
                      <FiChevronDown className={`text-sm transition-transform ${showColumnToggle ? 'rotate-180' : ''}`} />
                    </button>

                    {showColumnToggle && (
                      <div className="absolute left-0 mt-2 w-60 rounded-2xl shadow-2xl bg-white dark:bg-gray-800 ring-1 ring-black/5 z-[9999] border border-gray-100 dark:border-gray-700 p-2 max-h-[420px] overflow-y-auto">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 pt-2 pb-3">Show / Hide Columns</p>
                        {Object.keys(visibleColumns).map((col) => (
                          <label key={col} className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer rounded-xl transition-colors">
                            <input
                              type="checkbox"
                              checked={visibleColumns[col]}
                              onChange={() => toggleColumn(col)}
                              className="w-4 h-4 rounded border-gray-300 text-teal-500 focus:ring-teal-500 accent-teal-500"
                            />
                            <span className="truncate">
                              {col === "invoice" && t("InvoiceNo")}
                              {col === "time" && t("TimeTbl")}
                              {col === "customerName" && t("CustomerName")}
                              {col === "productName" && "Product Name"}
                              {col === "contact" && "Contact"}
                              {col === "shippingCost" && "Shipping Cost"}
                              {col === "discount" && "Discount"}
                              {col === "method" && t("MethodTbl")}
                              {col === "amount" && t("AmountTbl")}
                              {col === "status" && t("OderStatusTbl")}
                              {col === "action" && "Action"}
                              {col === "actions" && "Actions"}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Row 2: Date range + actions */}
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex flex-col gap-1.5 min-w-[160px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Start Date</label>
                    <input
                      type="date"
                      onChange={(e) => setStartDate(e.target.value)}
                      className="h-11 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 focus:border-teal-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 min-w-[160px]">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">End Date</label>
                    <input
                      type="date"
                      onChange={(e) => setEndDate(e.target.value)}
                      className="h-11 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 focus:border-teal-500 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all"
                    />
                  </div>

                  <div className="flex gap-2 ml-auto mt-auto">
                    <button
                      type="submit"
                      className="h-11 px-7 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-teal-500/30 active:scale-[0.98] transition-all"
                    >
                      Apply Filter
                    </button>
                    <button
                      type="button"
                      onClick={handleResetField}
                      className="h-11 px-5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 active:scale-[0.98] transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </div>

              </div>
            </form>
          </div>
        </div>

        {data?.methodTotals?.length > 0 && (
          <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 rounded-t-lg rounded-0 mb-4">
            <CardBody>
              <div className="flex gap-1">
                {data?.methodTotals?.map((el, i) => (
                  <div key={i + 1} className="dark:text-gray-300">
                    {el?.method && (
                      <>
                        <span className="font-medium"> {el.method}</span> :{" "}
                        <span className="font-semibold mr-2">
                          {currency}
                          {getNumber(el.total)}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {loading ? (
          <TableLoading row={12} col={7} width={160} height={20} />
        ) : error ? (
          <span className="text-center mx-auto text-red-500">{error}</span>
        ) : serviceData?.length !== 0 ? (
          <div className="mb-8 overflow-x-auto w-full">
            <TableContainer className="dark:bg-gray-900 min-w-full">
              <Table className="w-full min-w-max">
                <TableHeader>
                  <tr>
                    {visibleColumns.invoice && (
                      <TableCell className="whitespace-nowrap">
                        {t("InvoiceNo")}
                      </TableCell>
                    )}
                    {visibleColumns.time && (
                      <TableCell className="whitespace-nowrap">
                        {t("TimeTbl")}
                      </TableCell>
                    )}
                    {visibleColumns.customerName && (
                      <TableCell className="whitespace-nowrap">
                        {t("CustomerName")}
                      </TableCell>
                    )}
                    {visibleColumns.productName && (
                      <TableCell className="whitespace-nowrap">
                        Product Name
                      </TableCell>
                    )}
                    {visibleColumns.contact && (
                      <TableCell className="whitespace-nowrap">Contact</TableCell>
                    )}
                    {visibleColumns.shippingCost && (
                      <TableCell className="whitespace-nowrap">
                        Shipping
                      </TableCell>
                    )}
                    {visibleColumns.discount && (
                      <TableCell className="whitespace-nowrap">
                        Discount
                      </TableCell>
                    )}
                    {visibleColumns.method && (
                      <TableCell className="whitespace-nowrap">
                        {t("MethodTbl")}
                      </TableCell>
                    )}
                    {visibleColumns.amount && (
                      <TableCell className="whitespace-nowrap">
                        {t("AmountTbl")}
                      </TableCell>
                    )}
                    {visibleColumns.status && (
                      <TableCell className="whitespace-nowrap">
                        {t("OderStatusTbl")}
                      </TableCell>
                    )}
                    {visibleColumns.action && (
                      <TableCell className="text-center whitespace-nowrap">
                        Action
                      </TableCell>
                    )}
                    {visibleColumns.actions && (
                      <TableCell className="text-right whitespace-nowrap">
                        Actions
                      </TableCell>
                    )}
                  </tr>
                </TableHeader>

                <OrderTable orders={dataTable} visibleColumns={visibleColumns} />
              </Table>

              <TableFooter>
                <Pagination
                  totalResults={data?.totalDoc}
                  resultsPerPage={resultsPerPage}
                  onChange={handleChangePage}
                  label="Table navigation"
                />
              </TableFooter>
            </TableContainer>
          </div>
        ) : (
          <NotFound title="Sorry, There are no orders right now." />
        )}
      </AnimatedContent>
    </>
  );
};

export default Orders;
