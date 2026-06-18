import React, { useState, useEffect } from "react";
import { Scrollbars } from "react-custom-scrollbars-2";
import {
  Button,
  Select,
  Textarea,
  Label,
  Input,
} from "@windmill/react-ui";
import { FiX, FiInfo } from "react-icons/fi";

// internal imports
import usePushNotificationSubmit from "@/hooks/usePushNotificationSubmit";
import Uploader from "@/components/image-uploader/Uploader";
import Error from "@/components/form/others/Error";

const PushNotificationDrawer = ({ id }) => {
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
  } = usePushNotificationSubmit(id);

  const titleValue = watch("title") || "";
  const descriptionValue = watch("description") || "";
  const [titleCount, setTitleCount] = useState(0);
  const [descCount, setDescCount] = useState(0);

  useEffect(() => {
    setTitleCount(titleValue.length);
  }, [titleValue]);

  useEffect(() => {
    setDescCount(descriptionValue.length);
  }, [descriptionValue]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          {id ? "Edit Send Notification" : "Create Notification"}
        </h4>
        {/* Note: Close button is handled by MainDrawer, but we can add one here if needed for symmetry */}
      </div>

      {/* Content */}
      <Scrollbars className="flex-grow">
        <form id="notification-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 pb-24">
          {/* Image Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <Label className="text-base font-bold text-gray-700 dark:text-gray-200 mb-1">Image</Label>
            <p className="text-xs text-gray-400 mb-4 font-medium">Upload your cover image</p>
            <div className="w-full border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all">
              <Uploader setImageUrl={setImageUrl} imageUrl={imageUrl} />
            </div>
          </div>

          {/* Title Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
             <div className="space-y-2">
                <Label className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1">
                  Title <FiInfo className="text-gray-400 text-sm" /> <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  {...register("title", {
                    required: "Title is required",
                    maxLength: { value: 100, message: "Maximum 100 characters" }
                  })}
                  placeholder="Hello customer"
                  className="w-full border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/30 focus:bg-white dark:focus:bg-gray-800 focus:border-teal-500 focus:ring-0 min-h-[80px] rounded-xl transition-all"
                />
                <div className="flex justify-end">
                  <span className={`text-xs font-bold ${titleCount > 100 ? 'text-red-500' : 'text-gray-400'}`}>
                    {titleCount}/100
                  </span>
                </div>
                <Error errorName={errors.title} />
             </div>

             <div className="space-y-2">
                <Label className="text-base font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1">
                  Description <FiInfo className="text-gray-400 text-sm" /> <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  {...register("description", {
                    required: "Description is required",
                    maxLength: { value: 200, message: "Maximum 200 characters" }
                  })}
                  placeholder="We just spotted your favourite festive products at a great deal."
                  className="w-full border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/30 focus:bg-white dark:focus:bg-gray-800 focus:border-teal-500 focus:ring-0 min-h-[120px] rounded-xl transition-all"
                />
                <div className="flex justify-end">
                  <span className={`text-xs font-bold ${descCount > 200 ? 'text-red-500' : 'text-gray-400'}`}>
                    {descCount}/200
                  </span>
                </div>
                <Error errorName={errors.description} />
             </div>
          </div>

          {/* Zones & Target Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-bold text-gray-700 dark:text-gray-200">Zones <span className="text-red-500">*</span></Label>
              <Select
                {...register("zone", { required: "Zone is required" })}
                className="w-full border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/30 focus:bg-white dark:focus:bg-gray-800 focus:border-teal-500 focus:ring-0 h-12 rounded-xl transition-all"
              >
                <option value="All">All zone</option>
              </Select>
              <Error errorName={errors.zone} />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-bold text-gray-700 dark:text-gray-200">Targeted User <span className="text-red-500">*</span></Label>
              <Select
                {...register("target", { required: "Target is required" })}
                className="w-full border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/30 focus:bg-white dark:focus:bg-gray-800 focus:border-teal-500 focus:ring-0 h-12 rounded-xl transition-all"
              >
                <option value="Customer">Customer</option>
                <option value="Store">Store</option>
                <option value="Driver">Driver</option>
              </Select>
              <Error errorName={errors.target} />
            </div>

            <div className="space-y-2">
              <Label className="text-base font-bold text-gray-700 dark:text-gray-200">Click Action URL (Optional)</Label>
              <Input
                {...register("clickAction")}
                placeholder="https://rasastore.com/products/example"
                className="w-full border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/30 focus:bg-white dark:focus:bg-gray-800 focus:border-teal-500 focus:ring-0 h-12 rounded-xl transition-all"
              />
            </div>
          </div>
        </form>
      </Scrollbars>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-4">
        <Button
          type="button"
          layout="outline"
          onClick={handleReset}
          className="flex-1 h-12 bg-gray-100 dark:bg-gray-700 border-none hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-all"
        >
          Reset
        </Button>
        <Button
          type="submit"
          form="notification-form"
          disabled={isSubmitting}
          className="flex-1 h-12 bg-[#007980] hover:bg-[#005f63] text-white font-bold rounded-xl shadow-md transition-all"
        >
          {isSubmitting ? "Updating..." : id ? "Update" : "Save"}
        </Button>
      </div>
    </div>
  );
};

export default PushNotificationDrawer;
