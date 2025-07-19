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
import AdminPanel from "./pages/AdminPanel";
import { AuthProvider } from "@/lib/authContext";
import Broadcaster from './pages/Broadcaster';
import Viewer from './pages/Viewer';

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
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
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/menu/:restaurantId" element={<Menu />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/broadcaster" element={<Broadcaster />} />
          <Route path="/viewer" element={<Viewer />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </AuthProvider>
);

export default App;