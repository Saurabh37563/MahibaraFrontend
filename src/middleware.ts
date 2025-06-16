import { auth } from "./auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;


  const isPublicRoute = 
    nextUrl.pathname === "/login" || 
    nextUrl.pathname.startsWith("/api/auth") || 
    nextUrl.pathname.startsWith("/_next");

  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl.origin));
  }

  if (nextUrl.pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/agents", nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
