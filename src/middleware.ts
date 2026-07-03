import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/workspaces(.*)",
  "/settings(.*)",
  "/api/repositories(.*)",
  "/api/workspaces(.*)",
  "/api/codex-runs(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)|\\.well-known/workflow/).*)",
    "/(api|trpc)(.*)",
  ],
};
