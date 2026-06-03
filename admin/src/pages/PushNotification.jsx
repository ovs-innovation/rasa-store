import {
  Button,
  Card,
  CardBody,
  Input,
  Pagination,
  Table,
  TableCell,
  TableContainer,
  TableFooter,
  TableHeader,
  Select,
  Textarea,
  Label,
} from "@windmill/react-ui";
import { useContext, useState, useEffect, useCallback } from "react";
import CustomerServices from "@/services/CustomerServices";
import { FiEdit, FiPlus, FiSearch, FiTrash2, FiDownload, FiInfo } from "react-icons/fi";
import { useTranslation } from "react-i18next";

//internal import
import { SidebarContext } from "@/context/SidebarContext";
import PushNotificationServices from "@/services/PushNotificationServices";
import useAsync from "@/hooks/useAsync";
import useToggleDrawer from "@/hooks/useToggleDrawer";
import useFilter from "@/hooks/useFilter";
import PageTitle from "@/components/Typography/PageTitle";
import DeleteModal from "@/components/modal/DeleteModal";
import BulkActionDrawer from "@/components/drawer/BulkActionDrawer";
import MainDrawer from "@/components/drawer/MainDrawer";
import TableLoading from "@/components/preloader/TableLoading";
import CheckBox from "@/components/form/others/CheckBox";
import PushNotificationTable from "@/components/push-notification/PushNotificationTable";
import PushNotificationDrawer from "@/components/drawer/PushNotificationDrawer";
import NotFound from "@/components/table/NotFound";
import AnimatedContent from "@/components/common/AnimatedContent";
import Uploader from "@/components/image-uploader/Uploader";
import usePushNotificationSubmit from "@/hooks/usePushNotificationSubmit";

const PushNotification = () => {
  const { t } = useTranslation();
  const { toggleDrawer, lang } = useContext(SidebarContext);

  const [activeId, setActiveId] = useState(null);
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [titleCount, setTitleCount] = useState(0);
  const [descCount, setDescCount] = useState(0);

  const {
    data,
    loading,
    error
  } = useAsync(PushNotificationServices.getAllPushNotifications);

  const { allId, serviceId, handleDeleteMany, handleUpdateMany } = useToggleDrawer();

  const {
    dataTable,
    serviceData,
    totalResults,
    resultsPerPage,
    handleChangePage,
    setSearchCoupon,
  } = useFilter(data);

  const {
    register,
    handleSubmit,
    onSubmit,
    errors,
    setImageUrl,
    imageUrl,
    isSubmitting,
    handleReset,
    setValue,
    watch,
    channels,
    toggleChannel,
    targetWatch,
  } = usePushNotificationSubmit(activeId);

  const loadCustomers = useCallback(async () => {
    setLoadingCustomers(true);
    try {
      const list = await CustomerServices.getAllCustomers({ searchText: "" });
      setCustomers(Array.isArray(list) ? list : []);
    } catch {
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  }, []);

  useEffect(() => {
    if (targetWatch === "Single") {
      loadCustomers();
    }
  }, [targetWatch, loadCustomers]);

  const titleValue = watch("title") || "";
  const descriptionValue = watch("description") || "";

  useEffect(() => {
    setTitleCount(titleValue.length);
  }, [titleValue]);

  useEffect(() => {
    setDescCount(descriptionValue.length);
  }, [descriptionValue]);

  const handleSelectAll = () => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(data?.map((li) => li._id));
    if (isCheckAll) {
      setIsCheck([]);
    }
  };

  const handleUpdate = (id) => {
    setActiveId(id);
    toggleDrawer();
  };

  return (
    <>
      <PageTitle>Notifications</PageTitle>

      <DeleteModal
        ids={allId}
        setIsCheck={setIsCheck}
        title="Selected Push Notification"
        service={PushNotificationServices}
      />

      <AnimatedContent>
        {/* Warning Alert */}
        <div className="bg-teal-50 border-l-4 border-teal-500 p-4 mb-6 rounded flex items-start gap-3">
          <FiInfo className="text-teal-600 h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm text-teal-900 space-y-1">
            <p className="font-semibold">Send offers &amp; alerts via Push + SMS + Email</p>
            <p>Push needs Firebase on server. SMS uses MSG91. Email uses Resend/Gmail from backend .env.</p>
          </div>
        </div>

        {/* Send Notification Form */}
        <Card className="mb-8 border border-gray-100 dark:border-gray-700 shadow-sm overflow-visible">
          <CardBody>
            <h2 className="text-xl font-semibold mb-1">Send Notification</h2>
            <p className="text-sm text-gray-500 mb-2 font-medium">
              Choose channels and audience — one customer or everyone.
            </p>
            <p className="text-xs text-teal-700 mb-6 font-medium">
              New images upload to Cloudinary:{" "}
              <strong>{import.meta.env.VITE_APP_CLOUD_NAME || "not set"}</strong>
              {" "}(check admin/.env). Old links from <code className="text-orange-600">dhqcwkpzp</code> in
              history will show 401 until you re-upload.
            </p>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-6 flex flex-wrap gap-4">
                <Label className="text-sm font-semibold w-full">Channels</Label>
                {[
                  { key: "push", label: "Push (Firebase)" },
                  { key: "sms", label: "SMS (MSG91)" },
                  { key: "email", label: "Email" },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={channels[key]}
                      onChange={() => toggleChannel(key)}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    {label}
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Type</Label>
                      <Select
                        {...register("notificationType")}
                        className="border-[#e5e7eb] focus:border-teal-400 focus:ring-0 h-10"
                      >
                        <option value="offer">Offer / Sale</option>
                        <option value="announcement">Announcement</option>
                        <option value="general">General</option>
                        <option value="order">Order update</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Zone</Label>
                      <Select
                        {...register("zone", { required: "Zone is required" })}
                        className="border-[#e5e7eb] focus:border-teal-400 focus:ring-0 h-10"
                      >
                        <option value="All">All</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Audience <span className="text-red-500">*</span></Label>
                      <Select
                        {...register("target", { required: "Target is required" })}
                        className="border-[#e5e7eb] focus:border-teal-400 focus:ring-0 h-10"
                      >
                        <option value="All">All users</option>
                        <option value="Customer">All customers</option>
                        <option value="Store">All retailers</option>
                        <option value="Driver">All drivers</option>
                        <option value="Single">Single customer</option>
                      </Select>
                    </div>
                  </div>

                  {targetWatch === "Single" && (
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Select customer <span className="text-red-500">*</span></Label>
                      <Select
                        {...register("customerId", {
                          required: targetWatch === "Single" ? "Customer is required" : false,
                        })}
                        className="border-[#e5e7eb] focus:border-teal-400 focus:ring-0 h-10"
                        disabled={loadingCustomers}
                      >
                        <option value="">— Choose customer —</option>
                        {customers.map((c) => (
                          <option key={c._id} value={c._id}>
                            {(c.name?.en || c.name || "User") +
                              (c.phone ? ` · ${c.phone}` : "") +
                              (c.email ? ` · ${c.email}` : "")}
                          </option>
                        ))}
                      </Select>
                      {errors.customerId && (
                        <span className="text-red-400 text-xs">{errors.customerId.message}</span>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Click Action URL (Optional)</Label>
                      <Input
                        {...register("clickAction")}
                        placeholder="https://farmacykart.com/products/example"
                        className="border-[#e5e7eb] focus:border-teal-400 focus:ring-0 h-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm font-semibold">Title <FiInfo className="inline ml-1 text-gray-300" /> <span className="text-red-500">*</span></Label>
                      </div>
                      <Textarea
                        {...register("title", {
                          required: "Title is required",
                          maxLength: { value: 100, message: "Maximum 100 characters" }
                        })}
                        placeholder="Type Title"
                        className="border-[#e5e7eb] focus:border-teal-400 focus:ring-0 min-h-[80px]"
                        onChange={(e) => {
                          setTitleCount(e.target.value.length);
                          setValue("title", e.target.value);
                        }}
                      />
                      <div className="flex justify-end">
                        <span className={`text-xs ${titleCount > 100 ? 'text-red-500' : 'text-gray-400'}`}>{titleCount}/100</span>
                      </div>
                      {errors.title && <span className="text-red-400 text-xs">{errors.title.message}</span>}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm font-semibold">Description <FiInfo className="inline ml-1 text-gray-300" /> <span className="text-red-500">*</span></Label>
                      </div>
                      <Textarea
                        {...register("description", {
                          required: "Description is required",
                          maxLength: { value: 200, message: "Maximum 200 characters" }
                        })}
                        placeholder="Type about the description"
                        className="border-[#e5e7eb] focus:border-teal-400 focus:ring-0 min-h-[80px]"
                        onChange={(e) => {
                          setDescCount(e.target.value.length);
                          setValue("description", e.target.value);
                        }}
                      />
                      <div className="flex justify-end">
                        <span className={`text-xs ${descCount > 200 ? 'text-red-500' : 'text-gray-400'}`}>{descCount}/200</span>
                      </div>
                      {errors.description && <span className="text-red-400 text-xs">{errors.description.message}</span>}
                    </div>
                  </div>
                </div>

                {/* Right Side: Image Uploader */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">Image</Label>
                  <p className="text-xs text-gray-400">Upload your cover image</p>
                  <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center min-h-[200px]">
                    <Uploader
                      setImageUrl={setImageUrl}
                      imageUrl={imageUrl}
                      folder="notifications"
                    />
                    <p className="text-[10px] text-gray-400 mt-4 text-center">JPEG, JPG, PNG, GIF, WEBP. Less Than 2MB <span className="font-bold">(2:1)</span></p>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 mt-8">
                <Button
                  type="button"
                  onClick={() => {
                    handleReset();
                    setActiveId(null);
                    setTitleCount(0);
                    setDescCount(0);
                  }}
                  className="px-14 h-[48px]  xl:w-[90px] bg-[#eef2f7] hover:bg-gray-200 text-white font-bold rounded-lg transition-colors border-none"
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 h-[48px] bg-[#007980] hover:bg-[#005f63] text-white font-bold rounded-lg transition-colors border-none"
                >
                  {isSubmitting ? "Sending..." : activeId ? "Update & Send" : "Save & Send"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Notification History Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-700 mb-0">Notification History</h3>
              <span className="bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 rounded-md text-sm text-gray-600 font-bold mb-0">
                {totalResults}
              </span>
            </div>



            <div className="flex items-center gap-3 w-full md:w-auto">

              <div className="relative w-full md:w-[220px] lg:w-[220px] xl:w-[320px]">
                <Input
                  type="text"
                  placeholder="Search by invoice or name..."
                  className="w-full h-14 pl-6 pr-16 rounded-full border border-gray-300 bg-white text-base placeholder-gray-400 focus:border-teal-400 focus:ring-0"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-1 flex items-center text-[#8fc3c9] hover:text-teal-600"
                >
                  <FiSearch className="text-[30px]" />
                </button>
              </div>

              <div className="relative w-full md:w-[50px] lg:w-[120px] xl:w-[150px]">

                <Select className="w-40 border-gray-300 focus:border-teal-400 focus:ring-0 h-12">
                  <option value="All">All</option>
                  <option value="Customer">Customer</option>
                  <option value="Driver">Driver</option>
                  <option value="Store">Store</option>



                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  layout="outline"
                  className="h-10 px-4 border-gray-300 text-gray-600 flex items-center gap-2 font-semibold"
                >
                  <FiDownload className="text-sm" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AnimatedContent>

      {loading ? (
        <TableLoading row={8} col={11} width={140} height={20} />
      ) : error ? (
        <span className="text-center mx-auto text-red-500">{error}</span>
      ) : serviceData?.length !== 0 ? (
        <TableContainer className="mb-8 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-800">
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
                <TableCell>SL</TableCell>
                <TableCell>Image</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>Push</TableCell>
                <TableCell>SMS</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell className="text-right">Action</TableCell>
              </tr>
            </TableHeader>
            <PushNotificationTable
              isCheck={isCheck}
              notifications={dataTable}
              setIsCheck={setIsCheck}
              handleUpdate={handleUpdate}
            />
          </Table>
          <TableFooter>
            <Pagination
              totalResults={totalResults}
              resultsPerPage={resultsPerPage}
              onChange={handleChangePage}
              label="Table navigation"
            />
          </TableFooter>
        </TableContainer>
      ) : (
        <NotFound title="Sorry, There are no notifications right now." />
      )}
      <MainDrawer>
        <PushNotificationDrawer id={activeId} />
      </MainDrawer>
    </>
  );
};

export default PushNotification;
