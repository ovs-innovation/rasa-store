import React, { useContext, useState, useEffect } from "react";
import {
  Input, Button, Table, TableHeader, TableCell, TableContainer,
  Pagination, TableFooter, TableBody, TableRow,
} from "@windmill/react-ui";
import { FiSearch, FiDownload, FiChevronDown, FiStar, FiCheck, FiMessageSquare, FiAlertCircle, FiTrash2 } from "react-icons/fi";
import { HiOutlineShoppingBag, HiSelector } from "react-icons/hi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { SidebarContext } from "@/context/SidebarContext";
import useAsync from "@/hooks/useAsync";
import ReviewServices from "@/services/ReviewServices";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import AnimatedContent from "@/components/common/AnimatedContent";

dayjs.extend(relativeTime);

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <FiStar
        key={s}
        size={12}
        className={s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
      />
    ))}
    <span className="ml-1 text-[12px] font-bold text-gray-600">{rating}/5</span>
  </div>
);

const formatText = (value, fallback = "N/A") => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value.en) return value.en;
    const firstValue = Object.values(value)[0];
    return typeof firstValue === "string" ? firstValue : fallback;
  }
  return String(value);
};

const Reviews = () => {
  const {
    currentPage,
    handleChangePage,
    resultsPerPage,
    searchText,
    searchRef,
    setSearchText,
    showAlert,
  } = useContext(SidebarContext);

  const { data, loading, error } = useAsync(() =>
    ReviewServices.getAllReviews({
      page: currentPage,
      limit: resultsPerPage,
      search: searchText || undefined,
    })
  );

  const reviews = data?.reviews || [];
  const totalResults = data?.pagination?.total || reviews.length;

  const handleDeleteReview = async (reviewId) => {
    try {
      if (!window.confirm("Are you sure you want to delete this review?")) return;
      await ReviewServices.deleteReview(reviewId);
      showAlert("Review deleted successfully!", "success");
    } catch (err) {
      showAlert(err?.response?.data?.message || "Failed to delete review", "error");
    }
  };

  return (
    <AnimatedContent>
      <div className="bg-[#f0f2f5] dark:bg-gray-900 min-h-screen pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-md">
              <FiStar className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 leading-tight">Item Reviews</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage and monitor product reviews</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* Toolbar */}
            <div className="p-5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <h2 className="text-[17px] font-bold text-gray-700 dark:text-gray-300">Review List</h2>
                <span className="bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-bold px-3 py-1 rounded-lg">
                  {totalResults}
                </span>
              </div>
              <div className="flex w-full xl:w-auto flex-col sm:flex-row gap-3 items-center">
                <div className="flex w-full sm:w-auto relative">
                  <Input
                    ref={searchRef}
                    className="w-full sm:w-[300px] border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-r-none focus:border-teal-500 text-sm h-10"
                    placeholder="Search by item name, customer..."
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  <button className="bg-slate-400 text-white px-4 rounded-r-xl hover:bg-slate-500 transition-colors">
                    <FiSearch className="w-4 h-4" />
                  </button>
                </div>
                <button className="flex items-center gap-2 px-4 h-10 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm transition-all whitespace-nowrap bg-white dark:bg-gray-800">
                  <FiDownload className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  Export
                  <FiChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                </button>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <TableLoading row={8} col={7} width={140} height={20} />
            ) : error ? (
              <div className="text-center text-red-500 py-16">{error}</div>
            ) : reviews.length === 0 ? (
              <NotFound title="No reviews found" />
            ) : (
              <TableContainer className="rounded-none border-none overflow-x-auto">
                <Table className="w-full text-sm">
                  <TableHeader>
                    <tr className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                      {["Sl", "Review Id", "Item", "Customer", "Review", "Date", "Store Reply", "Action"].map((h, idx) => (
                        <TableCell key={idx} className="py-4 font-extrabold text-gray-600 dark:text-gray-400 text-[12px] uppercase tracking-wide">
                          <div className={`flex items-center gap-1 ${idx <= 1 ? "justify-center" : idx >= 6 ? "justify-center" : "justify-start"}`}>
                            {h}
                            {h !== "Action" && <HiSelector className="text-gray-300 w-3.5 h-3.5 shrink-0" />}
                          </div>
                        </TableCell>
                      ))}
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review, i) => (
                      <TableRow
                        key={review._id || i}
                        className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50/60 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        {/* Sl */}
                        <TableCell className="text-center font-medium text-gray-400 text-[13px] w-12">
                          {(currentPage - 1) * resultsPerPage + i + 1}
                        </TableCell>

                        {/* Review ID */}
                        <TableCell className="text-center w-28">
                          <span className="text-[12px] font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-md">
                            #{review._id?.substring(18, 24) || `${100137 + i}`}
                          </span>
                        </TableCell>

                        {/* Item */}
                        <TableCell className="min-w-[180px]">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 overflow-hidden shrink-0">
                              {review.product?.image ? (
                                <img
                                  src={Array.isArray(review.product.image) ? review.product.image[0] : review.product.image}
                                  alt="Product"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                                  IMG
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200 leading-tight line-clamp-1 max-w-[160px]">
                                {formatText(review.product?.title, "Unknown Product")}
                              </p>
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                                Order: #{review.orderInvoice || "—"}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Customer */}
                        <TableCell className="min-w-[130px]">
                          <p className="text-[13px] font-bold text-teal-600">
                            {formatText(review.user?.name, "Anonymous")}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {review.user?.phone ? `+${review.user.phone.toString().slice(0, 2)}*****${review.user.phone.toString().slice(-2)}` : "—"}
                          </p>
                        </TableCell>

                        {/* Review */}
                        <TableCell className="min-w-[200px]">
                          <StarRating rating={review.rating || 5} />
                          <p className="text-[12px] text-gray-500 mt-1.5 leading-relaxed line-clamp-2 max-w-[180px]">
                            {review.reviewText || "No comment provided."}
                          </p>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-center w-28">
                          <p className="text-[12px] font-medium text-gray-700 dark:text-gray-200">
                            {dayjs(review.createdAt).format("DD MMM YYYY")}
                          </p>
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                            {dayjs(review.createdAt).format("hh:mm A")}
                          </p>
                        </TableCell>

                        {/* Store Reply */}
                        <TableCell className="text-center w-28">
                          {review.reply ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded-full">
                              <FiCheck size={10} /> Replied
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-full">
                              <FiMessageSquare size={10} /> Not replied
                            </span>
                          )}
                        </TableCell>

                        {/* Action */}
                        <TableCell className="text-center w-20">
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete review"
                          >
                            <FiAlertCircle size={15} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TableFooter className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-4">
                  <Pagination
                    totalResults={totalResults}
                    resultsPerPage={resultsPerPage}
                    onChange={handleChangePage}
                    label="Review pagination"
                  />
                </TableFooter>
              </TableContainer>
            )}
          </div>
        </div>
      </div>
    </AnimatedContent>
  );
};

export default Reviews;
