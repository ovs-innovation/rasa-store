import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import PushNotificationServices from "@/services/PushNotificationServices";
import { notifyError, notifySuccess } from "@/utils/toast";

const usePushNotificationSubmit = (id) => {
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("show");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [channels, setChannels] = useState({
    push: true,
    sms: true,
    email: true,
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      zone: "All",
      target: "Customer",
      notificationType: "offer",
      clickAction: "",
      customerId: "",
    },
  });

  const targetWatch = watch("target");

  const toggleChannel = (key) => {
    setChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onSubmit = async (data) => {
    if (!channels.push && !channels.sms && !channels.email) {
      notifyError("Select at least one channel: Push, SMS, or Email");
      return;
    }

    if (data.target === "Single" && !data.customerId) {
      notifyError("Please select a customer for single recipient");
      return;
    }

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
        notificationType: data.notificationType,
        customerId: data.target === "Single" ? data.customerId : undefined,
        channels,
      };

      if (id) {
        await PushNotificationServices.updatePushNotification(id, pushNotificationData);
        notifySuccess("Notification updated");
        setTimeout(() => window.location.reload(), 1500);
      } else {
        const res = await PushNotificationServices.addPushNotification(pushNotificationData);
        const pushN = res?.pushSentCount ?? 0;
        const smsN = res?.smsSentCount ?? 0;
        const emailN = res?.emailSentCount ?? 0;
        const total = pushN + smsN + emailN;

        if (total === 0) {
          notifyError(res?.message || "Nothing was delivered. Check server configuration.");
        } else {
          notifySuccess(
            `Delivered — Push: ${pushN}, SMS: ${smsN}, Email: ${emailN} (${res?.recipientCount || 0} users targeted)`
          );
          setTimeout(() => window.location.reload(), 2000);
        }
      }
    } catch (err) {
      notifyError(err?.response?.data?.message || err?.message || "Send failed");
    } finally {
      setIsSubmitting(false);
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
            setValue("notificationType", res.notificationType || "general");
            setValue("customerId", res.customerId?._id || res.customerId || "");
            setImageUrl(res.image);
            setStatus(res.status);
            if (res.channels) setChannels(res.channels);
          }
        } catch (err) {
          notifyError(err?.response?.data?.message || err?.message);
        }
      })();
    }
  }, [id, setValue]);

  const handleReset = () => {
    reset();
    setImageUrl("");
    setStatus("show");
    setChannels({ push: true, sms: true, email: true });
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
    channels,
    toggleChannel,
    targetWatch,
  };
};

export default usePushNotificationSubmit;
