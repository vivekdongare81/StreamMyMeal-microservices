import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import RestaurantList from "./pages/RestaurantList";
import LiveStreaming from "./pages/LiveStreaming";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/restaurants" element={<RestaurantList />} />
          <Route path="/live/:restaurantId" element={<LiveStreaming />} />
          <Route path="/live" element={<LiveStreaming />} />
          <Route path="/menu/:restaurantId" element={<Menu />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;