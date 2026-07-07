import React, { useContext, useState } from "react";
import {
  Input,
  Button,
  Table,
  TableHeader,
  TableCell,
  TableContainer,
  Pagination,
  TableFooter,
  TableBody,
  TableRow,
} from "@windmill/react-ui";
import {
  FiSearch,
  FiStar,
  FiCheck,
  FiMessageSquare,
  FiTrash2,
  FiPlus,
  FiEdit2,
  FiSave,
} from "react-icons/fi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { SidebarContext } from "@/context/SidebarContext";
import useAsync from "@/hooks/useAsync";
import useHomepageReviews from "@/hooks/useHomepageReviews";
import ReviewServices from "@/services/ReviewServices";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import AnimatedContent from "@/components/common/AnimatedContent";
import ReviewFormModal from "@/components/review/ReviewFormModal";
import HomepageCustomerReviewsEditor from "@/components/homepage/HomepageCustomerReviewsEditor";
import Loading from "@/components/preloader/Loading";
import SectionVisibilityToggle from "@/components/common/SectionVisibilityToggle";

dayjs.extend(relativeTime);

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <FiStar
        key={s}
        size={12}
        className={
          s <= rating
            ? "text-amber-400 fill-amber-400"
            : "text-gray-200 fill-gray-200"
        }
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
    setIsUpdate,
  } = useContext(SidebarContext);

  const [activeTab, setActiveTab] = useState("homepage");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  const {
    loading: homepageLoading,
    saving: homepageSaving,
    customerReviews,
    setCustomerReviews,
    reviewsSection,
    setReviewsSection,
    save: saveHomepageReviews,
  } = useHomepageReviews();

  const { data, loading, error } = useAsync(() =>
    ReviewServices.getAllReviews({
      page: currentPage,
      limit: resultsPerPage,
      search: searchText || undefined,
    })
  );

  const productReviews = data?.reviews || [];
  const totalProductReviews = data?.pagination?.total || productReviews.length;

  const refreshProductList = (message) => {
    setIsUpdate(true);
    if (message) showAlert(message, "success");
  };

  const openAddProductReview = () => {
    setEditingReview(null);
    setModalOpen(true);
  };

  const openEditProductReview = (review) => {
    setEditingReview(review);
    setModalOpen(true);
  };

  const handleDeleteProductReview = async (reviewId) => {
    try {
      if (!window.confirm("Are you sure you want to delete this review?")) return;
      await ReviewServices.deleteReview(reviewId);
      refreshProductList("Review deleted successfully!");
    } catch (err) {
      showAlert(err?.response?.data?.message || "Failed to delete review", "error");
    }
  };

  return (
    <AnimatedContent>
      <ReviewFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        review={editingReview}
        onSuccess={refreshProductList}
      />

      <div className="bg-[#f0f2f5] dark:bg-gray-900 min-h-screen pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-md">
                <FiStar className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200 leading-tight">
                  Reviews
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Homepage carousel reviews and product page reviews
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("homepage")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === "homepage"
                  ? "bg-teal-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              Homepage Reviews ({customerReviews?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("product")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === "product"
                  ? "bg-teal-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              Product Reviews ({totalProductReviews})
            </button>
          </div>

          {activeTab === "homepage" ? (
            homepageLoading ? (
              <Loading loading={homepageLoading} />
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-[17px] font-bold text-gray-700 dark:text-gray-300">
                      Homepage Customer Reviews
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Shown in the reviews carousel on the store homepage
                    </p>
                  </div>
                  <SectionVisibilityToggle
                    enabled={reviewsSection?.enabled}
                    onChange={() =>
                      setReviewsSection({
                        ...reviewsSection,
                        enabled: reviewsSection?.enabled === false,
                      })
                    }
                    label="Show on homepage"
                  />
                </div>

                <div className="p-5">
                  <HomepageCustomerReviewsEditor
                    reviews={customerReviews}
                    section={reviewsSection}
                    onReviewsChange={setCustomerReviews}
                    onSectionChange={setReviewsSection}
                    hideSectionToggle
                  />
                </div>

                <div className="p-5 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                  <Button
                    onClick={saveHomepageReviews}
                    disabled={homepageSaving}
                    className="bg-teal-600 hover:bg-teal-700 px-8"
                  >
                    <FiSave className="mr-2" />
                    {homepageSaving ? "Saving..." : "Save Homepage Reviews"}
                  </Button>
                </div>
              </div>
            )
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <h2 className="text-[17px] font-bold text-gray-700 dark:text-gray-300">
                    Product Page Reviews
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Real customer reviews on individual product pages
                  </p>
                </div>
                <Button onClick={openAddProductReview} className="rounded-xl h-11 px-5">
                  <FiPlus className="mr-2" />
                  Add Product Review
                </Button>
              </div>

              <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                <Input
                  ref={searchRef}
                  className="w-full sm:max-w-md border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 text-sm h-10"
                  placeholder="Search by review text..."
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              {loading ? (
                <TableLoading row={6} col={6} width={140} height={20} />
              ) : error ? (
                <div className="text-center text-red-500 py-16">{error}</div>
              ) : productReviews.length === 0 ? (
                <NotFound title="No product reviews yet" />
              ) : (
                <TableContainer className="rounded-none border-none overflow-x-auto">
                  <Table className="w-full text-sm">
                    <TableHeader>
                      <tr className="bg-gray-50/80 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                        {["Item", "Customer", "Review", "Date", "Store Reply", "Action"].map(
                          (h) => (
                            <TableCell
                              key={h}
                              className="py-4 font-extrabold text-gray-600 dark:text-gray-400 text-[12px] uppercase tracking-wide"
                            >
                              {h}
                            </TableCell>
                          )
                        )}
                      </tr>
                    </TableHeader>
                    <TableBody>
                      {productReviews.map((review, i) => (
                        <TableRow
                          key={review._id || i}
                          className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50/60 dark:hover:bg-gray-700/50"
                        >
                          <TableCell className="min-w-[160px]">
                            <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200 line-clamp-1">
                              {formatText(review.product?.title, "Unknown Product")}
                            </p>
                          </TableCell>
                          <TableCell>
                            <p className="text-[13px] font-bold text-teal-600">
                              {review.displayName ||
                                formatText(review.user?.name, "Anonymous")}
                            </p>
                          </TableCell>
                          <TableCell className="min-w-[180px]">
                            <StarRating rating={review.rating || 5} />
                            <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">
                              {review.reviewText}
                            </p>
                          </TableCell>
                          <TableCell className="text-[12px] text-gray-500">
                            {dayjs(review.createdAt).format("DD MMM YYYY")}
                          </TableCell>
                          <TableCell>
                            {review.reply ? (
                              <span className="text-[11px] font-bold text-teal-600">
                                <FiCheck className="inline mr-1" />
                                Replied
                              </span>
                            ) : (
                              <span className="text-[11px] text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <button
                                onClick={() => openEditProductReview(review)}
                                className="p-2 rounded-lg text-teal-500 hover:bg-teal-50"
                              >
                                <FiEdit2 size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteProductReview(review._id)}
                                className="p-2 rounded-lg text-red-400 hover:bg-red-50"
                              >
                                <FiTrash2 size={15} />
                              </button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TableFooter className="p-4">
                    <Pagination
                      totalResults={totalProductReviews}
                      resultsPerPage={resultsPerPage}
                      onChange={handleChangePage}
                      label="Product review pagination"
                    />
                  </TableFooter>
                </TableContainer>
              )}
            </div>
          )}
        </div>
      </div>
    </AnimatedContent>
  );
};

export default Reviews;
