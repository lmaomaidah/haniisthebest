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
  "/leaderboard": "Leaderboard",
};

function getReadablePageName(path: string): string {
  if (PAGE_NAMES[path]) return PAGE_NAMES[path];
  if (path.startsWith("/profiles/")) return "Person Profile";
  if (path.startsWith("/polls/") && path.includes("/edit")) return "Poll Editor";
  if (path.startsWith("/polls/") && path.includes("/vote")) return "Poll Voting";
  if (path.startsWith("/polls/")) return "Poll";
  return path;
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Edg")) browser = "Edge";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";

  let os = "Unknown";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "macOS";
  else if (ua.includes("Linux") && !ua.includes("Android")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (ua.includes("CrOS")) os = "ChromeOS";

  let device = "Desktop";
  if (/iPhone|iPod/.test(ua)) device = "iPhone";
  else if (/iPad/.test(ua)) device = "iPad";
  else if (/Android.*Mobile/.test(ua)) device = "Android Phone";
  else if (/Android/.test(ua)) device = "Android Tablet";
  else if (/Mobile/.test(ua)) device = "Mobile";

  const connection = (navigator as any).connection;
  const networkInfo = connection
    ? {
        type: connection.effectiveType || connection.type || "unknown",
        downlink: connection.downlink ? `${connection.downlink} Mbps` : undefined,
        save_data: connection.saveData || false,
      }
    : undefined;

  return {
    browser,
    os,
    device,
    screen_resolution: `${screen.width}x${screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    pixel_ratio: window.devicePixelRatio,
    language: navigator.language,
    languages: navigator.languages?.join(", "),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezone_offset: new Date().getTimezoneOffset(),
    platform: navigator.platform,
    cores: navigator.hardwareConcurrency || undefined,
    memory_gb: (navigator as any).deviceMemory || undefined,
    touch_support: navigator.maxTouchPoints > 0,
    online: navigator.onLine,
    network: networkInfo,
    color_scheme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  };
}

export function ActivityTracker() {
  const location = useLocation();
  const { user, logActivity } = useAuth();
  const lastTrackedPathRef = useRef<string>("");
  const sessionStartRef = useRef<number>(Date.now());
  const lastActivityRef = useRef<number>(Date.now());

  // Track session heartbeat — log how long users stay
  useEffect(() => {
    if (!user) return;
    sessionStartRef.current = Date.now();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const duration = Math.round((Date.now() - lastActivityRef.current) / 1000);
        if (duration > 5) {
          void logActivity("session_idle", {
            idle_after_seconds: duration,
            last_page: getReadablePageName(location.pathname),
          });
        }
      } else {
        lastActivityRef.current = Date.now();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [user, logActivity, location.pathname]);

  // Track page views with rich context
  useEffect(() => {
    if (!user) return;

    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    if (lastTrackedPathRef.current === currentPath) return;

    const previousPath = lastTrackedPathRef.current;
    lastTrackedPathRef.current = currentPath;
    lastActivityRef.current = Date.now();
    const pageName = getReadablePageName(location.pathname);
    const deviceInfo = getDeviceInfo();

    void logActivity("page_view", {
      page_name: pageName,
      page_path: currentPath,
      previous_page: previousPath || null,
      referrer: document.referrer || null,
      context: {
        page_path: location.pathname,
        page_url: window.location.href,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        client_time: new Date().toISOString(),
        ...deviceInfo,
      },
    });
  }, [location.pathname, location.search, location.hash, user, logActivity]);

  return null;
}
