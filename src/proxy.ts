import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_PREFIXES = ["/auth", "/api/auth"];

function isPublicPath(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isBookingPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 1 && segments[0] !== "auth" && segments[0] !== "dashboard" && segments[0] !== "api") {
    return true;
  }
  if (segments.length === 2 && segments[1] === "reserva-exitosa") {
    return true;
  }
  return false;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (isPublicPath(pathname) || isBookingPath(pathname)) {
    if (isLoggedIn && pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
