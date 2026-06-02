import { useRouter } from "next/router";
import Layout from "@layout/Layout";
import AuthPageShell from "@components/auth/AuthPageShell";
import PhoneLoginForm from "@components/auth/PhoneLoginForm";

const SignUp = () => {
  const router = useRouter();

  return (
    <Layout title="Sign up">
      <AuthPageShell
        title="Create your account"
        subtitle="New customers only. Verify your mobile with OTP — it takes less than a minute."
        alternateLink={{
          text: "Already registered?",
          label: "Login here",
          href: { pathname: "/auth/login", query: { ...router.query } },
        }}
      >
        <PhoneLoginForm variant="signup" />
      </AuthPageShell>
    </Layout>
  );
};

export default SignUp;
