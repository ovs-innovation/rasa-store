import {
  Button,
  Card,
  CardBody,
  Input,
  Table,
  TableCell,
  TableContainer,
  TableHeader,
} from "@windmill/react-ui";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiPlus, FiTrash2 } from "react-icons/fi";

import AnimatedContent from "@/components/common/AnimatedContent";
import CheckBox from "@/components/form/others/CheckBox";
import SwitchToggle from "@/components/form/switch/SwitchToggle";
import MainDrawer from "@/components/drawer/MainDrawer";
import BrandDrawer from "@/components/drawer/BrandDrawer";
import PageTitle from "@/components/Typography/PageTitle";
import DeleteModal from "@/components/modal/DeleteModal";
import TableLoading from "@/components/preloader/TableLoading";
import NotFound from "@/components/table/NotFound";
import BrandTable from "@/components/brand/BrandTable";
import useAsync from "@/hooks/useAsync";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import { SidebarContext } from "@/context/SidebarContext";
import BrandServices from "@/services/BrandServices";
import SettingServices from "@/services/SettingServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const Brands = () => {
  const { toggleDrawer } = useContext(SidebarContext);
  const { data, loading, error } = useAsync(BrandServices.getAllBrands);
  const {
    handleDeleteMany,
    allId,
    serviceId,
    handleUpdate,
    handleModalOpen,
    title,
  } = useToggleDrawer();

  const { t } = useTranslation();

  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [homepageSectionEnabled, setHomepageSectionEnabled] = useState(true);
  const [savingHomepageSetting, setSavingHomepageSetting] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    SettingServices.getStoreCustomizationSetting()
      .then((res) => {
        const setting =
          res?.setting && typeof res.setting === "object" && !res?.rasaHomepage
            ? res.setting
            : res;
        const enabled = setting?.rasaHomepage?.brandsSectionEnabled;
        setHomepageSectionEnabled(enabled !== false);
      })
      .catch(() => {});
  }, []);

  const handleHomepageSectionToggle = async (checked) => {
    setHomepageSectionEnabled(checked);
    setSavingHomepageSetting(true);
    try {
      const res = await SettingServices.getStoreCustomizationSetting();
      const baseSetting =
        res?.setting && typeof res.setting === "object" && !res?.rasaHomepage
          ? res.setting
          : res || {};
      await SettingServices.updateStoreCustomizationSetting({
        name: "storeCustomizationSetting",
        setting: {
          ...baseSetting,
          rasaHomepage: {
            ...(baseSetting.rasaHomepage || {}),
            brandsSectionEnabled: checked,
          },
        },
      });
      notifySuccess(
        checked
          ? "Brands section will show on homepage"
          : "Brands section hidden from homepage"
      );
    } catch (err) {
      setHomepageSectionEnabled(!checked);
      notifyError(err?.response?.data?.message || "Failed to update homepage setting");
    } finally {
      setSavingHomepageSetting(false);
    }
  };

  const filteredBrands = useMemo(() => {
    if (!searchText) return data;
    return data?.filter((brand) =>
      brand?.name?.en
        ?.toLowerCase()
        ?.includes(searchText.toLowerCase().trim())
    );
  }, [data, searchText]);

  const handleSelectAll = () => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(data ? data.map((value) => value._id) : []);
    if (isCheckAll) {
      setIsCheck([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const value = e.target.elements.search.value;
    setSearchText(value);
  };

  return (
    <>
      <PageTitle>{t("BrandTitle")}</PageTitle>
      <DeleteModal
        id={serviceId}
        ids={allId}
        setIsCheck={setIsCheck}
        title={title || "Selected Brands"}
      />

      <MainDrawer>
        <BrandDrawer id={serviceId} />
      </MainDrawer>

      <AnimatedContent>
        <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  Homepage Brands Section
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Turn off to hide the entire Shop By Brand block on the storefront homepage.
                </p>
              </div>
              <SwitchToggle
                processOption={homepageSectionEnabled}
                handleProcess={handleHomepageSectionToggle}
              />
            </div>
            {savingHomepageSetting && (
              <p className="text-xs text-teal-600 mt-2">Saving...</p>
            )}
          </CardBody>
        </Card>

        <Card className="min-w-0 shadow-xs overflow-hidden bg-white dark:bg-gray-800 mb-5">
          <CardBody>
            <div className="flex flex-col md:flex-row gap-4">
              <form
                ref={formRef}
                id="brand-search-form"
                onSubmit={handleSearch}
                className="flex flex-1 items-center gap-3"
              >
                <Input
                  name="search"
                  type="search"
                  placeholder={t("SearchBrandPlaceholder")}
                />
                <Button type="submit" className="h-12 w-32 bg-store-700">
                  {t("Filter")}
                </Button>
                <Button
                  layout="outline"
                  type="reset"
                  onClick={() => {
                    setSearchText("");
                    formRef.current?.reset();
                  }}
                  className="h-12 w-32 text-sm dark:bg-gray-700"
                >
                  {t("Reset")}
                </Button>
              </form>

              <div className="flex gap-3">
                <Button
                  disabled={isCheck.length < 1}
                  onClick={() => handleDeleteMany(isCheck)}
                  className="w-full md:w-44 rounded-md h-12 bg-red-500 btn-red"
                >
                  <span className="mr-2">
                    <FiTrash2 />
                  </span>
                  {t("Delete")}
                </Button>
                <Button onClick={toggleDrawer} className="w-full md:w-48 h-12">
                  <span className="mr-2">
                    <FiPlus />
                  </span>
                  {t("AddBrand")}
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </AnimatedContent>

      {loading ? (
        <TableLoading row={6} col={6} width={180} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : filteredBrands?.length ? (
        <TableContainer className="mb-8">
          <Table>
            <TableHeader>
              <tr>
                <TableCell>
                  <CheckBox
                    type="checkbox"
                    name="selectAll"
                    id="selectAll"
                    handleClick={handleSelectAll}
                    isChecked={isCheckAll}
                  />
                </TableCell>
                <TableCell>{t("Id")}</TableCell>
                <TableCell>{t("BrandLogo")}</TableCell>
                <TableCell>{t("BrandName")}</TableCell>
                <TableCell>{t("BrandDescription")}</TableCell>
                <TableCell className="text-center">
                  {t("BrandFeatured")}
                </TableCell>
                <TableCell className="text-center">Homepage</TableCell>
                <TableCell className="text-center">{t("Published")}</TableCell>
                <TableCell className="text-right">{t("AAction")}</TableCell>
              </tr>
            </TableHeader>

            <BrandTable
              brands={filteredBrands}
              isCheck={isCheck}
              setIsCheck={setIsCheck}
              handleUpdate={handleUpdate}
              handleModalOpen={handleModalOpen}
              serviceId={serviceId}
              title={title}
            />
          </Table>
        </TableContainer>
      ) : (
        <NotFound title="Sorry, There are no brands right now." />
      )}
    </>
  );
};

export default Brands;

