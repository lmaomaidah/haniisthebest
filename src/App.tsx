import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { HackedOverlay } from "@/components/HackedOverlay";
import { useToast } from "@/hooks/use-toast";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function HackedToast() {
  const { toast } = useToast();
  useEffect(() => {
    toast({ title: ">_ INTRUSION DETECTED", description: "CHAOS HUSTLERS have entered the system.", variant: "destructive" });
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HackedOverlay />
          <HackedToast />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
              <Route path="/tier-list" element={<ProtectedRoute><TierList /></ProtectedRoute>} />
              <Route path="/ratings" element={<ProtectedRoute><Ratings /></ProtectedRoute>} />
              <Route path="/classifications" element={<ProtectedRoute><Classifications /></ProtectedRoute>} />
              <Route path="/ship-o-meter" element={<ProtectedRoute><ShipOMeter /></ProtectedRoute>} />
              <Route path="/judgement-quiz" element={<ProtectedRoute><JudgementQuiz /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/polls" element={<ProtectedRoute><Polls /></ProtectedRoute>} />
              <Route path="/polls/:id" element={<ProtectedRoute><PollVote /></ProtectedRoute>} />
              <Route path="/polls/:id/edit" element={<ProtectedRoute><PollEdit /></ProtectedRoute>} />
              <Route path="/profiles" element={<ProtectedRoute><Profiles /></ProtectedRoute>} />
              <Route path="/profiles/:id" element={<ProtectedRoute><PersonProfile /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
