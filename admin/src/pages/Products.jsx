import React, { useContext, useState } from "react";
import {
  Table,
  TableHeader,
  TableCell,
  TableFooter,
  TableContainer,
  Select,
  Input,
  Button,
  Card,
  CardBody,
  Pagination,
} from "@windmill/react-ui";
import { useTranslation } from "react-i18next";
import { FiPlus } from "react-icons/fi";
import { useHistory } from "react-router-dom";

//internal import

import useAsync from "@/hooks/useAsync";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import NotFound from "@/components/table/NotFound";
import ProductServices from "@/services/ProductServices";
import PageTitle from "@/components/Typography/PageTitle";
import { SidebarContext } from "@/context/SidebarContext";
import ProductTable from "@/components/product/ProductTable";
import MainDrawer from "@/components/drawer/MainDrawer";
import ProductDrawer from "@/components/drawer/ProductDrawer";
import CheckBox from "@/components/form/others/CheckBox";
import DeleteModal from "@/components/modal/DeleteModal";
import TableLoading from "@/components/preloader/TableLoading";
import SelectCategory from "@/components/form/selectOption/SelectCategory";
import AnimatedContent from "@/components/common/AnimatedContent";

const Products = () => {
  const { title, allId, serviceId } = useToggleDrawer();

  const { t } = useTranslation();
  const history = useHistory();
  const {
    toggleDrawer,
    lang,
    currentPage,
    handleChangePage,
    searchText,
    category,
    setCategory,
    productBrand,
    setProductBrand,
    searchRef,
    handleSubmitForAll,
    sortedField,
    setSortedField,
    status,
    setStatus,
    limitData,
  } = useContext(SidebarContext);

  const { data, loading, error } = useAsync(() =>
    ProductServices.getAllProducts({
      page: currentPage,
      limit: limitData,
      category: category,
      title: searchText,
      price: sortedField,
      brand: productBrand,
      status: status,
    })
  );

  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);

  const handleSelectAll = () => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(data?.products.map((li) => li._id));
    if (isCheckAll) {
      setIsCheck([]);
    }
  };
  // handle reset field
  const handleResetField = () => {
    setCategory("");
    setSortedField("");
    setProductBrand("");
    setStatus("");
    searchRef.current.value = "";
  };

  return (
    <>
      <PageTitle>{t("ProductsPage")}</PageTitle>
      <DeleteModal ids={allId} setIsCheck={setIsCheck} title={title} />
      <MainDrawer>
        <ProductDrawer id={serviceId} />
      </MainDrawer>
      <AnimatedContent>
        <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <div className="flex justify-end">
              <Button
                onClick={() => history.push("/products/add")}
                className="rounded-md h-12"
              >
                <span className="mr-2">
                  <FiPlus />
                </span>
                {t("AddProduct")}
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 rounded-t-lg rounded-0 mb-4">
          <CardBody>
            <form
              onSubmit={handleSubmitForAll}
              className="py-3 grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            >
              <Input
                ref={searchRef}
                type="search"
                name="search"
                placeholder="Search Product"
              />

              <SelectCategory setCategory={setCategory} lang={lang} />

              <Select
                value={status || ""}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">{t("StatusTbl")}</option>
                <option value="published">{t("PublishedTbl")}</option>
                <option value="unPublished">{t("Unpublished")}</option>
              </Select>

              <div className="flex items-center gap-2">
                <Button type="submit" className="h-12 flex-1 bg-store-700">
                  Filter
                </Button>
                <Button
                  layout="outline"
                  onClick={handleResetField}
                  type="reset"
                  className="h-12 dark:bg-gray-700"
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </AnimatedContent>

      {loading ? (
        <TableLoading row={12} col={7} width={160} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : data?.products?.length !== 0 ? (
        <TableContainer className="mb-8 rounded-b-lg overflow-x-scroll w-full custom-scrollbar">
          <Table className="w-full">
            <TableHeader>
              <tr>
                <TableCell>
                  <CheckBox
                    type="checkbox"
                    name="selectAll"
                    id="selectAll"
                    isChecked={isCheckAll}
                    handleClick={handleSelectAll}
                  />
                </TableCell>
                <TableCell>{t("ProductNameTbl")}</TableCell>
                <TableCell>{t("CategoryTbl")}</TableCell>
                <TableCell>MRP Price</TableCell>
                <TableCell>Sale Price</TableCell>
                <TableCell>{t("StockTbl")}</TableCell>
                <TableCell>{t("StatusTbl")}</TableCell>
                <TableCell className="text-center">{t("DetailsTbl")}</TableCell>
                <TableCell className="text-center">
                  {t("PublishedTbl")}
                </TableCell>
                <TableCell className="text-right">{t("ActionsTbl")}</TableCell>
              </tr>
            </TableHeader>
            <ProductTable
              lang={lang}
              isCheck={isCheck}
              products={data?.products}
              setIsCheck={setIsCheck}
            />
          </Table>
          <TableFooter>
            <Pagination
              totalResults={data?.totalDoc}
              resultsPerPage={limitData}
              onChange={handleChangePage}
              label="Product Page Navigation"
            />
          </TableFooter>
        </TableContainer>
      ) : (
        <NotFound title="Product" />
      )}
    </>
  );
};

export default Products;
