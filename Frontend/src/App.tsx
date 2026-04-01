import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AppProvider } from "./contexts/AppContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Vitals from "./pages/Vitals";
import DietExercise from "./pages/DietExercise";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import RiskPrediction from "./pages/RiskPrediction";
import LifestylePlan from "./pages/LifestylePlan";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/layout/DashboardLayout";

const queryClient = new QueryClient();

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.3, ease: "easeOut" }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

const DashboardPage = ({ children }: { children: React.ReactNode }) => (
  <DashboardLayout>
    <PageTransition>{children}</PageTransition>
  </DashboardLayout>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Landing /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
        <Route path="/dashboard" element={<DashboardPage><Dashboard /></DashboardPage>} />
        <Route path="/vitals" element={<DashboardPage><Vitals /></DashboardPage>} />
        <Route path="/diet-exercise" element={<DashboardPage><DietExercise /></DashboardPage>} />
        <Route path="/settings" element={<DashboardPage><Settings /></DashboardPage>} />
        <Route path="/notifications" element={<DashboardPage><Notifications /></DashboardPage>} />
        <Route path="/profile" element={<DashboardPage><Profile /></DashboardPage>} />
        <Route path="/risk-prediction" element={<DashboardPage><RiskPrediction /></DashboardPage>} />
        <Route path="/ai-plan" element={<DashboardPage><LifestylePlan /></DashboardPage>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
