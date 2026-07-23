// dynamicSettings.js
import { QueryClient } from "@tanstack/react-query";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Facebook from "next-auth/providers/facebook";
import Credentials from "next-auth/providers/credentials";

import SettingServices from "@services/SettingServices";
import CustomerServices from "@services/CustomerServices";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const hasOAuthCreds = (id, secret) =>
  Boolean(String(id || "").trim() && String(secret || "").trim());

export const getDynamicAuthOptions = async () => {
  const storeSetting = await queryClient.fetchQuery({
    queryKey: ["storeSetting"],
    queryFn: async () => {
      try {
        return await SettingServices.getStoreSetting();
      } catch (error) {
        console.error("Error fetching store settings:", error);
        return {};
      }
    },
    staleTime: 4 * 60 * 1000,
  });

  const providers = [];

  // Only register OAuth providers with real credentials — empty IDs crash NextAuth
  if (hasOAuthCreds(storeSetting?.google_id, storeSetting?.google_secret)) {
    providers.push(
      Google({
        clientId: storeSetting.google_id,
        clientSecret: storeSetting.google_secret,
      })
    );
  }
  if (hasOAuthCreds(storeSetting?.github_id, storeSetting?.github_secret)) {
    providers.push(
      GitHub({
        clientId: storeSetting.github_id,
        clientSecret: storeSetting.github_secret,
      })
    );
  }
  if (hasOAuthCreds(storeSetting?.facebook_id, storeSetting?.facebook_secret)) {
    providers.push(
      Facebook({
        clientId: storeSetting.facebook_id,
        clientSecret: storeSetting.facebook_secret,
      })
    );
  }

  providers.push(
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const userInfo = await CustomerServices.loginCustomer(credentials);
          return userInfo;
        } catch (error) {
          const message =
            error.response?.data?.message || "Login failed! Please try again.";
          throw new Error(message);
        }
      },
    })
  );

  const authOptions = {
    providers,
    pages: {
      signIn: "/auth/login",
      error: "/auth/login",
    },
    session: {
      strategy: "jwt",
      maxAge: 24 * 60 * 60,
    },
    callbacks: {
      async signIn({ user, account }) {
        if (account.provider !== "credentials") {
          try {
            const res = await CustomerServices.signUpWithOauthProvider(user);

            if (res.token) {
              user.token = res.token;
              user._id = res._id;
              user.address = res.address;
              user.phone = res.phone;
              user.image = res.image;
            } else {
              console.error("OAuth sign-in: No token received");
              return false;
            }
          } catch (error) {
            console.error("OAuth sign-in exception:", error);
            return false;
          }
        }
        return true;
      },
      async jwt({ token, user, trigger, session }) {
        if (user) {
          token.id = user._id;
          token.name = user.name;
          token.email = user.email;
          token.address = user.address;
          token.phone = user.phone;
          token.image = user.image;
          token.token = user.token;
        }

        if (trigger === "update" && session) {
          return {
            ...token,
            ...session.user,
          };
        }

        return token;
      },
      async session({ session, token }) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.address = token.address;
        session.user.phone = token.phone;
        session.user.image = token.image;
        session.user.token = token.token;

        return session;
      },
      async redirect({ url, baseUrl }) {
        return url.startsWith(baseUrl) ? url : `${baseUrl}/user/dashboard`;
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
    logger: {
      error(code, metadata) {
        // Avoid console spam for missing session when user uses cookie JWT login
        if (code === "CLIENT_FETCH_ERROR") return;
        console.error("[next-auth]", code, metadata);
      },
    },
  };

  return authOptions;
};
