import { useSession } from "next-auth/react";

const getUserSession = () => {
  const { data } = useSession();
  return data?.user || null;
};

export { getUserSession };
