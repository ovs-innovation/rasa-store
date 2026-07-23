import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
  const nextAuthToken = await getToken({ req: request });

  const userInfoCookie = request.cookies.get("userInfo");
  let cookieUserInfo = null;

  if (userInfoCookie?.value) {
    try {
      cookieUserInfo = JSON.parse(decodeURIComponent(userInfoCookie.value));
    } catch (e) {
      cookieUserInfo = null;
    }
  }

  const isAuthenticated = !!nextAuthToken || !!cookieUserInfo?.token;

  // Only account pages require login — checkout / order confirmation stay public
  if (!isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    const path = request.nextUrl.pathname;
    if (path.startsWith("/user")) {
      loginUrl.searchParams.set("redirectUrl", path.replace(/^\//, ""));
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*"],
};
