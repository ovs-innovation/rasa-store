import { useLocation } from "react-router-dom";
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
import {
  FiCheck,
  FiRefreshCw,
  FiShoppingCart,
  FiTruck,
  FiXCircle,
  FiList,
  FiChevronDown,
  FiSearch,
  FiCreditCard,
  FiCalendar,
  FiAlignLeft,
  FiZap,
} from "react-icons/fi";

//internal import (useLocation already imported above)
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

// Map URL slug → actual backend status value
const STATUS_MAP = {
  scheduled: "Scheduled",
  pending: "Pending",
  accepted: "Accepted",
  processing: "Processing",
  "on-the-way": "Order On The Way",
  delivered: "Delivered",
  canceled: "Cancel",
  "payment-failed": "Payment Failed",
  refunded: "Refunded",
  "refund-requested": "Refund Requested",
  "offline-payments": "Offline Payments",
};

// Human-readable page title map
const TITLE_MAP = {
  scheduled: "Scheduled Orders",
  pending: "Pending Orders",
  accepted: "Accepted Orders",
  processing: "Processing Orders",
  "on-the-way": "Order On The Way",
  delivered: "Delivered Orders",
  canceled: "Canceled Orders",
  "payment-failed": "Payment Failed Orders",
  refunded: "Refunded Orders",
  "refund-requested": "Refund Requested Orders",
  "offline-payments": "Offline Payments",
};

const OrdersByStatus = () => {
  const location = useLocation();
  // Extract last segment from pathname e.g. "/orders/pending" → "pending"
  const statusSlug = location.pathname.split("/").filter(Boolean).pop();
  const statusValue = STATUS_MAP[statusSlug] || "";
  const pageTitle = TITLE_MAP[statusSlug] || "Orders";

  const {
    time,
    setTime,
    status,
    setStatus,
    endDate,
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
    customerId: false,
    productName: false,
    productId: false,
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
    setStatus(statusValue);
  }, [statusValue, setStatus]);

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
      status: statusValue,   // Always filter by this page's status
      page: currentPage,
      endDate: endDate,
      startDate: startDate,
      limit: resultsPerPage,
      customerName: searchText,
      userRole: userRole,
    })
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
        status: statusValue,
        endDate: endDate,
        download: true,
        startDate: startDate,
        limit: data?.totalDoc,
        customerName: searchText,
        userRole: userRole,
      });

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

      exportFromJSON({
        data: exportData,
        fileName: `orders-${statusSlug}`,
        exportType: exportFromJSON.types.csv,
      });
      setLoadingExport(false);
    } catch (err) {
      setLoadingExport(false);
      notifyError(err?.response?.data?.message || err?.message);
    }
  };

  const handleResetField = () => {
    setTime("");
    setMethod("");
    setUserRole("");
    setEndDate("");
    setStartDate("");
    setSearchText("");
    searchRef.current.value = "";
  };

  return (
    <>
      <PageTitle>{pageTitle}</PageTitle>

      <AnimatedContent>
        {/* Stats Card */}
        <div className="mb-5 flex justify-start">
          <Card className="w-full max-w-xs border border-green-200/40 dark:border-green-900/20 bg-green-80/50 dark:bg-green-980/10 shadow-lg shadow-green-800/10 dark:shadow-green-900/5 rounded-2xl">            <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600/70 dark:text-green-400/60">
                  Total {pageTitle}
                </p>
                <p className="text-3xl font-bold text-store-500 dark:text-store-400">
                  {loading ? "..." : data?.totalDoc || 0}
                </p>
              </div>
              <div
                className="p-3 rounded-full"
                style={{ background: "rgba(2, 128, 144, 0.1)" }}
              >
                <FiShoppingCart
                  className="text-2xl"
                  style={{ color: "#028090" }}
                />
              </div>
            </div>
          </CardBody>
          </Card>
        </div>

        <Card className="min-w-0 shadow-sm bg-white dark:bg-gray-800 mb-5 relative z-[60] !overflow-visible border border-gray-100 dark:border-gray-700 rounded-3xl">
          <CardBody className="!overflow-visible p-6 md:p-8">
            <form onSubmit={handleSubmitForAll}>
              <div className="flex flex-col gap-6">

                {/* First Row: Role Toggle, Search, and Dropdowns */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">

                  {/* Role Tabs */}
                  <div className="lg:col-span-3">
                    <div className="inline-flex p-1.5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-700">
                      {[
                        { label: 'All', value: '' },
                        { label: 'Customer', value: 'customer' },
                      ].map((tab) => (
                        <button
                          key={tab.value}
                          type="button"
                          onClick={() => setUserRole(tab.value)}
                          className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${userRole === tab.value
                            ? "bg-teal-500 text-white shadow-md shadow-teal-500/20"
                            : "text-gray-500 hover:text-teal-600 dark:text-gray-400"
                            }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="lg:col-span-3 relative">
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
                      <FiSearch className="w-5 h-5" />
                    </div>
                    <input
                      ref={searchRef}
                      type="search"
                      placeholder="Search"
                      className="w-full h-12 pl-5 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-medium focus:border-teal-500/50 focus:ring-4 focus:ring-teal-500/5 transition-all outline-none"
                    />
                  </div>

                  {/* Status Select (Pre-filled for this specific status page, but visually present) */}
                  <div className="lg:col-span-2 relative opacity-60 ">
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10">
                      <FiZap className="w-4 h-4" />
                    </div>
                    <select
                      disabled
                      className="w-full h-12 !pl-12 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-200 appearance-none outline-none cursor-not-allowed"
                    >
                      <option value={statusValue}>{pageTitle.replace(' Orders', '')}</option>
                    </select>
                    <div className="absolute right-1  top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <FiChevronDown />
                    </div>
                  </div>

                  {/* Order Limits Select */}
                  <div className="lg:col-span-2 relative">
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10">
                      <FiAlignLeft className="w-4 h-4" />
                    </div>
                    <select
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full h-12 !pl-12 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-200 appearance-none focus:border-teal-500/50 transition-all outline-none"
                    >
                      <option value="Order limits" defaultValue hidden>{t("Orderlimits")}</option>
                      <option value="5">{t("DaysOrders5")}</option>
                      <option value="7">{t("DaysOrders7")}</option>
                      <option value="15">{t("DaysOrders15")}</option>
                      <option value="30">{t("DaysOrders30")}</option>
                    </select>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <FiChevronDown />
                    </div>
                  </div>

                  {/* Method Select */}
                  <div className="lg:col-span-2 relative">
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none z-10">
                      <FiCreditCard className="w-4 h-4" />
                    </div>
                    <select
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full h-12 !pl-12 pr-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-200 appearance-none focus:border-teal-500/50 transition-all outline-none"
                    >
                      <option value="Method" defaultValue hidden>{t("Method")}</option>
                      <option value="All">{t("All")}</option>
                      <option value="Cash">{t("Cash")}</option>
                      <option value="Card">{t("Card")}</option>
                      <option value="Credit">{t("Credit")}</option>
                    </select>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      <FiChevronDown />
                    </div>
                  </div>
                </div>

                {/* Second Row: Utility Buttons (Download & Columns) */}
                <div className="flex gap-4 items-center">
                  <button
                    onClick={handleDownloadOrders}
                    disabled={data?.orders?.length <= 0 || loadingExport}
                    type="button"
                    className="w-16 h-14 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/10 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <IoCloudDownloadOutline className="text-2xl" />
                  </button>

                  <div className="relative" ref={columnToggleRef}>
                    <button
                      onClick={() => setShowColumnToggle(!showColumnToggle)}
                      type="button"
                      className="h-14 px-6 flex items-center justify-between gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                    >
                      <FiList className="text-xl" />
                      <FiChevronDown className="text-sm" />
                    </button>

                    {showColumnToggle && (
                      <div className="absolute left-0 mt-3 w-64 rounded-3xl shadow-2xl bg-white dark:bg-gray-800 ring-1 ring-black/5 z-[100] max-h-96 overflow-y-auto border border-gray-100 dark:border-gray-700 p-3">
                        {Object.keys(visibleColumns).map((col) => (
                          <label key={col} className="flex items-center px-4 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 cursor-pointer rounded-2xl transition-colors">
                            <input
                              type="checkbox"
                              checked={visibleColumns[col]}
                              onChange={() => toggleColumn(col)}
                              className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 mr-4"
                            />
                            <span className="truncate">
                              {col === "invoice" && t("InvoiceNo")}
                              {col === "time" && t("TimeTbl")}
                              {col === "customerName" && t("CustomerName")}
                              {col === "customerId" && "Customer ID"}
                              {col === "productName" && "Product Name"}
                              {col === "productId" && "Product ID"}
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

                {/* Third Row: Dates and Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pt-2">
                  <div className="md:col-span-1 relative">
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 ml-1">Start Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full h-12 pl-5 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-200 focus:border-teal-500/50 outline-none transition-all"
                      />
                      {/* <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /> */}
                    </div>
                  </div>
                  <div className="md:col-span-1 relative">
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3 ml-1">End Date</label>
                    <div className="relative">
                      <input
                        type="date"
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full h-12 pl-5 pr-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-xs font-bold text-gray-700 dark:text-gray-200 focus:border-teal-500/50 outline-none transition-all"
                      />
                      {/* <FiCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" /> */}
                    </div>
                  </div>

                  <div className="md:col-span-2 flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 h-12 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-teal-500/20 active:scale-[0.98] transition-all"
                    >
                      Filter
                    </button>
                    <button
                      type="button"
                      onClick={handleResetField}
                      className="flex-1 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-300 rounded-2xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-[0.98] transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </div>

              </div>
            </form>
          </CardBody>
        </Card>

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
                    {visibleColumns.customerId && (
                      <TableCell className="whitespace-nowrap">
                        Customer ID
                      </TableCell>
                    )}
                    {visibleColumns.productName && (
                      <TableCell className="whitespace-nowrap">
                        Product Name
                      </TableCell>
                    )}
                    {visibleColumns.productId && (
                      <TableCell className="whitespace-nowrap">
                        Product ID
                      </TableCell>
                    )}
                    {visibleColumns.contact && (
                      <TableCell className="whitespace-nowrap">
                        Contact
                      </TableCell>
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

                <OrderTable
                  orders={dataTable}
                  visibleColumns={visibleColumns}
                />
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
          <NotFound
            title={`Sorry, There are no ${pageTitle.toLowerCase()} right now.`}
          />
        )}
      </AnimatedContent>
    </>
  );
};

export default OrdersByStatus;