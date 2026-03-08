import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ActivityTracker() {
  const location = useLocation();
  const { user, logActivity } = useAuth();
  const lastTrackedPathRef = useRef<string>("");

  useEffect(() => {
    if (!user) return;

    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    if (lastTrackedPathRef.current === currentPath) return;

    lastTrackedPathRef.current = currentPath;
    void logActivity("page_access", {
      page: currentPath,
      source: "router",
    });
  }, [location.pathname, location.search, location.hash, user, logActivity]);

  return null;
}
