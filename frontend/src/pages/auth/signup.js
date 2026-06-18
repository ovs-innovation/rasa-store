import { useRouter } from "next/router";
import Layout from "@layout/Layout";
import AuthPageShell from "@components/auth/AuthPageShell";
import EmailLoginForm from "@components/auth/EmailLoginForm";

const SignUp = () => {
  const router = useRouter();

  return (
    <Layout title="Sign up">
      <AuthPageShell
        title="Create your account"
        subtitle="New customers only. Verify your email with OTP — it takes less than a minute."
        alternateLink={{
          text: "Already registered?",
          label: "Login here",
          href: { pathname: "/auth/login", query: { ...router.query } },
        }}
      >
        <EmailLoginForm variant="signup" />
      </AuthPageShell>
    </Layout>
  );
};

export default SignUp;
