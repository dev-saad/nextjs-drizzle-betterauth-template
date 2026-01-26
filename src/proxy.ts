// src/proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./actions/server/session.controllers";
import { QUERY_KEYS, ROUTES } from "./lib/constants/routes";

export async function proxy(request: NextRequest) {
 const { pathname } = request.nextUrl;
 const session = await getSession();
 const isLoggedIn = !!session;
 const isApiWebhooks = pathname.startsWith("/api/webhooks");
 const cookieStore = request.cookies;
 const isBetterAuth2FACookie = cookieStore.get("better-auth.two_factor");

 // Check for two-factor routes - block if 2FA cookie is not present
 const isTwoFactorRoute = pathname.startsWith("/two-factor");
 if (isTwoFactorRoute && !isBetterAuth2FACookie) {
  return NextResponse.redirect(new URL(ROUTES.SIGN_IN, request.url));
 }

 const isAuthRoute = [
  ROUTES.SIGN_IN,
  ROUTES.SIGN_UP,
  ROUTES.RESET_PASSWORD,
  ROUTES.REQUEST_RESET_PASSWORD,
  ROUTES.TWO_FACTOR_VERIFICATION,
  ROUTES.TWO_FACTOR_OPTIONS,
  "/api/email/",
 ].some((route) => pathname.startsWith(route));

 const isPublicRoute = ["/api/email/", "/api/auth/"].some((route) =>
  pathname.startsWith(route),
 );

 if (isApiWebhooks || isPublicRoute) {
  return NextResponse.next();
 }

 if (isAuthRoute) {
  if (isLoggedIn) {
   return NextResponse.redirect(new URL(ROUTES.ORGANIZATION.ROOT, request.url));
  }
  return NextResponse.next();
 }

 if (!isLoggedIn) {
  const signInUrl = new URL(ROUTES.SIGN_IN, request.url);
  signInUrl.searchParams.set(QUERY_KEYS.redirectTo, pathname);
  return NextResponse.redirect(signInUrl);
 }

 return NextResponse.next();
}

export const config = {
 // matcher: ["/sign-in", "/sign-up", "/organization/:path*", "/onboarding"],
 matcher: [
  // "/sign-in",
  // "/sign-up",
  // "/organization/:path*",
  // "/onboarding",
  "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
 ],
};
