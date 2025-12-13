import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import TierList from "./pages/TierList";
import Ratings from "./pages/Ratings";
import Classifications from "./pages/Classifications";
import ShipOMeter from "./pages/ShipOMeter";
import JudgementQuiz from "./pages/JudgementQuiz";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/tier-list" element={<TierList />} />
            <Route path="/ratings" element={<Ratings />} />
            <Route path="/classifications" element={<Classifications />} />
            <Route path="/ship-o-meter" element={<ShipOMeter />} />
            <Route path="/judgement-quiz" element={<JudgementQuiz />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
