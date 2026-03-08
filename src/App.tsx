import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ActivityTracker } from "@/components/ActivityTracker";
import { AnimatePresence } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import TierList from "./pages/TierList";
import Ratings from "./pages/Ratings";
import Classifications from "./pages/Classifications";
import ShipOMeter from "./pages/ShipOMeter";
import JudgementQuiz from "./pages/JudgementQuiz";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import Polls from "./pages/Polls";
import PollEdit from "./pages/PollEdit";
import PollVote from "./pages/PollVote";
import Profiles from "./pages/Profiles";
import PersonProfile from "./pages/PersonProfile";
import PendingApproval from "./pages/PendingApproval";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/pending-approval" element={<PageTransition><PendingApproval /></PageTransition>} />
        <Route path="/" element={<ProtectedRoute><PageTransition><Index /></PageTransition></ProtectedRoute>} />
        <Route path="/gallery" element={<ProtectedRoute><PageTransition><Gallery /></PageTransition></ProtectedRoute>} />
        <Route path="/tier-list" element={<ProtectedRoute><PageTransition><TierList /></PageTransition></ProtectedRoute>} />
        <Route path="/ratings" element={<ProtectedRoute><PageTransition><Ratings /></PageTransition></ProtectedRoute>} />
        <Route path="/classifications" element={<ProtectedRoute><PageTransition><Classifications /></PageTransition></ProtectedRoute>} />
        <Route path="/ship-o-meter" element={<ProtectedRoute><PageTransition><ShipOMeter /></PageTransition></ProtectedRoute>} />
        <Route path="/judgement-quiz" element={<ProtectedRoute><PageTransition><JudgementQuiz /></PageTransition></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/polls" element={<ProtectedRoute><PageTransition><Polls /></PageTransition></ProtectedRoute>} />
        <Route path="/polls/:id" element={<ProtectedRoute><PageTransition><PollVote /></PageTransition></ProtectedRoute>} />
        <Route path="/polls/:id/edit" element={<ProtectedRoute><PageTransition><PollEdit /></PageTransition></ProtectedRoute>} />
        <Route path="/profiles" element={<ProtectedRoute><PageTransition><Profiles /></PageTransition></ProtectedRoute>} />
        <Route path="/profiles/:id" element={<ProtectedRoute><PageTransition><PersonProfile /></PageTransition></ProtectedRoute>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ActivityTracker />
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
