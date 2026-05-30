import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import PushNotificationServices from "@/services/PushNotificationServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const usePushNotificationSubmit = (id) => {
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("show");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      const pushNotificationData = {
        title: data.title,
        description: data.description,
        image: imageUrl,
        zone: data.zone,
        target: data.target,
        status: status,
        clickAction: data.clickAction,
      };

      if (id) {
        await PushNotificationServices.updatePushNotification(id, pushNotificationData);
        setIsSubmitting(false);
        notifySuccess("Notification sent successfully");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        await PushNotificationServices.addPushNotification(pushNotificationData);
        setIsSubmitting(false);
        notifySuccess("Notification sent successfully");
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err) {
      setIsSubmitting(false);
      notifyError(err ? err?.response?.data?.message : err?.message);
    }
  };

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const res = await PushNotificationServices.getPushNotificationById(id);
          if (res) {
            setValue("title", res.title);
            setValue("description", res.description);
            setValue("zone", res.zone);
            setValue("target", res.target);
            setValue("clickAction", res.clickAction);
            setImageUrl(res.image);
            setStatus(res.status);
          }
        } catch (err) {
          notifyError(err ? err?.response?.data?.message : err?.message);
        }
      })();
    }
  }, [id, setValue]);

  const handleReset = () => {
    reset();
    setImageUrl("");
    setStatus("show");
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    errors,
    setImageUrl,
    imageUrl,
    status,
    setStatus,
    isSubmitting,
    handleReset,
    setValue,
    watch,
  };
};

export default usePushNotificationSubmit;
