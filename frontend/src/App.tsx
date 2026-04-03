import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Vitals from "./pages/Vitals";
import DietExercise from "./pages/DietExercise";
import Settings from "./pages/Settings";
import Medications from "./pages/Medications";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import RiskPrediction from "./pages/RiskPrediction";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/layout/DashboardLayout";

const queryClient = new QueryClient();

const DashboardPage = ({ children }: { children: React.ReactNode }) => (
  <DashboardLayout>{children}</DashboardLayout>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<DashboardPage><Dashboard /></DashboardPage>} />
            <Route path="/vitals" element={<DashboardPage><Vitals /></DashboardPage>} />
            <Route path="/diet-exercise" element={<DashboardPage><DietExercise /></DashboardPage>} />
            <Route path="/settings" element={<DashboardPage><Settings /></DashboardPage>} />
            <Route path="/medications" element={<DashboardPage><Medications /></DashboardPage>} />
            <Route path="/notifications" element={<DashboardPage><Notifications /></DashboardPage>} />
            <Route path="/profile" element={<DashboardPage><Profile /></DashboardPage>} />
            <Route path="/risk-prediction" element={<DashboardPage><RiskPrediction /></DashboardPage>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
