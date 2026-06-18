import {
  Pagination,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  TableBody,
  TableRow,
} from "@windmill/react-ui";
import { useContext, useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiEdit, FiSearch, FiAlertTriangle, FiPackage, FiDownload, FiChevronDown, FiX } from "react-icons/fi";

// internal import
import ProductServices from "@/services/ProductServices";
import BrandServices from "@/services/BrandServices";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import AnimatedContent from "@/components/common/AnimatedContent";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import useUtilsFunction from "@/hooks/useUtilsFunction";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import MainDrawer from "@/components/drawer/MainDrawer";
import ProductDrawer from "@/components/drawer/ProductDrawer";

const STOCK_THRESHOLD = 10;
const RESULTS_PER_PAGE = 20;

const LowStock = () => {
  const { t } = useTranslation();
  const { lang, setIsUpdate, isUpdate } = useContext(SidebarContext);
  const { showingTranslateValue } = useUtilsFunction();
  const { serviceId, handleUpdate } = useToggleDrawer();

  // local search / filter state
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const searchRef = useRef(null);

  // local data state for reactive fetching
  const [data, setData] = useState({ products: [], totalDoc: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch products with current filters from backend
  useEffect(() => {
    const fetchLowStock = async () => {
      setLoading(true);
      try {
        const res = await ProductServices.getAllProducts({
          page: currentPage,
          limit: RESULTS_PER_PAGE,
          title: searchQuery,
          brand: brandFilter,
          status: "",
          category: "",
          price: "",
        });
        setData(res);
        setError("");
      } catch (err) {
        setError(err.message || "Something went wrong while fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchLowStock();
  }, [currentPage, searchQuery, brandFilter, isUpdate]);

  const { data: brandListRaw } = ProductServices.useBrandList ? ProductServices.useBrandList() : { data: [] };
  // Since useAsync for brands might be preferred, but let's keep it simple.
  // Actually, I'll fetch brands once.
  const [brands, setBrands] = useState([]);
  useEffect(() => {
      BrandServices.getAllBrands().then(setBrands).catch(() => {});
  }, []);

  // Client-side low stock filter on fetched page (assuming backend doesn't have a specific low-stock endpoint)
  const allProducts = data?.products || [];
  const lowStockProducts = allProducts.filter((p) => (p.stock ?? 0) <= STOCK_THRESHOLD);
  const totalDoc = data?.totalDoc || 0;

  const formatText = (val) => {
    if (!val) return "—";
    if (typeof val === "string") return val;
    if (typeof val === "object") return val.en || val.default || Object.values(val)[0] || "—";
    return String(val);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setCurrentPage(1);
    if (searchRef.current) searchRef.current.focus();
  };

  const handleReset = () => {
    setSearchInput("");
    setSearchQuery("");
    setBrandFilter("");
    setCurrentPage(1);
  };

  const stockBadge = (stock) => {
    if (stock === 0)
      return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">Out of stock</span>;
    if (stock <= 5)
      return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">⚠ {stock} left</span>;
    if (stock <= 10)
      return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">⚠ {stock} left</span>;
    return <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">{stock} left</span>;
  };

  // Export functionality
  const handleExportCSV = () => {
    ProductServices.exportProductsCSV()
      .then((res) => {
        // Handle CSV download if needed, or if it's already handled by service
        // Usually, this might return a file or a message
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      <PageTitle>{t("Low Stock")}</PageTitle>
      <AnimatedContent>
      {/* Drawer for editing */}
      <MainDrawer>
        <ProductDrawer id={serviceId} />
      </MainDrawer>

      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6 mt-1">
        <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-orange-200">
          <FiAlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-[20px] font-bold text-gray-800 dark:text-gray-200 leading-tight tracking-tight">Low Stock List</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Products with ≤{STOCK_THRESHOLD} units remaining</p>
        </div>
        <span className="ml-1 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 text-[12px] font-bold px-3 py-1 rounded-lg shadow-sm">
          {lowStockProducts.length} items
        </span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

        {/* ── Toolbar ── */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSearch}>
            <div className="flex items-center gap-3 flex-wrap">

              {/* Search input with icon */}
              <div className="relative flex items-center" style={{ minWidth: 220, flex: "1 1 220px", maxWidth: 360 }}>
                <FiSearch className="absolute left-3.5 text-gray-400 w-4 h-4 pointer-events-none z-10" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search product name..."
                  style={{ height: 44 }}
                  className="w-full pl-10 pr-9 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 outline-none focus:border-teal-500 focus:bg-white dark:focus:bg-gray-800 transition-all"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX size={14} />
                  </button>
                )}
              </div>

              {/* Store / Brand native select */}
              <select
                value={brandFilter}
                onChange={(e) => { setBrandFilter(e.target.value); setCurrentPage(1); }}
                style={{ height: 44 }}
                className="border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-300 px-3 outline-none focus:border-teal-500 transition-all"
              >
                <option value="" className="dark:bg-gray-800">All Stores</option>
                {brands?.map((b) => (
                  <option key={b._id} value={b._id} className="dark:bg-gray-800">{formatText(b.name)}</option>
                ))}
              </select>

              {/* Search button */}
              <button
                type="submit"
                style={{ height: 44 }}
                className="px-5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2 shrink-0"
              >
                <FiSearch size={14} />
                Search
              </button>

              {/* Clear — only when a filter is active */}
              {(searchQuery || brandFilter) && (
                <button
                  type="button"
                  onClick={handleReset}
                  style={{ height: 44 }}
                  className="px-4 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <FiX size={14} />
                  Clear
                </button>
              )}

              {/* Export — pushed far right */}
              <button
                type="button"
                onClick={handleExportCSV}
                style={{ height: 44 }}
                className="ml-auto px-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 shadow-sm shrink-0"
              >
                <FiDownload size={14} className="text-gray-500" />
                Export
                <FiChevronDown size={13} className="text-gray-400" />
              </button>
            </div>
          </form>

          {/* Active filter chips */}
          {(searchQuery || brandFilter) && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Active:</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 text-[12px] font-semibold px-2.5 py-1 rounded-full">
                  "{searchQuery}"
                  <button type="button" onClick={handleClearSearch} className="hover:text-teal-900">
                    <FiX size={10} />
                  </button>
                </span>
              )}
              {brandFilter && (
                <span className="inline-flex items-center gap-1.5 bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400 text-[12px] font-semibold px-2.5 py-1 rounded-full">
                  Store filter
                  <button type="button" onClick={() => { setBrandFilter(""); setCurrentPage(1); }} className="hover:text-violet-900">
                    <FiX size={10} />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="p-8"><TableLoading row={6} col={5} width={180} height={20} /></div>
        ) : error ? (
          <div className="p-10 text-center text-red-500">{error}</div>
        ) : lowStockProducts.length > 0 ? (
          <TableContainer className="rounded-none shadow-none border-none">
            <Table className="w-full">
              <TableHeader>
                <tr className="bg-gray-50/70 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-[10px] font-extrabold uppercase tracking-widest">
                  <TableCell className="py-4 px-6 w-12">Sl</TableCell>
                  <TableCell className="py-4 px-6">Product Name</TableCell>
                  <TableCell className="py-4 px-6">Store</TableCell>
                  <TableCell className="py-4 px-6 text-center">Current Stock</TableCell>
                  <TableCell className="py-4 px-6 text-center">Action</TableCell>
                </tr>
              </TableHeader>
              <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-50 dark:divide-gray-700">
                {lowStockProducts.map((p, i) => (
                  <TableRow key={p._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/50 transition-colors group">
                    <TableCell className="px-6 py-4 text-[13px] font-medium text-gray-400">
                      {(currentPage - 1) * RESULTS_PER_PAGE + i + 1}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 overflow-hidden shrink-0">
                          {p.image?.[0] ? (
                            <img src={p.image[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiPackage className="text-gray-200 w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-gray-800 dark:text-gray-200 leading-tight max-w-[220px] truncate group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                            {showingTranslateValue(p.title)}
                          </p>
                          {p.sku && (
                            <p className="text-[11px] text-gray-400 mt-0.5 font-mono">SKU: {p.sku}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-[13px] text-gray-500 font-medium">
                      {formatText(p.brand?.name) !== "—" ? formatText(p.brand?.name) : "—"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      {stockBadge(p.stock ?? 0)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleUpdate(p._id)}
                        title="Edit product"
                        className="h-9 w-9 inline-flex items-center justify-center bg-white dark:bg-gray-800 border border-teal-200 dark:border-teal-900/50 text-teal-600 dark:text-teal-400 rounded-xl hover:bg-teal-600 dark:hover:bg-teal-500 hover:text-white dark:hover:text-white hover:border-teal-600 dark:hover:border-teal-500 transition-all shadow-sm"
                      >
                        <FiEdit size={14} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TableFooter className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-6 py-4">
              {totalDoc > RESULTS_PER_PAGE && (
                <Pagination
                  totalResults={totalDoc}
                  resultsPerPage={RESULTS_PER_PAGE}
                  onChange={(p) => setCurrentPage(p)}
                  label="Low stock pagination"
                />
              )}
            </TableFooter>
          </TableContainer>
        ) : (
          <div className="p-10">
            <NotFound title="No low-stock products found." />
          </div>
        )}
      </div>
    </AnimatedContent>
    </>
  );
};

export default LowStock;
