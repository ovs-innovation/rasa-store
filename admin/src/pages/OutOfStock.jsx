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
import { useContext, useEffect, useState } from "react";
import { FiEdit, FiSearch, FiPackage, FiX, FiXCircle } from "react-icons/fi";
import { Link } from "react-router-dom";

import ProductServices from "@/services/ProductServices";
import BrandServices from "@/services/BrandServices";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import AnimatedContent from "@/components/common/AnimatedContent";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import useUtilsFunction from "@/hooks/useUtilsFunction";

const RESULTS_PER_PAGE = 20;

const OutOfStock = () => {
  const { isUpdate } = useContext(SidebarContext);
  const { showingTranslateValue } = useUtilsFunction();

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState({ products: [], totalDoc: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    BrandServices.getAllBrands().then(setBrands).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await ProductServices.getAllProducts({
          page: currentPage,
          limit: RESULTS_PER_PAGE,
          title: searchQuery,
          brand: brandFilter,
          status: "out-of-stock",
          category: "",
          price: "",
        });
        setData(res);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage, searchQuery, brandFilter, isUpdate]);

  const outOfStockProducts = (data?.products || []).filter((p) => (p.stock ?? 0) === 0);

  const formatText = (val) => {
    if (!val) return "—";
    if (typeof val === "string") return val;
    if (typeof val === "object") return val.en || val.default || Object.values(val)[0] || "—";
    return String(val);
  };

  return (
    <>
      <PageTitle>Out Of Stock</PageTitle>
      <AnimatedContent>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-md">
            <FiXCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Out of Stock Products</h2>
            <p className="text-xs text-gray-500">Products with zero inventory — restock to resume sales</p>
          </div>
          <span className="ml-auto bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-lg border border-red-100">
            {outOfStockProducts.length} items
          </span>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSearchQuery(searchInput.trim());
                setCurrentPage(1);
              }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search product name..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm outline-none focus:border-teal-500"
                  />
                </div>
                <select
                  value={brandFilter}
                  onChange={(e) => { setBrandFilter(e.target.value); setCurrentPage(1); }}
                  className="h-11 px-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm"
                >
                  <option value="">All Brands</option>
                  {brands?.map((b) => (
                    <option key={b._id} value={b._id}>{formatText(b.name)}</option>
                  ))}
                </select>
                <button type="submit" className="h-11 px-5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700">
                  Search
                </button>
                {(searchQuery || brandFilter) && (
                  <button
                    type="button"
                    onClick={() => { setSearchInput(""); setSearchQuery(""); setBrandFilter(""); setCurrentPage(1); }}
                    className="h-11 px-4 text-sm font-semibold text-gray-500 flex items-center gap-1"
                  >
                    <FiX size={14} /> Reset
                  </button>
                )}
              </div>
            </form>
          </div>

          {loading ? (
            <div className="p-8"><TableLoading row={6} col={4} width={180} height={20} /></div>
          ) : error ? (
            <div className="p-10 text-center text-red-500">{error}</div>
          ) : outOfStockProducts.length > 0 ? (
            <TableContainer className="rounded-none shadow-none border-none">
              <Table className="w-full">
                <TableHeader>
                  <tr className="bg-gray-50/70 dark:bg-gray-900/50 text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
                    <TableCell className="py-4 px-6">Product</TableCell>
                    <TableCell className="py-4 px-6">Brand</TableCell>
                    <TableCell className="py-4 px-6 text-center">Stock</TableCell>
                    <TableCell className="py-4 px-6 text-center">Restock</TableCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {outOfStockProducts.map((p) => (
                    <TableRow key={p._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/50">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gray-50 border overflow-hidden shrink-0 opacity-60">
                            {p.image?.[0] ? (
                              <img src={p.image[0]} alt="" className="w-full h-full object-cover grayscale" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiPackage className="text-gray-300 w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate max-w-[220px]">
                            {showingTranslateValue(p.title)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-500">{formatText(p.brand?.name)}</TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">0 units</span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <Link
                          to={`/products/edit/${p._id}`}
                          className="h-9 px-4 inline-flex items-center gap-2 border border-teal-200 text-teal-600 text-xs font-bold rounded-xl hover:bg-teal-600 hover:text-white transition-all"
                        >
                          <FiEdit size={13} /> Update Stock
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TableFooter className="px-6 py-4">
                {(data?.totalDoc || 0) > RESULTS_PER_PAGE && (
                  <Pagination
                    totalResults={data.totalDoc}
                    resultsPerPage={RESULTS_PER_PAGE}
                    onChange={setCurrentPage}
                    label="Out of stock pagination"
                  />
                )}
              </TableFooter>
            </TableContainer>
          ) : (
            <div className="p-10"><NotFound title="No out-of-stock products. Great job!" /></div>
          )}
        </div>
      </AnimatedContent>
    </>
  );
};

export default OutOfStock;
