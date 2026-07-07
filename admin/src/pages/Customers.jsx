import {
  Button,
  Pagination,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
} from "@windmill/react-ui";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiSearch } from "react-icons/fi";

import CustomerTable from "@/components/customer/CustomerTable";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import PageTitle from "@/components/Typography/PageTitle";
import useAsync from "@/hooks/useAsync";
import useFilter from "@/hooks/useFilter";
import CustomerServices from "@/services/CustomerServices";
import AnimatedContent from "@/components/common/AnimatedContent";
import CustomerOverview from "@/components/customer/CustomerOverview";

const Customers = () => {
  const { data: customerStatistics, loading: loadingStatistics } = useAsync(
    CustomerServices.getCustomerStatistics
  );

  const [filterType, setFilterType] = useState("all");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    userRef,
    searchUser,
    dataTable,
    setSearchUser,
    totalResults,
    resultsPerPage,
    handleSubmitUser,
    handleChangePage,
  } = useFilter(data);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await CustomerServices.getAllCustomers({
          filterType: filterType === "all" ? "" : filterType,
          searchText: searchUser,
        });
        setData(Array.isArray(response) ? response : []);
      } catch (err) {
        setError(err.message || "Failed to fetch customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [filterType, searchUser]);

  const { t } = useTranslation();

  const handleResetField = () => {
    setSearchUser("");
    if (userRef.current) userRef.current.value = "";
    setFilterType("all");
  };

  return (
    <>
      <PageTitle>{t("CustomersPage")}</PageTitle>

      <AnimatedContent>
        <CustomerOverview
          statistics={customerStatistics}
          loading={loadingStatistics}
          filterType={filterType}
          onFilterChange={setFilterType}
        />

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm mb-6">
          <form
            onSubmit={handleSubmitUser}
            className="flex flex-col sm:flex-row gap-3 p-4"
          >
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={userRef}
                type="search"
                name="search"
                placeholder="Search by name, email or phone..."
                className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 outline-none focus:border-[#D4AF37]/50"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="h-11 px-6 rounded-xl bg-teal-600 hover:bg-teal-700">
                Search
              </Button>
              <Button
                layout="outline"
                type="button"
                onClick={handleResetField}
                className="h-11 px-6 rounded-xl dark:bg-gray-700"
              >
                Reset
              </Button>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6">
              <TableLoading row={8} col={5} width={140} height={18} />
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-red-500 font-medium">{error}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-3 text-sm text-teal-600 hover:underline"
              >
                Refresh page
              </button>
            </div>
          ) : dataTable?.length ? (
            <>
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-semibold text-gray-800 dark:text-gray-200">{dataTable.length}</span> customers
                </p>
              </div>

              <TableContainer className="border-0 shadow-none mb-0">
                <Table>
                  <TableHeader>
                    <tr>
                      <TableCell>Customer</TableCell>
                      <TableCell>Joined</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell className="text-right">Actions</TableCell>
                    </tr>
                  </TableHeader>
                  <CustomerTable customers={dataTable} />
                </Table>
              </TableContainer>

              <TableFooter className="border-t border-gray-100 dark:border-gray-700">
                <Pagination
                  totalResults={totalResults}
                  resultsPerPage={resultsPerPage}
                  onChange={handleChangePage}
                  label="Customer navigation"
                />
              </TableFooter>
            </>
          ) : (
            <div className="py-20">
              <NotFound title="No customers found." />
            </div>
          )}
        </div>
      </AnimatedContent>
    </>
  );
};

export default Customers;
