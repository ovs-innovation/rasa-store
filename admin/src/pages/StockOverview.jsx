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
import { useContext, useEffect, useMemo, useState } from "react";
import { FiEdit, FiSearch, FiPackage, FiX, FiBox, FiAlertTriangle, FiXCircle } from "react-icons/fi";
import { Link } from "react-router-dom";

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

const StockOverview = () => {
  const { isUpdate } = useContext(SidebarContext);
  const { showingTranslateValue } = useUtilsFunction();
  const { serviceId, handleUpdate } = useToggleDrawer();

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
          status: "",
          category: "",
          price: "",
        });
        setData(res);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load inventory");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage, searchQuery, brandFilter, isUpdate]);

  const products = data?.products || [];

  const stats = useMemo(() => {
    const inStock = products.filter((p) => (p.stock ?? 0) > STOCK_THRESHOLD).length;
    const lowStock = products.filter((p) => {
      const s = p.stock ?? 0;
      return s > 0 && s <= STOCK_THRESHOLD;
    }).length;
    const outOfStock = products.filter((p) => (p.stock ?? 0) === 0).length;
    return { inStock, lowStock, outOfStock, total: data?.totalDoc || products.length };
  }, [products, data?.totalDoc]);

  const formatText = (val) => {
    if (!val) return "—";
    if (typeof val === "string") return val;
    if (typeof val === "object") return val.en || val.default || Object.values(val)[0] || "—";
    return String(val);
  };

  const stockBadge = (stock) => {
    if (stock === 0)
      return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">Out of stock</span>;
    if (stock <= STOCK_THRESHOLD)
      return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-100">Low · {stock}</span>;
    return <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">{stock} units</span>;
  };

  return (
    <>
      <PageTitle>Stock Overview</PageTitle>
      <AnimatedContent>
        <MainDrawer>
          <ProductDrawer id={serviceId} />
        </MainDrawer>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          {[
            { label: "Total Products", value: stats.total, icon: FiBox, iconBg: "bg-teal-100 dark:bg-teal-900/30", iconColor: "text-teal-600" },
            { label: "In Stock", value: stats.inStock, icon: FiPackage, iconBg: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-600" },
            { label: "Low Stock", value: stats.lowStock, icon: FiAlertTriangle, iconBg: "bg-orange-100 dark:bg-orange-900/30", iconColor: "text-orange-600", link: "/inventory/low-stock" },
            { label: "Out of Stock", value: stats.outOfStock, icon: FiXCircle, iconBg: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-600", link: "/inventory/out-of-stock" },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{loading ? "—" : card.value}</p>
                  {card.link && (
                    <Link to={card.link} className="text-xs font-semibold text-teal-600 hover:underline mt-1 inline-block">
                      View all →
                    </Link>
                  )}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg}`}>
                  <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
              </div>
            </div>
          ))}
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
            <div className="p-8"><TableLoading row={6} col={5} width={180} height={20} /></div>
          ) : error ? (
            <div className="p-10 text-center text-red-500">{error}</div>
          ) : products.length > 0 ? (
            <TableContainer className="rounded-none shadow-none border-none">
              <Table className="w-full">
                <TableHeader>
                  <tr className="bg-gray-50/70 dark:bg-gray-900/50 text-[10px] font-extrabold uppercase tracking-widest text-gray-500">
                    <TableCell className="py-4 px-6">Product</TableCell>
                    <TableCell className="py-4 px-6">Brand</TableCell>
                    <TableCell className="py-4 px-6 text-center">Stock</TableCell>
                    <TableCell className="py-4 px-6 text-center">Action</TableCell>
                  </tr>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-700/50">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gray-50 border overflow-hidden shrink-0">
                            {p.image?.[0] ? (
                              <img src={p.image[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiPackage className="text-gray-300 w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate max-w-[220px]">
                              {showingTranslateValue(p.title)}
                            </p>
                            {p.sku && <p className="text-[11px] text-gray-400 font-mono">SKU: {p.sku}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm text-gray-500">{formatText(p.brand?.name)}</TableCell>
                      <TableCell className="px-6 py-4 text-center">{stockBadge(p.stock ?? 0)}</TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleUpdate(p._id)}
                          className="h-9 w-9 inline-flex items-center justify-center border border-teal-200 text-teal-600 rounded-xl hover:bg-teal-600 hover:text-white transition-all"
                        >
                          <FiEdit size={14} />
                        </button>
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
                    label="Inventory pagination"
                  />
                )}
              </TableFooter>
            </TableContainer>
          ) : (
            <div className="p-10"><NotFound title="No products found." /></div>
          )}
        </div>
      </AnimatedContent>
    </>
  );
};

export default StockOverview;
