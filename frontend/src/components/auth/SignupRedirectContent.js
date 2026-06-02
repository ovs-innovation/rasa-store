import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";

const SignupRedirectContent = ({ onSuccess }) => (
  <div className="py-2 text-center">
    <p className="text-sm leading-relaxed text-slate-600">
      Create your account with mobile OTP in under a minute.
    </p>
    <Link
      href="/auth/signup"
      onClick={() => onSuccess?.()}
      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-store-600 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-store-700"
    >
      Continue to sign up
      <FiArrowRight className="text-lg" />
    </Link>
  </div>
);

export default SignupRedirectContent;
