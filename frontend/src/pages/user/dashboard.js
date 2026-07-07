import dynamic from "next/dynamic";

import UserDashboardLayout from "@components/user/UserDashboardLayout";

const DashboardPage = () => (
  <UserDashboardLayout title="Dashboard" description="User Dashboard" />
);

export default dynamic(() => Promise.resolve(DashboardPage), { ssr: false });
