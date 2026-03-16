import { useEffect, useRef, useCallback } from "react";
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

function getScrollDepthPercent(): number {
  const docHeight = Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight
  );
  const viewportHeight = window.innerHeight;
  if (docHeight <= viewportHeight) return 100;
  const scrolled = window.scrollY + viewportHeight;
  return Math.min(100, Math.round((scrolled / docHeight) * 100));
}

export function ActivityTracker() {
  const location = useLocation();
  const { user, logActivity } = useAuth();
  const lastTrackedPathRef = useRef<string>("");
  const sessionStartRef = useRef<number>(Date.now());
  const lastActivityRef = useRef<number>(Date.now());
  const pageEnterTimeRef = useRef<number>(Date.now());
  const maxScrollDepthRef = useRef<number>(0);
  const clickCountRef = useRef<number>(0);
  const scrollCountRef = useRef<number>(0);

  // Log time spent on page when leaving
  const logPageExit = useCallback(() => {
    if (!user || !lastTrackedPathRef.current) return;
    const timeSpentSeconds = Math.round((Date.now() - pageEnterTimeRef.current) / 1000);
    if (timeSpentSeconds < 2) return; // Skip instant navigations

    void logActivity("page_exit", {
      page_name: getReadablePageName(location.pathname),
      page_path: lastTrackedPathRef.current,
      time_spent_seconds: timeSpentSeconds,
      max_scroll_depth_percent: maxScrollDepthRef.current,
      click_count: clickCountRef.current,
      scroll_interactions: scrollCountRef.current,
    });
  }, [user, logActivity, location.pathname]);

  // Track scroll depth
  useEffect(() => {
    if (!user) return;
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      const depth = getScrollDepthPercent();
      if (depth > maxScrollDepthRef.current) {
        maxScrollDepthRef.current = depth;
      }
      scrollCountRef.current++;
      lastActivityRef.current = Date.now();

      clearTimeout(scrollTimeout);
      // Log milestone scroll depths
      scrollTimeout = setTimeout(() => {
        if (maxScrollDepthRef.current >= 90 && maxScrollDepthRef.current <= 100) {
          void logActivity("scroll_bottom", {
            page_name: getReadablePageName(location.pathname),
            page_path: location.pathname,
            scroll_depth: maxScrollDepthRef.current,
          });
        }
      }, 1500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(scrollTimeout);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [user, logActivity, location.pathname]);

  // Track clicks on interactive elements
  useEffect(() => {
    if (!user) return;

    const handleClick = (e: MouseEvent) => {
      clickCountRef.current++;
      lastActivityRef.current = Date.now();

      const target = e.target as HTMLElement;
      const clickable = target.closest("a, button, [role='button'], [data-track]");
      if (!clickable) return;

      const trackLabel = clickable.getAttribute("data-track");
      const text = (clickable.textContent || "").trim().slice(0, 80);
      const tagName = clickable.tagName.toLowerCase();
      const href = (clickable as HTMLAnchorElement).href || undefined;
      const isExternal = href && !href.startsWith(window.location.origin);

      // Only log meaningful clicks, not every button
      if (trackLabel || isExternal) {
        void logActivity("user_click", {
          element: trackLabel || text || tagName,
          tag: tagName,
          href: isExternal ? href : undefined,
          is_external: !!isExternal,
          page_name: getReadablePageName(location.pathname),
          page_path: location.pathname,
        });
      }
    };

    document.addEventListener("click", handleClick, { passive: true });
    return () => document.removeEventListener("click", handleClick);
  }, [user, logActivity, location.pathname]);

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
        // Also log page exit on tab hide
        logPageExit();
      } else {
        lastActivityRef.current = Date.now();
        void logActivity("session_resume", {
          page_name: getReadablePageName(location.pathname),
          away_seconds: Math.round((Date.now() - lastActivityRef.current) / 1000),
        });
      }
    };

    const handleBeforeUnload = () => {
      logPageExit();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [user, logActivity, location.pathname, logPageExit]);

  // Track page views with rich context
  useEffect(() => {
    if (!user) return;

    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    if (lastTrackedPathRef.current === currentPath) return;

    // Log exit from previous page
    if (lastTrackedPathRef.current) {
      logPageExit();
    }

    const previousPath = lastTrackedPathRef.current;
    lastTrackedPathRef.current = currentPath;
    lastActivityRef.current = Date.now();
    pageEnterTimeRef.current = Date.now();
    maxScrollDepthRef.current = 0;
    clickCountRef.current = 0;
    scrollCountRef.current = 0;

    const pageName = getReadablePageName(location.pathname);
    const deviceInfo = getDeviceInfo();

    void logActivity("page_view", {
      page_name: pageName,
      page_path: currentPath,
      previous_page: previousPath || null,
      previous_page_name: previousPath ? getReadablePageName(previousPath.split("?")[0].split("#")[0]) : null,
      referrer: document.referrer || null,
      navigation_type: previousPath ? "internal" : "direct",
      tab_count: (window as any).performance?.navigation?.type === 1 ? "reload" : "navigate",
      context: {
        page_path: location.pathname,
        page_url: window.location.href,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        client_time: new Date().toISOString(),
        session_duration_seconds: Math.round((Date.now() - sessionStartRef.current) / 1000),
        ...deviceInfo,
      },
    });
  }, [location.pathname, location.search, location.hash, user, logActivity, logPageExit]);

  return null;
}
