import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const PAGE_NAMES: Record<string, string> = {
  "/": "Home",
  "/gallery": "Gallery",
  "/profiles": "Shrine Wall",
  "/tier-list": "Tier List",
  "/ratings": "Ratings",
  "/ship-o-meter": "Ship-O-Meter",
  "/venn-diagram": "Venn Diagram",
  "/classifications": "Classifications",
  "/judgement-quiz": "Judgement Quiz",
  "/polls": "Polls",
  "/admin": "Admin Dashboard",
  "/auth": "Login / Signup",
};

function getReadablePageName(path: string): string {
  // Direct match
  if (PAGE_NAMES[path]) return PAGE_NAMES[path];

  // Profile page
  if (path.startsWith("/profiles/")) return "Person Profile";

  // Poll pages
  if (path.startsWith("/polls/") && path.includes("/edit")) return "Poll Editor";
  if (path.startsWith("/polls/") && path.includes("/vote")) return "Poll Voting";
  if (path.startsWith("/polls/")) return "Poll";

  return path;
}

export function ActivityTracker() {
  const location = useLocation();
  const { user, logActivity } = useAuth();
  const lastTrackedPathRef = useRef<string>("");

  useEffect(() => {
    if (!user) return;

    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    if (lastTrackedPathRef.current === currentPath) return;

    lastTrackedPathRef.current = currentPath;
    const pageName = getReadablePageName(location.pathname);

    void logActivity("page_view", {
      page_name: pageName,
      page_path: currentPath,
    });
  }, [location.pathname, location.search, location.hash, user, logActivity]);

  return null;
}
