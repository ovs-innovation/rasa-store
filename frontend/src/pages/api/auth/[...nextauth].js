import NextAuth from "next-auth";
import { getDynamicAuthOptions } from "@lib/next-auth-options";

export default async function auth(req, res) {
  try {
    if (!process.env.NEXTAUTH_SECRET) {
      console.error("[next-auth] NEXTAUTH_SECRET is missing");
      return res.status(500).json({
        error: "Auth is temporarily unavailable. Please try again.",
      });
    }
    const options = await getDynamicAuthOptions();
    return await NextAuth(req, res, options);
  } catch (err) {
    console.error("[next-auth] handler error:", err);
    return res.status(500).json({
      error: "Auth is temporarily unavailable. Please try again.",
    });
  }
}
