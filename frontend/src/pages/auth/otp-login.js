import { useEffect } from "react";
import { useRouter } from "next/router";

/** Legacy route — same phone login as /auth/login */
const OTPLoginRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const q = new URLSearchParams();
    Object.entries(router.query).forEach(([k, v]) => {
      if (k !== "slug" && v) q.set(k, String(v));
    });
    const suffix = q.toString() ? `?${q.toString()}` : "";
    router.replace(`/auth/login${suffix}`);
  }, [router.isReady, router.query]);

  return null;
};

export default OTPLoginRedirect;
